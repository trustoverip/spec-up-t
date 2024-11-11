/**
 * @file This file fetches and displays commit hashes by matching elements with `x-term-reference` class against the `allXrefs` global object.
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
            "f66951f1d378490289caab9c51141b44a0438365",
            "content": "[[def: AAL]]:\n\n~ See: [[ref: authenticator assurance level]].\n\n~ This is an addition, for testing purposes.\n"
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

var md = window.markdownit();

function fetchCommitHashes() {

   // Check if allXrefs is undefined or does not exist
   if (typeof allXrefs === 'undefined' || allXrefs === null) {
      console.log('allXrefs is not defined or does not exist. We will continue without it.');
      return;
   }

   // Load GitHub API token from local storage if it exists
   const savedToken = localStorage.getItem('githubToken');

   // // Markdown parser
   // const md = markdownit();

   // A: Debounce function to delay execution, so the error message is not displayed too often, since we do not know of often and how many times the error will be triggered.
   function debounce(func, wait) {
      let timeout;
      return function (...args) {
         clearTimeout(timeout);
         timeout = setTimeout(() => func.apply(this, args), wait);
      };
   }

   // B: Debounced “GitHub rate limit exceeded” error message
   const debouncedError = debounce(() => {
      notyf.error('GitHub rate limit exceeded. See <a target="_blank" rel="noopener" href="https://blockchainbird.github.io/spec-up-t-website/docs/github-token/">documentation</a> for more info.');
   }, 3000); // Delay in milliseconds

   // Fetch the content of a term-file from GitHub
   function fetchGitHubContent(savedToken, match) {
      // Create a headers object with the Authorization header if a GitHub API token is set
      const headers = {};
      if (savedToken && savedToken.length > 0) {
         headers['Authorization'] = `token ${savedToken}`;
      }

      fetch('https://api.github.com/repos/' + match.owner + '/' + match.repo + '/contents/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md', { headers: headers })
         .then(response => {
            if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
               const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
               console.error(`\n   SPEC-UP-T: Github API rate limit exceeded. Try again after ${resetTime}. See https://blockchainbird.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");

               // Call the debounced error function
               debouncedError();
               return true;
            } else {
               console.log(`\n   SPEC-UP-T: Github API rate limit: ${response.headers.get('X-RateLimit-Remaining')} requests remaining. See https://blockchainbird.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
            }

            return response.json();
         })
         .then(data => {
            // Decode base64 encoded content
            const decodedContent = atob(data.content);

            // Diff the content of the current term-file with the content of stored version
            // See https://www.npmjs.com/package/diff , examples
            const diff = Diff.diffChars(match.content, decodedContent),
               fragment = document.createDocumentFragment();

            diff.forEach((part) => {
               // green for additions, red for deletions
               // grey for common parts
               const color = part.added ? 'green' :
                  part.removed ? 'red' : 'grey';

               const backgroundColor = part.added ? '#ddd' :
                  part.removed ? '#ddd' : 'white';

               span = document.createElement('span');
               span.style.color = color;
               span.style.backgroundColor = backgroundColor;

               span.appendChild(document
                  .createTextNode(part.value));
               fragment.appendChild(span);
            });
            // Create a temporary container to hold the fragment
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = '<h1>Diff xref (local snapshot) and latest version</h1>';
            tempContainer.appendChild(fragment);
            // Replace newlines with <br> tags
            tempContainer.innerHTML = tempContainer.innerHTML.replace(/\n/g, '<br>');
            showModal(tempContainer.innerHTML);
         })
         .catch(error => {
            console.error('Error fetching content:', error);
         });
   }

   async function fetchGitHubTerm(savedToken, match) {
      function processSpecUpMarkdown(markdown) {

         // Replace all occurrences of [[def: ]] with ''
         const defRegex = /\[\[def: ([^\]]+)\]\]/g;
         markdown = markdown.replace(defRegex, '');

         // // Replace all occurrences of [[ref: ]] with <a href="#"></a>
         // const refRegex = /\[\[ref: ([^\]]+)\]\]/g;
         // markdown = markdown.replace(refRegex, '<a class="x-term-reference" data-local-href="ref:$1">$1</a>');

         return markdown;
      }

      const headers = {};
      if (savedToken && savedToken.length > 0) {
         headers['Authorization'] = `token ${savedToken}`;
      }

      try {
         const response = await fetch('https://api.github.com/repos/' + match.owner + '/' + match.repo + '/contents/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md', { headers: headers });

         if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
            const resetTime = new Date(response.headers.get('X-RateLimit-Reset') * 1000);
            console.error(`\n   SPEC-UP-T: Github API rate limit exceeded. Try again after ${resetTime}. See https://blockchainbird.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");

            debouncedError();
            return true;
         } else {
            console.log(`\n   SPEC-UP-T: Github API rate limit: ${response.headers.get('X-RateLimit-Remaining')} requests remaining. See https://blockchainbird.github.io/spec-up-t-website/docs/github-token/ for more info.` + "\n");
         }

         const data = await response.json();
         const decodedContent = atob(data.content);
         const processedContent = processSpecUpMarkdown(decodedContent);
         return processedContent;
      } catch (error) {
         console.error('Error fetching content:', error);
      }
   }

   // get all elements with class “x-term-reference”
   const elements = document.querySelectorAll('.x-term-reference');

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
               noXrefFoundMessage.classList.add('no-xref-found-message');
               noXrefFoundMessage.innerHTML = 'No xref found.';
               element.parentNode.insertBefore(noXrefFoundMessage, element.nextSibling);

               return
            };

            // To be used in the future
            const commitHashShort = match.commitHash && match.commitHash ? match.commitHash.substring(0, 7) : 'No hash';

            // Diff of the latest commit hash of a term file and the referenced commit hash
            const diff = document.createElement('a');
            diff.href = 'https://github.com/' + match.owner + '/' + match.repo + '/compare/' + match.commitHash + '../main';
            diff.target = '_blank';
            diff.rel = 'noopener noreferrer';
            diff.classList.add('diff', 'xref-info-links', 'btn');
            diff.innerHTML = '<svg icon><use xlink:href="#svg-github"></use></svg> Xref &lt; &gt; <svg icon><use xlink:href="#svg-github"></use></svg> Now';
            diff.title = 'A Diff between the current commit hash of the definition and the commit hash referenced when the link was created.';
            element.parentNode.insertBefore(diff, element.nextSibling);

            // Latest version of a term-file
            const latestVersion = document.createElement('a');
            latestVersion.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/main/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
            latestVersion.target = '_blank';
            latestVersion.rel = 'noopener noreferrer';
            latestVersion.classList.add('latest-version', 'xref-info-links', 'btn');
            latestVersion.innerHTML = '<svg icon><use xlink:href="#svg-github"></use></svg> Now';
            latestVersion.title = 'Go to the repo page of the definition‘s latest version.';
            diff.parentNode.insertBefore(latestVersion, element.nextSibling);

            // Exact commit hash at the time of referencing the file
            const exactCommitHash = document.createElement('a');
            exactCommitHash.href = 'https://github.com/' + match.owner + '/' + match.repo + '/blob/' + match.commitHash + '/' + match.terms_dir + '/' + match.term.replace(/ /g, '-').toLowerCase() + '.md';
            exactCommitHash.target = '_blank';
            exactCommitHash.rel = 'noopener noreferrer';
            exactCommitHash.classList.add('exact-commit-hash', 'xref-info-links', 'btn');
            exactCommitHash.innerHTML = '<svg icon><use xlink:href="#svg-github"></use></svg> Xref';
            exactCommitHash.title = 'Go to the repo page of the definition‘s version referenced when the link was created.';
            latestVersion.parentNode.insertBefore(exactCommitHash, element.nextSibling);

            // Diff of the latest version and the referenced version in a modal
            const showDiffModal = document.createElement('button');
            showDiffModal.classList.add('show-diff-modal', 'xref-info-links', 'btn');
            showDiffModal.innerHTML = 'Xref &lt; &gt; <svg icon><use xlink:href="#svg-github"></use></svg> Now';
            showDiffModal.title = 'Show diff between the latest version and the referenced version';
            latestVersion.parentNode.insertBefore(showDiffModal, element.nextSibling);
            showDiffModal.addEventListener('click', function (event) {
               event.preventDefault();
               fetchGitHubContent(savedToken, match);
            });

            // The stored version of the term-file
            const localStoredTerm = document.createElement('button');
            localStoredTerm.classList.add('show-diff-modal', 'xref-info-links', 'btn');
            localStoredTerm.innerHTML = 'Xref';
            localStoredTerm.title = 'Show the stored version of the term-file';
            showDiffModal.parentNode.insertBefore(localStoredTerm, element.nextSibling);
            localStoredTerm.addEventListener('click', function (event) {
               event.preventDefault();
               const content = match.content.replace(/\n/g, '<br>');
               showModal(`
                    <h1>Term definition (local snapshot)</h1>
                    <table>
                      <tr>
                        <th>Commit hash</th>
                        <td>${match.commitHash}</td>
                      </tr>
                      <tr>
                        <th>Content</th>
                        <td>${content}</td>
                      </tr>
                    </table>
                  `);
            });

            async function insertGitHubTerm() {
               const term = await fetchGitHubTerm(savedToken, match);
               const div = document.createElement('div');
               div.classList.add('fetched-xref-term');
               // const html = md.render(term);
               const html = term;
               div.innerHTML = html;
               element.parentNode.insertBefore(div, element.nextSibling);
            }
            insertGitHubTerm();
         }
      });
   });
}

document.addEventListener("DOMContentLoaded", function () {
   fetchCommitHashes();
});
