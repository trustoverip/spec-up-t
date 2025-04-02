/**
 * @file This file adds an href attribute to the snapshot link on the page via client side JS DOM manipulation.
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @license MIT
 * @since 2024-09-25
 */

function addHrefToSnapshotLink() {
   const snapshotLink = document.querySelector('#snapshotLink');

   // Get the current URL of the page
   const currentUrl = window.location.href;

   // Regex to match up to and including the 'versions/' directory (if it exists)
   const versionsMatch = currentUrl.match(/^(https?:\/\/[^\/]+(?:\/[^\/]+)*)\/versions\/(?:[^\/]+\/)?/);

   // If we are already in the 'versions' directory or deeper, strip down to 'versions/'
   // Otherwise, append '/versions/' to the current directory
   let snapshotLinkHref;
   if (versionsMatch) {
      snapshotLinkHref = `${versionsMatch[1]}/versions/`;
   } else {
      // Append '/versions/' to the current directory
      const urlWithoutAnchor = currentUrl.split('#')[0];
      const urlWithoutIndex = urlWithoutAnchor.replace(/\/index\.html$/, '');
      snapshotLinkHref = urlWithoutIndex.replace(/\/$/, '') + '/versions/';
   }

   // Set the 'href' attribute of the snapshot link element to the constructed URL
   if (snapshotLink) {
      snapshotLink.setAttribute('href', snapshotLinkHref);
   }
}

document.addEventListener("DOMContentLoaded", function () {
   addHrefToSnapshotLink();
});
