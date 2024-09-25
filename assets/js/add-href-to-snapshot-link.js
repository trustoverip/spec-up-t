/**
 * @file This file adds an href attribute to the snapshot link on the page via client side JS DOM manipulation.
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @license MIT
 * @since 2024-09-25
 */

function addHrefToSnapshotLink() {
   // Find the snapshot link and add the href attribute
   const snapshotLink = document.querySelector('.snapshots a');

   // Get the current URL of the page
   const currentUrl = window.location.href;

   // Use a regular expression to match the base URL up to the 'versions' directory
   // The regex matches 'http(s)://', followed by any characters that are not '/', followed by '/'
   // followed by any characters that are not '/', followed by '/', followed by 'versions/'
   const baseUrlMatch = currentUrl.match(/^(https?:\/\/[^\/]+\/[^\/]+\/)versions\//);

   // If the match is found, use the matched string as the base URL, otherwise use an empty string
   const baseUrl = baseUrlMatch ? baseUrlMatch[1] : '';

   // Construct the snapshot link href by appending 'versions/' to the base URL
   const snapshotLinkHref = `${baseUrl}versions/`;

   // Set the 'href' attribute of the snapshot link element to the constructed URL
   if (snapshotLink) {
      snapshotLink.setAttribute('href', snapshotLinkHref);
   }

}

document.addEventListener("DOMContentLoaded", function () {
   addHrefToSnapshotLink();
});
