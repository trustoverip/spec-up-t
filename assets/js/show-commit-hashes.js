/*
  Author: Kor Dwarshuis, kor@dwarshuis.com
  Created: 2024-04-01
  Description: 

*/

function fetchCommitHashes() {
   /*****************/
   /* CONFIGURATION */


   /* END CONFIGURATION */
   /*********************/

   // load the local JSON file “allMatches.json” in the root
   fetch('../allMatches.json').then(response => response.json()).then((data) => {
      const allMatches = data.matches;

      // get all elements with data-attribute “data-local-href”
      const elements = document.querySelectorAll('[data-local-href]');

      // for each element, get the value of the data-attribute “data-local-href”
      elements.forEach((element) => {
         // Get the value of the data-local-href attribute
         const href = element.getAttribute('data-local-href');

         // split href on “:” and create array
         const splitHref = href.split(':');
         console.log('splitHref: ', splitHref);

         allMatches.forEach((match) => {
            if (match.externalSpec === splitHref[1] && match.term.toLowerCase() === splitHref[2].toLowerCase()) {
               console.log('match.commitHash: ', match.commitHash);
               const commitHashShort = match.commitHash[0].substring(0, 7);

               // Diff of the latest commit hash of a term-file and the referenced commit hash
               const diff = document.createElement('a');
               // diff.href = 'https://github.com/' + match.owner + '/' + match.repo + '/compare/' + commitHashShort + '...main';
               // https://github.com/<username>/<repository>/compare/<commit-hash>..<HEAD>/<file-path>


               diff.href = 'https://github.com/' + match.owner + '/' + match.repo + '/compare/' + match.commitHash + '..main/' + match.terms_dir + '/' + match.term.replace(/ /g, ' - ').toLowerCase() + '.md';
               diff.target = '_blank';
               diff.classList.add('diff');
               diff.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
               diff.innerHTML = 'Diff';
               element.parentNode.insertBefore(diff, element.nextSibling);


               // Latest version of a term-file
               const latestVersion = document.createElement('a');
               latestVersion.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/main/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
               latestVersion.target = '_blank';
               latestVersion.classList.add('latest-version');
               latestVersion.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
               latestVersion.innerHTML = 'Latest version';
               diff.parentNode.insertBefore(latestVersion, element.nextSibling);


               // The structure of the URL to a specific version of a file in a GitHub repository is as follows:
               // https://github.com/<username>/<repository>/blob/<commit-hash>/<file-path>
               // Exact commit hash at the time of referencing the file
               const exactCommitHash = document.createElement('a');
               exactCommitHash.id = 'exact-commit-hash';
               exactCommitHash.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/' + match.commitHash + '/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
               exactCommitHash.target = '_blank';
               exactCommitHash.classList.add('exact-commit-hash');
               exactCommitHash.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
               exactCommitHash.innerHTML = '(' + commitHashShort + ')';
               latestVersion.parentNode.insertBefore(exactCommitHash, element.nextSibling);
            }
         });

      });
   });










}

document.addEventListener("DOMContentLoaded", function () {
   fetchCommitHashes();
});
