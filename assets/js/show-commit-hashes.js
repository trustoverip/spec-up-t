/**
 * @file This file fetches information about xrefs from various places (including the GitHub API) and stores it in a JavaScript file that is included in the HTML output of the specification.
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @license MIT
 * @since 2024-06-09
 */

function fetchCommitHashes() {
   /*****************/
   /* CONFIGURATION */


   /* END CONFIGURATION */
   /*********************/

   // get all elements with data-attribute “data-local-href”
   const elements = document.querySelectorAll('[data-local-href]');

   // for each element, get the value of the data-attribute “data-local-href”
   elements.forEach((element) => {
      // Get the value of the data-local-href attribute
      const href = element.getAttribute('data-local-href');

      // split href on “:” and create array
      const splitHref = href.split(':');

      // allXrefs is an object that is available in the global scope
      allXrefs.xrefs.forEach((match) => {
         if (match.externalSpec === splitHref[1] && match.term.toLowerCase() === splitHref[2].toLowerCase()) {
            const commitHashShort = match.commitHash && match.commitHash[0] ? match.commitHash[0].substring(0, 7) : 'No hash';

            // Diff of the latest commit hash of a term-file and the referenced commit hash
            const diff = document.createElement('a');
            diff.href = 'https://github.com/' + match.owner + '/' + match.repo + '/compare/' + match.commitHash + '..main/' + match.terms_dir + '/' + match.term.replace(/ /g, ' - ').toLowerCase() + '.md';
            diff.target = '_blank';
            diff.classList.add('diff', 'xref-info-links', 'btn');
            // diff.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
            diff.innerHTML = 'Diff';
            element.parentNode.insertBefore(diff, element.nextSibling);


            // Latest version of a term-file
            const latestVersion = document.createElement('a');
            latestVersion.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/main/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
            latestVersion.target = '_blank';
            latestVersion.classList.add('latest-version', 'xref-info-links', 'btn');
            // latestVersion.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
            latestVersion.innerHTML = 'Latest';
            diff.parentNode.insertBefore(latestVersion, element.nextSibling);


            // The structure of the URL to a specific version of a file in a GitHub repository is as follows:
            // https://github.com/<username>/<repository>/blob/<commit-hash>/<file-path>
            // Exact commit hash at the time of referencing the file
            const exactCommitHash = document.createElement('a');
            exactCommitHash.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/' + match.commitHash + '/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
            exactCommitHash.target = '_blank';
            exactCommitHash.classList.add('exact-commit-hash', 'xref-info-links', 'btn');
            // exactCommitHash.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
            exactCommitHash.innerHTML = commitHashShort;
            latestVersion.parentNode.insertBefore(exactCommitHash, element.nextSibling);
         }
      });
   });
}

document.addEventListener("DOMContentLoaded", function () {
   fetchCommitHashes();
});
