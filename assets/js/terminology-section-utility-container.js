/**
 * @file Main module for terminology section utility container functionality
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-08-31
 * @description Coordinates all terminology section utility container components
 */

/**
 * Initializes the complete terminology section utility container
 * This function coordinates all the components in the correct order
 */
function initializeTerminologyUtilityContainer() {
    // Check if the terms and definitions list exists
    const termsListElement = document.querySelector(".terms-and-definitions-list");
    const dtElements = termsListElement ? termsListElement.querySelectorAll("dt") : [];

    if (dtElements.length === 0) {
        // Hide the container if no terms exist
        hideShowUtilityContainer();
        return;
    }

    // Initialize components in the correct order
    // 1. Create the basic structure with alphabet index (creates rows)
    createAlphabetIndex();
    
    // 2. Add term filter checkboxes to the utility row
    createTermFilter();
    
    // 3. Add search functionality to the utility row
    initializeSearch();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    initializeTerminologyUtilityContainer();
});
