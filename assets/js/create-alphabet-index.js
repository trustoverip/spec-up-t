/**
 * @file This file creates an alphabet index for the terms
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @since 2024-09-19
 */
function createAlphabetIndex() {
    // Check if the terms and definitions list exists
    // If it doesn't exist, exit the function
    // This prevents errors when the script is run on pages without the terms and definitions list
    // and ensures that the script only runs when necessary
    const termsListElement = document.querySelector(".terms-and-definitions-list");
    const dtElements = termsListElement ? termsListElement.querySelectorAll("dt") : [];
    
    if (dtElements.length === 0) {
        return;
    }
    
    const terminologySectionUtilityContainer = document.getElementById("terminology-section-utility-container");
    const alphabetIndex = {};

    dtElements.forEach(dt => {
        const span = dt.querySelector("span");
        if (span?.id) {
            const termId = span.id;
            const firstChar = termId.charAt(termId.indexOf("term:") + 5).toUpperCase();
            if (!alphabetIndex[firstChar]) {
                alphabetIndex[firstChar] = span.id;
            }
        }
    });

    // Create first row for alphabet index using Bootstrap classes
    const alphabetRow = document.createElement("div");
    alphabetRow.className = "row mb-2";
    
    const alphabetCol = document.createElement("div");
    alphabetCol.className = "col-12";
    
    const alphabetIndexContainer = document.createElement("div");
    alphabetIndexContainer.className = "d-flex flex-wrap justify-content-center gap-2";

    // Create second row for everything else using Bootstrap classes
    const utilityRow = document.createElement("div");
    utilityRow.className = "row";
    utilityRow.id = "utility-row";
    
    const utilityCol = document.createElement("div");
    utilityCol.className = "col-12 d-flex flex-wrap justify-content-between align-items-center gap-2";

    // Create number of terms element for second row
    const numberOfTerms = document.createElement("small");
    numberOfTerms.className = "text-muted mb-0";
    numberOfTerms.textContent = `${dtElements.length} terms`;

    utilityCol.appendChild(numberOfTerms);

    /*
        The key advantage of localeCompare over simple comparison operators (<, >) is that it:
        - Properly handles language-specific sorting rules (via locale settings)
        - Correctly compares strings containing special characters or accents
        - Can be configured to be case-insensitive
    */
    Object.keys(alphabetIndex).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).forEach(char => {
        const link = document.createElement("a");
        link.href = `#${alphabetIndex[char]}`;
        link.textContent = char;
        link.className = "btn btn-outline-secondary btn-sm";
        alphabetIndexContainer.appendChild(link);
    });
    
    // Assemble the structure
    alphabetCol.appendChild(alphabetIndexContainer);
    alphabetRow.appendChild(alphabetCol);
    
    utilityRow.appendChild(utilityCol);
    
    terminologySectionUtilityContainer.appendChild(alphabetRow);
    terminologySectionUtilityContainer.appendChild(utilityRow);
}

document.addEventListener("DOMContentLoaded", function () {
    createAlphabetIndex();
});
