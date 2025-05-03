/**
 * @file This file creates a collapsible meta info section for each term definition on the page. It is used to hide meta information about a term definition by default and show it when the user clicks the button.
 * @author Kor Dwarshuis
 * @version 0.0.2
 * @since 2025-02-16
 */

// Function to create the toggle button
function createToggleButton(element) {
    const toggleButton = document.createElement('button');
    toggleButton.classList.add('meta-info-toggle-button', 'btn');
    toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="shape-rendering: geometricPrecision;">' +
        '<path fill-rule="evenodd" d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>' +
        '<path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588z"/>' + 
        '<path d="M9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>' +
    '</svg>';
    toggleButton.title = 'Meta info';

    // Add event listener to the button
    toggleButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the wrapper containing the meta info
        const isCollapsed = element.classList.contains('collapsed');
        
        // Toggle the collapsed state
        if (isCollapsed) {
            // If collapsed, expand it
            element.classList.remove('collapsed');
            // Force reflow to ensure transition works properly
            element.getBoundingClientRect();
        } else {
            // If expanded, collapse it
            element.classList.add('collapsed');
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
document.addEventListener('DOMContentLoaded', function() {
    const collapsibles = document.querySelectorAll('dl > dd:has(table)');

    collapsibles.forEach(function(element) {
        // Add meta-info-content-wrapper class
        element.classList.add('meta-info-content-wrapper');
        
        // Wrap content in a div for proper spacing
        const wrapper = document.createElement('div');
        wrapper.classList.add('meta-info-inner-wrapper');

        // Move all children except potential existing buttons into wrapper
        while (element.firstChild && element.firstChild !== element.querySelector('.meta-info-toggle-button')) {
            wrapper.appendChild(element.firstChild);
        }

        if (!element.querySelector('.meta-info-toggle-button')) { // Check if already has a button
            createToggleButton(element);
        }

        element.appendChild(wrapper);

        // Collapse by default on load
        element.classList.add('collapsed');
    });
});
