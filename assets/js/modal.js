/**
 * Displays a modal with the given content.
 *
 * @param {string} content - The HTML content to display inside the modal.
 *
 * Example usage:
 * showModal('<h2>This is a Modal</h2><p>You can put any content here.</p>');
 */
function showModal(content) {
   // Create the modal overlay
   const overlay = document.createElement('div');
   overlay.className = 'spec-up-t-modal-overlay';

   // Create the modal container
   const modal = document.createElement('div');
   modal.className = 'spec-up-t-modal';

   // Create the close button
   const closeButton = document.createElement('button');
   closeButton.className = 'spec-up-t-modal-close';
   closeButton.innerHTML = '&times;';
   closeButton.onclick = closeModal;

   // Add the content to the modal
   modal.innerHTML = content;
   modal.appendChild(closeButton);

   // Add the modal to the overlay
   overlay.appendChild(modal);

   // Add the overlay to the document body
   document.body.appendChild(overlay);

   // Function to close the modal
   function closeModal() {
      document.body.removeChild(overlay);
   }

   // Close modal when clicked outside the modal
   overlay.onclick = function (event) {
      if (event.target === overlay) {
         closeModal();
      }
   };

   // Close modal with escape key
   document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
         closeModal();
      }
   }, { once: true });
}
