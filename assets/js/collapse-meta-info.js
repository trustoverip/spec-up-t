/**
 * @file This file creates a collapsible meta info section for each term definition on the page. It is used to hide meta information about a term definition by default and show it when the user clicks the button.
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @since 2025-02-16
 */

// Function to create the toggle button
function createToggleButton(element) {
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('meta-info-toggle-button', 'btn');
    toggleButton.textContent = '🔍';
    toggleButton.title = 'Meta info';

    // Add event listener to the button
    toggleButton.addEventListener('click', function () {
        element.classList.toggle('collapsed');
        if (element.classList.contains('collapsed')) {
            this.textContent = '🔍';
        } else {
            this.textContent = '🔍';
        }
    });

    // Find the closest <dt> sibling and insert the button inside it
    let dtElement = element.previousElementSibling;
    while (dtElement && dtElement.tagName !== 'DT') {
        dtElement = dtElement.previousElementSibling;
    }
    if (dtElement) {
        dtElement.appendChild(toggleButton);
    } else {
        // Fallback to inserting at the top right of the element if no <dt> is found
        element.insertBefore(toggleButton, element.firstChild);
    }
}

// Find all elements with class 'collapsible' and make them collapsible
document.addEventListener('DOMContentLoaded', function () {
    const collapsibles = document.querySelectorAll('dl > dd:has(table)');

    collapsibles.forEach(function (element) {
        // Wrap content (excluding button) in a div for easy toggling
        const wrapper = document.createElement('div');
        wrapper.classList.add('meta-info-content-wrapper');

        // Move all children except potential existing buttons into wrapper
        while (element.firstChild && element.firstChild !== element.querySelector('.meta-info-toggle-button')) {
            wrapper.appendChild(element.firstChild);
        }

        if (!element.querySelector('.meta-info-toggle-button')) { // Check if already has a button from previous runs or other scripts
            createToggleButton(element);
        }

        element.appendChild(wrapper);

        // Optionally collapse by default on load (remove this line or modify as needed)
        element.classList.add('collapsed');
    });
});
