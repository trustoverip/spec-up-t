/*
  Author: Kor Dwarshuis, kor@dwarshuis.com
  Created: 2025-03-16
  Description: Close offcanvas menu when a link is clicked
*/

function closeOffCanvasMenu() {
   // Get all nav links inside the offcanvas
   const navLinks = document.querySelectorAll('#sidebarMenu a');

   // Loop through each link and add a click event listener
   navLinks.forEach(link => {
      link.addEventListener('click', function () {
         // Get the offcanvas instance and hide it
         const offcanvasElement = document.querySelector('#sidebarMenu');
         const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
         offcanvas.hide();
      });
   });
}

document.addEventListener("DOMContentLoaded", function () {
   closeOffCanvasMenu();
});