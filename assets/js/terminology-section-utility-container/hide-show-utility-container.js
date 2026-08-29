/**
 * @file Removes the terminology utility container
 * @author Kor Dwarshuis
 * @version 1.0.0
 * @since 2024-08-31
 * @description Removes the utility container when the experimental feature is off or no terms exist
 */

/**
 * Removes the terminology utility container from the DOM if it is present.
 * @returns {void}
 */
function hideShowUtilityContainer() {
    document.getElementById("terminology-section-utility-container")?.remove();
}
