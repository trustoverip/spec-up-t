/**
 * @file Main module for terminology section utility container functionality
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-08-31
 * @description Coordinates search and local/remote filters for the terminology section.
 * Gated by an Experimental toggle in the slide-in settings menu (default off).
 */

/** localStorage key used to persist the terms utility bar toggle state */
const TERMS_UTILITY_BAR_STORAGE_KEY = 'spec-up-t:terms-utility-bar';

/**
 * Checks if the terms search and filter bar is enabled via localStorage.
 * Missing or any value other than 'true' means the feature is off.
 *
 * @returns {boolean} True if the utility bar should be shown
 */
function isTermsUtilityBarEnabled() {
    return localStorage.getItem(TERMS_UTILITY_BAR_STORAGE_KEY) === 'true';
}

/**
 * Wires the Experimental toggle in the slide-in settings menu.
 * Reads persisted state from localStorage and reflects it in the checkbox.
 * On change: saves the new state and reloads the page so the bar is built or removed.
 */
function initTermsUtilityBarToggle() {
    const toggle = document.getElementById('toggle-terms-utility-bar');
    if (!toggle) {
        return;
    }

    toggle.checked = isTermsUtilityBarEnabled();

    toggle.addEventListener('change', () => {
        localStorage.setItem(TERMS_UTILITY_BAR_STORAGE_KEY, toggle.checked ? 'true' : 'false');
        globalThis.location.reload();
    });
}

/**
 * Builds the terminology utility bar (term count, local/remote filters, search)
 * and attaches the filter and search behaviours.
 */
function initializeTerminologyUtilityContainer() {
    const termsListElement = document.querySelector(".terms-and-definitions-list");
    const dtElements = termsListElement ? termsListElement.querySelectorAll("dt") : [];

    if (dtElements.length === 0) {
        hideShowUtilityContainer();
        return;
    }

    const terminologySectionUtilityContainer = document.getElementById("terminology-section-utility-container");
    if (!terminologySectionUtilityContainer) {
        return;
    }

    /*************************************************/
    /* DOM CONSTRUCTION - COMPLETE LAYOUT STRUCTURE */
    /*************************************************/

    /* ===== ROW: UTILITIES (TERM COUNT + FILTERS + SEARCH) ===== */
    const utilityRow = document.createElement("div");
    utilityRow.className = "row g-2";
    utilityRow.id = "utility-row";

    // Left column: Term count
    const leftCol = document.createElement("div");
    leftCol.className = "col-auto d-flex align-items-center";

    const numberOfTerms = document.createElement("small");
    numberOfTerms.className = "text-muted mb-0";
    numberOfTerms.textContent = `${dtElements.length} terms`;
    leftCol.appendChild(numberOfTerms);

    // Center column: Filters
    const centerCol = document.createElement("div");
    centerCol.className = "col d-flex flex-wrap align-items-center gap-3";

    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.className = 'd-flex gap-3';

    const localTermsCheckboxDiv = document.createElement('div');
    localTermsCheckboxDiv.className = 'form-check';
    localTermsCheckboxDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" id="showLocalTermsCheckbox" checked>
        <label class="form-check-label" for="showLocalTermsCheckbox">
            Local
        </label>
    `;

    const externalTermsCheckboxDiv = document.createElement('div');
    externalTermsCheckboxDiv.className = 'form-check';
    externalTermsCheckboxDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" id="showExternalTermsCheckbox" checked>
        <label class="form-check-label" for="showExternalTermsCheckbox">
            Remote
        </label>
    `;

    checkboxesContainer.appendChild(localTermsCheckboxDiv);
    checkboxesContainer.appendChild(externalTermsCheckboxDiv);
    centerCol.appendChild(checkboxesContainer);

    // Right column: Search
    const rightCol = document.createElement("div");
    rightCol.className = "col-auto d-flex justify-content-end";

    const searchContainer = document.createElement("div");
    searchContainer.setAttribute("id", "container-search");
    searchContainer.classList.add("input-group", "input-group-sm");
    searchContainer.setAttribute("role", "search");

    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "search");
    searchInput.setAttribute("id", "search");
    searchInput.classList.add("form-control");
    searchInput.setAttribute("placeholder", "Filter terms");
    searchInput.setAttribute("aria-label", "Search terms");
    searchInput.setAttribute("aria-describedby", "total-matches-search");
    searchInput.setAttribute("autocomplete", "off");
    searchContainer.appendChild(searchInput);

    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("input-group-text", "p-0");

    const goToPreviousMatchButton = document.createElement("button");
    goToPreviousMatchButton.setAttribute("id", "one-match-backward-search");
    goToPreviousMatchButton.classList.add("btn", "btn-outline-secondary");
    goToPreviousMatchButton.setAttribute("type", "button");
    goToPreviousMatchButton.setAttribute("disabled", "true");
    goToPreviousMatchButton.setAttribute("title", "Go to previous match (Left Arrow)");
    goToPreviousMatchButton.setAttribute("aria-label", "Go to previous match");
    goToPreviousMatchButton.innerHTML = '<span aria-hidden="true">▲</span>';
    buttonGroup.appendChild(goToPreviousMatchButton);

    const goToNextMatchButton = document.createElement("button");
    goToNextMatchButton.setAttribute("id", "one-match-forward-search");
    goToNextMatchButton.classList.add("btn", "btn-outline-secondary");
    goToNextMatchButton.setAttribute("type", "button");
    goToNextMatchButton.setAttribute("disabled", "true");
    goToNextMatchButton.setAttribute("title", "Go to next match (Right Arrow)");
    goToNextMatchButton.setAttribute("aria-label", "Go to next match");
    goToNextMatchButton.innerHTML = '<span aria-hidden="true">▼</span>';
    buttonGroup.appendChild(goToNextMatchButton);

    const totalMatchesSpan = document.createElement("span");
    totalMatchesSpan.setAttribute("id", "total-matches-search");
    totalMatchesSpan.classList.add("input-group-text");
    totalMatchesSpan.innerHTML = "0 matches";
    totalMatchesSpan.setAttribute("aria-live", "polite");
    totalMatchesSpan.setAttribute("role", "status");
    searchContainer.appendChild(totalMatchesSpan);

    searchContainer.appendChild(buttonGroup);
    rightCol.appendChild(searchContainer);

    utilityRow.appendChild(leftCol);
    utilityRow.appendChild(centerCol);
    utilityRow.appendChild(rightCol);

    terminologySectionUtilityContainer.appendChild(utilityRow);

    // Keep hash navigation offset in sync with sticky utility UI height.
    const updateAnchorScrollOffset = () => {
        const stickyBottom = terminologySectionUtilityContainer.getBoundingClientRect().bottom;
        const offset = Math.max(72, Math.ceil(stickyBottom + 12));
        document.documentElement.style.setProperty('--anchor-scroll-offset', `${offset}px`);
    };

    let resizeRafId = null;
    const scheduleOffsetUpdate = () => {
        if (resizeRafId !== null) {
            return;
        }
        resizeRafId = requestAnimationFrame(() => {
            resizeRafId = null;
            updateAnchorScrollOffset();
        });
    };

    updateAnchorScrollOffset();
    globalThis.addEventListener('resize', scheduleOffsetUpdate, { passive: true });

    /*****************************************/
    /* INITIALIZE FUNCTIONALITY COMPONENTS  */
    /*****************************************/

    attachTermFilterFunctionality(checkboxesContainer);
    attachSearchFunctionality(searchInput, goToPreviousMatchButton, goToNextMatchButton, totalMatchesSpan);
}

document.addEventListener("DOMContentLoaded", function () {
    initTermsUtilityBarToggle();

    if (!isTermsUtilityBarEnabled()) {
        hideShowUtilityContainer();
        return;
    }

    initializeTerminologyUtilityContainer();
});
