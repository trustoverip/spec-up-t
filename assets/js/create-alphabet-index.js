/**
 * @file This file creates an alphabet index for the terms
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @since 2024-09-19
 */
function createAlphabetIndex() {
    const introElement = document.getElementById("terms-and-definitions-intro");
    const termsListElement = document.querySelector(".terms-and-definitions-list");
    const dtElements = termsListElement.querySelectorAll("dt");
    const alphabetIndex = {};

    dtElements.forEach(dt => {
        const span = dt.querySelector("span");
        if (span && span.id) {
            const termId = span.id;
            const firstChar = termId.charAt(termId.indexOf("term:") + 5).toUpperCase();
            console.log('firstChar: ', firstChar);
            if (!alphabetIndex[firstChar]) {
                alphabetIndex[firstChar] = span.id;
            }
        }
    });

    const indexContainer = document.createElement("div");
    indexContainer.className = "alphabet-index";

    Object.keys(alphabetIndex).sort().forEach(char => {
        const link = document.createElement("a");
        link.href = `#${alphabetIndex[char]}`;
        link.textContent = char;
        indexContainer.appendChild(link);
    });

    introElement.appendChild(indexContainer);
}

document.addEventListener("DOMContentLoaded", function () {
    createAlphabetIndex();
});
