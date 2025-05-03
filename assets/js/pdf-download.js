/**
 * @author Kor Dwarshuis
 * @contact kor@dwarshuis.com
 * @created 2024-09-07
 * @description This script adds a button next to the search bar that allows users to download the page as a PDF.
 */

function pdfDownload() {
   fetch('./index.pdf', { method: 'HEAD' })
      .then(response => {
         if (response.ok) {
            let buttonPdfDownload = document.createElement("a");
            buttonPdfDownload.classList.add("button-pdf-download");
            buttonPdfDownload.classList.add("btn", "d-block", "btn-sm", "btn-outline-secondary");
            buttonPdfDownload.target = "_blank";
            buttonPdfDownload.rel = "noopener noreferrer";
            buttonPdfDownload.href = "./index.pdf";
            buttonPdfDownload.title = "Download this page as a PDF";
            
            // Add PDF icon with transparent fill and text for better visual representation
            buttonPdfDownload.innerHTML = `
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" class="me-1" viewBox="0 0 16 16">
                  <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0H4zm0 1h5v4h4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zm7 4h-1V2l3 3h-2z"/>
                  <path d="M6.5 10.5a.5.5 0 0 1-.5-.5V7.5a.5.5 0 0 1 .5-.5H8a.5.5 0 0 1 .5.5V10a.5.5 0 0 1-.5.5H6.5z"/>
               </svg>
            `;
            
            // Add additional styling directly to the button
            buttonPdfDownload.style.display = "inline-flex";
            buttonPdfDownload.style.alignItems = "center";
            buttonPdfDownload.style.justifyContent = "center";
            
            document.querySelector('.service-menu').prepend(buttonPdfDownload);
         } else {
            console.log('PDF file does not exist. No PDF download button will be added.');
         }
      })
      .catch(error => {
         console.error('Error checking PDF file:', error);
      });

}

document.addEventListener("DOMContentLoaded", function () {
   pdfDownload();
});
