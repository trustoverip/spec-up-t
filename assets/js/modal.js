/**
 * Displays a modal with the given content.
 *
 * @param {string} content - The HTML content to display inside the modal.
 *
 * Example usage:
 * showModal('<h2>This is a Modal</h2><p>You can put any content here.</p>');
 */
function showModal(content) {
   const previouslyFocused = document.activeElement;
   const previousOverflow = document.body.style.overflow;

   const overlay = document.createElement('div');
   overlay.className = 'spec-up-t-modal-overlay';

   const modal = document.createElement('div');
   modal.className = 'spec-up-t-modal';
   modal.setAttribute('role', 'dialog');
   modal.setAttribute('aria-modal', 'true');
   modal.setAttribute('aria-label', 'Dialog');
   modal.tabIndex = -1;

   const closeButton = document.createElement('button');
   closeButton.type = 'button';
   closeButton.className = 'spec-up-t-modal-close';
   closeButton.setAttribute('aria-label', 'Close dialog');
   closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';
   closeButton.addEventListener('click', closeModal);

   modal.innerHTML = content;
   modal.appendChild(closeButton);
   overlay.appendChild(modal);
   document.body.appendChild(overlay);
   document.body.style.overflow = 'hidden';

   function onKeydown(event) {
      if (event.key === 'Escape') {
         event.preventDefault();
         closeModal();
         return;
      }
      handleFocusTrap(event, modal);
   }

   document.addEventListener('keydown', onKeydown);

   overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
         closeModal();
      }
   });

   const heading = modal.querySelector('h1, h2, h3, h4, h5, h6');
   if (heading) {
      if (!heading.id) {
         heading.id = 'spec-up-t-modal-title';
      }
      modal.setAttribute('aria-labelledby', heading.id);
      modal.removeAttribute('aria-label');
   }

   const focusable = getFocusableElements(modal);
   (focusable[0] || modal).focus();

   function closeModal() {
      document.removeEventListener('keydown', onKeydown);
      document.body.style.overflow = previousOverflow;
      if (overlay.parentNode) {
         overlay.parentNode.removeChild(overlay);
      }
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
         previouslyFocused.focus();
      }
   }
}
