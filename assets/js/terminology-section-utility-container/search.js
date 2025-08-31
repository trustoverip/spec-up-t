/**
 * @file In-page search functionality for terminology section
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-08-31
 * @description Adds instant search functionality with highlighting and navigation
 */

/**
 * Initializes the search functionality
 * @returns {void}
 */
function initializeSearch() {
    // Check if the terms and definitions list exists
    const termsListElement = document.querySelector(".terms-and-definitions-list");
    const dtElements = termsListElement ? termsListElement.querySelectorAll("dt") : [];

    if (dtElements.length === 0) {
        return;
    }

    const terminologySectionUtilityContainer = document.getElementById("terminology-section-utility-container");

    // Find the utility row (second row) created by alphabet index
    let utilityRow = terminologySectionUtilityContainer.querySelector('#utility-row .col-12');
    if (!utilityRow) {
        // If it doesn't exist yet, create the structure
        const row = document.createElement("div");
        row.className = "row";
        row.id = "utility-row";
        
        utilityRow = document.createElement("div");
        utilityRow.className = "col-12 d-flex flex-wrap justify-content-between align-items-center gap-2";
        
        row.appendChild(utilityRow);
        terminologySectionUtilityContainer.appendChild(row);
    }

    /*****************/
    /* CONFIGURATION */
    const matchesStyle = specConfig.searchHighlightStyle || 'ssi';
    const antiNameCollisions = 'search';
    const debounceTime = 600;
    const matches = 'matches';
    const searchBarPlaceholder = '🔍';
    const searchableContent = document.querySelector('.terms-and-definitions-list');

    // Styling of search matches
    const matchesStyleSelector = {
        dif: 'highlight-matches-DIF-search',
        toip: 'highlight-matches-ToIP-search',
        btc: 'highlight-matches-BTC-search',
        keri: 'highlight-matches-KERI-search',
        ssi: 'highlight-matches-SSI-search',
        gleif: 'highlight-matches-GLEIF-search'
    };

    const matchesClassName = "highlight-matches-" + antiNameCollisions;
    const matchesStyleSelectorClassName = matchesStyleSelector[matchesStyle.toLowerCase()];
    
    let totalMatches = 0;
    let activeMatchIndex = -1;
    let debounceTimeout;

    /* Create DOM elements */
    const searchContainer = document.createElement("div");
    searchContainer.setAttribute("id", `container-${antiNameCollisions}`);
    searchContainer.classList.add("input-group", "input-group-sm");
    searchContainer.setAttribute("role", "search");
    searchContainer.style.maxWidth = "300px";

    // Search input
    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("id", antiNameCollisions);
    searchInput.classList.add("form-control");
    searchInput.setAttribute("placeholder", searchBarPlaceholder);
    searchInput.setAttribute("aria-label", "Search terms");
    searchInput.setAttribute("autocomplete", "off");
    searchContainer.appendChild(searchInput);

    // Button group
    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("input-group-text", "p-0");

    // Previous button
    const goToPreviousMatchButton = document.createElement("button");
    goToPreviousMatchButton.setAttribute("id", `one-match-backward-${antiNameCollisions}`);
    goToPreviousMatchButton.classList.add("btn", "btn-outline-secondary");
    goToPreviousMatchButton.setAttribute("type", "button");
    goToPreviousMatchButton.setAttribute("disabled", "true");
    goToPreviousMatchButton.setAttribute("title", "Go to previous match (Left Arrow)");
    goToPreviousMatchButton.setAttribute("aria-label", "Go to previous match");
    goToPreviousMatchButton.innerHTML = '<span aria-hidden="true">▲</span>';
    buttonGroup.appendChild(goToPreviousMatchButton);

    // Next button
    const goToNextMatchButton = document.createElement("button");
    goToNextMatchButton.setAttribute("id", `one-match-forward-${antiNameCollisions}`);
    goToNextMatchButton.classList.add("btn", "btn-outline-secondary");
    goToNextMatchButton.setAttribute("type", "button");
    goToNextMatchButton.setAttribute("disabled", "true");
    goToNextMatchButton.setAttribute("title", "Go to next match (Right Arrow)");
    goToNextMatchButton.setAttribute("aria-label", "Go to next match");
    goToNextMatchButton.innerHTML = '<span aria-hidden="true">▼</span>';
    buttonGroup.appendChild(goToNextMatchButton);

    // Matches counter
    const totalMatchesSpan = document.createElement("span");
    totalMatchesSpan.setAttribute("id", `total-matches-${antiNameCollisions}`);
    totalMatchesSpan.classList.add("input-group-text");
    totalMatchesSpan.innerHTML = `0 ${matches}`;
    totalMatchesSpan.setAttribute("aria-live", "polite");
    totalMatchesSpan.setAttribute("role", "status");
    searchContainer.appendChild(totalMatchesSpan);

    searchContainer.appendChild(buttonGroup);
    utilityRow.appendChild(searchContainer);

    /* Helper functions */
    function setTotalMatches() {
        totalMatches = document.querySelectorAll('.' + matchesStyleSelectorClassName).length;
        totalMatchesSpan.innerHTML = `${totalMatches} ${matches}`;
    }

    function handleBackAndForthButtonsDisabledState() {
        const hasMatches = totalMatches > 0;
        goToPreviousMatchButton.disabled = !hasMatches;
        goToNextMatchButton.disabled = !hasMatches;
    }

    function scrollToElementCenter(element) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function removeHighlights() {
        const highlighted = document.querySelectorAll('.' + matchesStyleSelectorClassName);
        highlighted.forEach(element => {
            const parent = element.parentNode;
            parent.replaceChild(document.createTextNode(element.textContent), element);
            parent.normalize();
        });
    }

    function highlightMatches(query) {
        if (!query.trim()) {
            removeHighlights();
            setTotalMatches();
            handleBackAndForthButtonsDisabledState();
            return;
        }

        removeHighlights();
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi');
        
        function searchNodes(node) {
            if (node.nodeType === 3) { // Text node
                const text = node.textContent;
                if (regex.test(text)) {
                    const fragments = document.createDocumentFragment();
                    let lastIndex = 0;
                    let match;
                    
                    regex.lastIndex = 0; // Reset regex
                    while ((match = regex.exec(text)) !== null) {
                        // Add text before match
                        if (match.index > lastIndex) {
                            fragments.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                        }
                        
                        // Add highlighted match
                        const span = document.createElement('span');
                        span.className = matchesStyleSelectorClassName;
                        span.textContent = match[0];
                        fragments.appendChild(span);
                        
                        lastIndex = regex.lastIndex;
                    }
                    
                    // Add remaining text
                    if (lastIndex < text.length) {
                        fragments.appendChild(document.createTextNode(text.slice(lastIndex)));
                    }
                    
                    node.parentNode.replaceChild(fragments, node);
                }
            } else if (node.nodeType === 1) { // Element node
                Array.from(node.childNodes).forEach(searchNodes);
            }
        }

        searchNodes(searchableContent);
        setTotalMatches();
        handleBackAndForthButtonsDisabledState();
        activeMatchIndex = -1;
        
        // Scroll to first match
        const firstHighlight = document.querySelector('.' + matchesStyleSelectorClassName);
        if (firstHighlight) {
            scrollToElementCenter(firstHighlight);
        }
    }

    function debouncedSearchAndHighlight(query, shouldScrollToFirstMatch = false) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            highlightMatches(query);
        }, debounceTime);
    }

    function navigateMatches(direction) {
        const allMatches = document.querySelectorAll('.' + matchesStyleSelectorClassName);
        if (allMatches.length === 0) return;

        if (direction === 'next') {
            activeMatchIndex = (activeMatchIndex + 1) % allMatches.length;
        } else {
            activeMatchIndex = activeMatchIndex <= 0 ? allMatches.length - 1 : activeMatchIndex - 1;
        }

        // Remove previous active styling
        allMatches.forEach(match => match.classList.remove('active-match'));
        
        // Add active styling and scroll to current match
        allMatches[activeMatchIndex].classList.add('active-match');
        scrollToElementCenter(allMatches[activeMatchIndex]);
    }

    /* Event listeners */
    searchInput.addEventListener("input", function () {
        debouncedSearchAndHighlight(searchInput.value, true);
    });

    goToNextMatchButton.addEventListener('click', () => navigateMatches('next'));
    goToPreviousMatchButton.addEventListener('click', () => navigateMatches('prev'));

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (document.activeElement === searchInput) {
            if (event.key === 'ArrowDown' && totalMatches > 0) {
                event.preventDefault();
                navigateMatches('next');
            } else if (event.key === 'ArrowUp' && totalMatches > 0) {
                event.preventDefault();
                navigateMatches('prev');
            }
        }
    });

    // Re-run search when definitions are collapsed/expanded
    document.addEventListener('click', event => {
        if (event.target.classList.contains('collapse-all-defs-button')) {
            debouncedSearchAndHighlight(searchInput.value, true);
        }
    });
}
