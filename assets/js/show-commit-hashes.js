/**
 * @file This file fetches and displays commit hashes by matching elements with `data-local-href` attributes against the `allXrefs` global object.
 * Example:
 * const allXrefs = {
      "xrefs": [
         {
            "externalSpec": "test-1",
            "term": "Aal",
            "repoUrl": "https://github.com/blockchainbird/spec-up-xref-test-1",
            "terms_dir": "spec/term-definitions",
            "owner": "blockchainbird",
            "repo": "spec-up-xref-test-1",
            "site": "https://blockchainbird.github.io/spec-up-xref-test-1/",
            "commitHash": [
            "f66951f1d378490289caab9c51141b44a0438365"
            ]
         },
         {…}
      ]
   };
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
   const elements = document.querySelectorAll('.term-reference[data-local-href]');

   // for each element, get the value of the data-attribute “data-local-href”
   elements.forEach((element) => {
      // Get the value of the data-local-href attribute
      const href = element.getAttribute('data-local-href');

      // split href on “:” and create array
      const splitHref = href.split(':');

      // allXrefs is an object that is available in the global scope
      allXrefs.xrefs.forEach((match) => {

         //TODO: remove toLowerCase() or not?
         if (match.externalSpec === splitHref[1] && match.term.toLowerCase() === splitHref[2].toLowerCase()) {
            
            // If no commit hash is found, display a message and return
            if (!match.commitHash) {
               const noXrefFoundMessage = document.createElement('span');
               noXrefFoundMessage.classList.add('no-xref-found-message','btn');
               noXrefFoundMessage.innerHTML = 'No xref found.';
               element.parentNode.insertBefore(noXrefFoundMessage, element.nextSibling);

               return
            };

            const commitHashShort = match.commitHash && match.commitHash ? match.commitHash.substring(0, 7) : 'No hash';

            // Diff of the latest commit hash of a term-file and the referenced commit hash
            const diff = document.createElement('a');
            diff.href = 'https://github.com/' + match.owner + '/' + match.repo + '/compare/' + match.commitHash + '../main';
            diff.target = '_blank';
            diff.rel = 'noopener noreferrer';
            diff.classList.add('diff', 'xref-info-links', 'btn');
            // diff.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
            diff.innerHTML = 'Difference';
            diff.title = 'A Diff between the current commit hash of the definition and the commit hash referenced when the link was created.';
            element.parentNode.insertBefore(diff, element.nextSibling);


            // Latest version of a term-file
            const latestVersion = document.createElement('a');
            latestVersion.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/main/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
            latestVersion.target = '_blank';
            latestVersion.rel = 'noopener noreferrer';
            latestVersion.classList.add('latest-version', 'xref-info-links', 'btn');
            // latestVersion.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
            latestVersion.innerHTML = 'Current';
            latestVersion.title = "Go to the repo page of the definition's current version.";
            diff.parentNode.insertBefore(latestVersion, element.nextSibling);


            // The structure of the URL to a specific version of a file in a GitHub repository is as follows:
            // https://github.com/<username>/<repository>/blob/<commit-hash>/<file-path>
            // Exact commit hash at the time of referencing the file
            const exactCommitHash = document.createElement('a');
            exactCommitHash.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/' + match.commitHash + '/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
            exactCommitHash.target = '_blank';
            exactCommitHash.rel = 'noopener noreferrer';
            exactCommitHash.classList.add('exact-commit-hash', 'xref-info-links', 'btn');
            // exactCommitHash.style.cssText = 'display: inline-block; margin-left: 5px; margin-right: 5px; ';
            // exactCommitHash.innerHTML = commitHashShort;
            exactCommitHash.innerHTML = "Referenced";
            exactCommitHash.title = "Go to the repo page of the definition's version referenced when the link was created.";
            latestVersion.parentNode.insertBefore(exactCommitHash, element.nextSibling);
         }



         const token = '';
         console.log('token.length: ', token.length);

         const headers = {};
         if (token && token.length > 0) {
            headers['Authorization'] = `token ${token}`;
         }

         fetch('https://api.github.com/repos/' + match.owner + '/' + match.repo + '/contents/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md?ref=' + match.commitHash, { headers: headers })
            .then(response => {
               // Log rate limit information
               const rateLimit = response.headers.get('X-RateLimit-Limit');
               const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
               const rateLimitReset = response.headers.get('X-RateLimit-Reset');
               console.log(`Rate Limit: ${rateLimit}, Remaining: ${rateLimitRemaining}, Reset: ${new Date(rateLimitReset * 1000).toLocaleString()}`);
               
               return response.json();
            })
         .then(data => {
            console.log(data);
         
            // Decode base64 encoded content
            const decodedContent = atob(data.content);
            console.log(decodedContent);
         
            // Create a new element and insert the content
            const contentElement = document.createElement('div');
            contentElement.innerHTML = decodedContent;
            element.parentNode.insertBefore(contentElement, element.nextSibling);
         })
         .catch(error => {
               console.error('Error fetching content:', error);
         });





      });
   });
}

document.addEventListener("DOMContentLoaded", function () {
   fetchCommitHashes();
});
