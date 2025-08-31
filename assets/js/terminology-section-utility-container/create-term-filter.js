/**
 * @file Creates term filtering checkboxes (Local/Remote)
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-08-31
 * @description Adds filtering checkboxes to control visibility of local and remote terms
 */

/**
 * Creates the term filter checkboxes
 * @returns {void}
 */
function createTermFilter() {
    // Check if the terms and definitions list exists
    const termsListElement = document.querySelector(".terms-and-definitions-list");
    const dtElements = termsListElement ? termsListElement.querySelectorAll("dt") : [];

    if (dtElements.length === 0) {
        return;
    }

    const terminologySectionUtilityContainer = document.getElementById("terminology-section-utility-container");

    // Find the utility row (second row) created by alphabet index
    let utilityRow = terminologySectionUtilityContainer.querySelector('#utility-row .col-12');
    if (!utilityRow) {
        // If it doesn't exist yet, create the structure
        const row = document.createElement("div");
        row.className = "row";
        row.id = "utility-row";
        
        utilityRow = document.createElement("div");
        utilityRow.className = "col-12 d-flex flex-wrap justify-content-between align-items-center gap-2";
        
        row.appendChild(utilityRow);
        terminologySectionUtilityContainer.appendChild(row);
    }

    // Create checkboxes container with Bootstrap classes
    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.className = 'd-flex gap-3';
    
    // Create and configure checkbox for local terms
    const localTermsCheckboxDiv = document.createElement('div');
    localTermsCheckboxDiv.className = 'form-check';
    localTermsCheckboxDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" id="showLocalTermsCheckbox" checked>
        <label class="form-check-label" for="showLocalTermsCheckbox">
            Local
        </label>
    `;
    
    // Create and configure checkbox for external terms
    const externalTermsCheckboxDiv = document.createElement('div');
    externalTermsCheckboxDiv.className = 'form-check';
    externalTermsCheckboxDiv.innerHTML = `
        <input class="form-check-input" type="checkbox" id="showExternalTermsCheckbox" checked>
        <label class="form-check-label" for="showExternalTermsCheckbox">
            Remote
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

    // Add checkboxes to the utility row
    utilityRow.appendChild(checkboxesContainer);
}
