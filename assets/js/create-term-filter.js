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
    
    // Add event listeners to checkboxes
    localTermsCheckboxDiv.querySelector('#showLocalTermsCheckbox').addEventListener('change', function(event) {
        if (!event.target.checked) {
            document.querySelector('html').classList.add('hide-local-terms');
        } else {
            document.querySelector('html').classList.remove('hide-local-terms');
        }
    });
    
    externalTermsCheckboxDiv.querySelector('#showExternalTermsCheckbox').addEventListener('change', function(event) {
        if (!event.target.checked) {
            document.querySelector('html').classList.add('hide-external-terms');
        } else {
            document.querySelector('html').classList.remove('hide-external-terms');
        }
    });
    
    // Append checkboxes to container
    checkboxesContainer.appendChild(localTermsCheckboxDiv);
    checkboxesContainer.appendChild(externalTermsCheckboxDiv);
    
    // Add checkboxes to the terminology section utility container
    terminologySectionUtilityContainer.appendChild(checkboxesContainer);
}

document.addEventListener("DOMContentLoaded", function () {
    createTermFilter();
});
