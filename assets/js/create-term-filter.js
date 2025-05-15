/**
 * @file This file creates an alphabet index for the terms
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @since 2024-09-19
 */
function createTermFilter() {
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

    // Create checkboxes container
    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.className = 'd-flex mt-0';
    
    // Create and configure checkbox for local terms
    const localTermsCheckboxDiv = document.createElement('div');
    localTermsCheckboxDiv.className = 'form-check me-3';
    localTermsCheckboxDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" id="showLocalTermsCheckbox" checked>
        <label class="form-check-label" for="showLocalTermsCheckbox">
            Show local terms
        </label>
    `;
    
    // Create and configure checkbox for external terms
    const externalTermsCheckboxDiv = document.createElement('div');
    externalTermsCheckboxDiv.className = 'form-check ms-3';
    externalTermsCheckboxDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" id="showExternalTermsCheckbox" checked>
        <label class="form-check-label" for="showExternalTermsCheckbox">
            Show external terms
        </label>
    `;
    
    // Append checkboxes to container
    checkboxesContainer.appendChild(localTermsCheckboxDiv);
    checkboxesContainer.appendChild(externalTermsCheckboxDiv);

    // Add event listeners to checkboxes (generic for any number of checkboxes)
    function enforceAtLeastOneChecked(event) {
        const checkboxes = checkboxesContainer.querySelectorAll('input[type="checkbox"]');
        const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
        // If the user is unchecking a box
        if (!event.target.checked) {
            // If all others are already unchecked (so this would make all unchecked except the one being unchecked)
            if (checkedBoxes.length === 0) {
                // Check all other checkboxes except the one being unchecked
                checkboxes.forEach(cb => {
                    if (cb !== event.target) {
                        cb.checked = true;
                    }
                });
                // The one being unchecked remains unchecked
            }
        }
        // Toggle classes for each checkbox type
        checkboxes.forEach(cb => {
            const html = document.querySelector('html');
            if (cb.id === 'showLocalTermsCheckbox') {
                html.classList.toggle('hide-local-terms', !cb.checked);
            } else if (cb.id === 'showExternalTermsCheckbox') {
                html.classList.toggle('hide-external-terms', !cb.checked);
            }
            // Add more else ifs here for future checkboxes
        });
    }

    // Attach the handler to all checkboxes in the container
    checkboxesContainer.addEventListener('change', function(event) {
        if (event.target.matches('input[type="checkbox"]')) {
            enforceAtLeastOneChecked(event);
        }
    });

    // Add checkboxes to the terminology section utility container
    terminologySectionUtilityContainer.appendChild(checkboxesContainer);
}

document.addEventListener("DOMContentLoaded", function () {
    createTermFilter();
});
