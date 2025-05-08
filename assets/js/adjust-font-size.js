/*
  Author: Kor Dwarshuis, kor@dwarshuis.com
  Created: 2025-03-16
  Description: Adjusts font size on body with plus, minus, and reset buttons
*/

function adjustFontSize() {
   const body = document.body;

   function adjust(change) {
      // Get current font size from body (in pixels)
      let currentSize = parseFloat(window.getComputedStyle(body).fontSize);

      // Calculate new size
      let newSize = currentSize + change;

      // Set reasonable min/max limits (e.g., 10px to 50px)
      if (newSize >= 10 && newSize <= 50) {
         body.style.fontSize = `${newSize}px`;
      }
   }

   // Add event listeners to buttons
   document.getElementById('decreaseBtn').addEventListener('click', () => adjust(-2));
   document.getElementById('increaseBtn').addEventListener('click', () => adjust(2));
}

document.addEventListener("DOMContentLoaded", function () {
   adjustFontSize();
});