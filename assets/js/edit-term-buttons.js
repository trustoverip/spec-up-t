/*
  Author: Kor Dwarshuis, kor@dwarshuis.com
  Created: 2024-04-16
  Description:
   Creates buttons (links) to the terms definitions on GitHub via client side JS DOM manipulation.
*/



function editTermButtons() {
   // find the definition list that is the next sibling of #terms-definitions
   const termsDefinitions = document.querySelector('#terms-definitions ~ dl');

   termsDefinitions.querySelectorAll('dt').forEach(term => {
      const url = term.querySelector('span').getAttribute('id');

      // cut “url” on the “:” and keep the second part
      const fileName = url.split(":")[1];

      // add edit and history buttons to term
      term.innerHTML += `<sup class="edit-term-button-sup"><a target="_blank" rel="noopener" href="https://github.com/${specConfig.source.account}/ctwg-main-glossary/blob/main/spec/${specConfig.markdown_splitted_files_dir}/${fileName}.md" class="edit-term-button">Edit</a></sup><sup class="history-term-button-sup"><a target="_blank" rel="noopener" href="https://github.com/${specConfig.source.account}/ctwg-main-glossary/commits/main/spec/${specConfig.markdown_splitted_files_dir}/${fileName}.md" class="history-term-button">History</a></sup>`;
   });
}

document.addEventListener("DOMContentLoaded", function () {
   editTermButtons();
});
