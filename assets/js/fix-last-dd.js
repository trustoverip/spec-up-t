/**
 * Identifies and marks the last <dd> elements in definition lists.
 * 
 * This function finds all definition lists with the class 'terms-and-definitions-list'
 * and adds the 'last-dd' class to each <dd> element that is:
 * 1. The last <dd> before the next <dt> element, or
 * 2. The last <dd> in the definition list
 * 
 * The 'last-dd' class allows for special styling of the last definition
 * in each term group, improving visual separation between terms.
 * 
 * @function fixLastDd
 * @returns {void}
 */
function fixLastDd() {
    // Find all definition lists
    const dlElements = document.querySelectorAll('dl.terms-and-definitions-list');
    
    dlElements.forEach(dl => {
        // Get all direct dd children of the current dl
        const ddElements = dl.querySelectorAll(':scope > dd');
        
        // Process each dd element
        ddElements.forEach((dd, index) => {
            // Remove the 'last-dd' class if it exists, one of the ways it can be there is via the fetching of the external references html. We do not know what classes are in there.
            dd.classList.remove('last-dd');
            
            // Get the next sibling element
            let nextSibling = dd.nextElementSibling;
            
            // If the next sibling is a dt or there is no next sibling (meaning this is the last element before </dl>)
            if (!nextSibling || nextSibling.tagName === 'DT') {
                // Add the "last-dd" class if it's not already present
                if (!dd.classList.contains('last-dd')) {
                    dd.classList.add('last-dd');
                }
            }
        });
    });
}

/**
 * Initializes the function when the custom event "trefs-inserted" is fired.
 */
document.addEventListener("trefs-inserted", function () {
    fixLastDd();
});
