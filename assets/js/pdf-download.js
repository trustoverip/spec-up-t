/**
 * @author Kor Dwarshuis
 * @contact kor@dwarshuis.com
 * @created 2024-09-07
 * @description This script adds a button next to the search bar that allows users to download the page as a PDF.
 */

function pdfDownload() {
   fetch('index.pdf', { method: 'HEAD' })
      .then(response => {
         if (response.ok) {
            let buttonPdfDownload = document.createElement("a");
            buttonPdfDownload.classList.add("button-pdf-download");
            buttonPdfDownload.classList.add("btn");
            buttonPdfDownload.target = "_blank";
            buttonPdfDownload.rel = "noopener noreferrer";
            buttonPdfDownload.href = "index.pdf";
            buttonPdfDownload.title = "Download this page as a PDF";
            buttonPdfDownload.innerHTML = "PDF";
            document.querySelector('#container-search-h7vc6omi2hr2880').appendChild(buttonPdfDownload);
         } else {
            console.error('PDF file does not exist.');
         }
      })
      .catch(error => {
         console.error('Error checking PDF file:', error);
      });

}

document.addEventListener("DOMContentLoaded", function () {
   pdfDownload();
});
