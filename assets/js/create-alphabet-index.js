/**
 * @file This file creates an alphabet index for the terms
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @since 2024-09-19
 */
function createAlphabetIndex() {
    const terminologySectionUtilityContainer = document.getElementById("terminology-section-utility-container");
    const termsListElement = document.querySelector(".terms-and-definitions-list");
    const dtElements = termsListElement.querySelectorAll("dt");
    const alphabetIndex = {};

    dtElements.forEach(dt => {
        const span = dt.querySelector("span");
        if (span && span.id) {
            const termId = span.id;
            const firstChar = termId.charAt(termId.indexOf("term:") + 5).toUpperCase();
            if (!alphabetIndex[firstChar]) {
                alphabetIndex[firstChar] = span.id;
            }
        }
    });

    const alphabetIndexContainer = document.createElement("div");
    alphabetIndexContainer.className = "alphabet-index-container";

    // Create number of terms element
    const numberOfTerms = document.createElement("p");
    numberOfTerms.className = "number-of-terms";
    numberOfTerms.textContent = `– There are ${dtElements.length} terms –`;

    terminologySectionUtilityContainer.appendChild(numberOfTerms);

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
        alphabetIndexContainer.appendChild(link);
    });
    terminologySectionUtilityContainer.appendChild(alphabetIndexContainer);
}

document.addEventListener("DOMContentLoaded", function () {
    createAlphabetIndex();
});
