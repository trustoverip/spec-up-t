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
            if (!alphabetIndex[firstChar]) {
                alphabetIndex[firstChar] = span.id;
            }
        }
    });

    const indexContainer = document.createElement("div");
    indexContainer.className = "alphabet-index";

    // Create notification element
    const notificationElement = document.createElement("p");
    notificationElement.className = "number-of-terms";
    notificationElement.textContent = `– There are ${dtElements.length} terms –`;

    // Insert notification and index container as immediate siblings of introElement
    const parentElement = introElement.parentNode;
    parentElement.insertBefore(notificationElement, introElement.nextSibling);
    parentElement.insertBefore(indexContainer, notificationElement.nextSibling);

    Object.keys(alphabetIndex).sort().forEach(char => {
        const link = document.createElement("a");
        link.href = `#${alphabetIndex[char]}`;
        link.textContent = char;
        indexContainer.appendChild(link);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    createAlphabetIndex();
});
