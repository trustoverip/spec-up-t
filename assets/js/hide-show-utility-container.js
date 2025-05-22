function hideShowUtilityContainer() {
   // Check if the terms and definitions list exists
   // If it doesn't exist, exit the function
   // This prevents errors when the script is run on pages without the terms and definitions list
   // and ensures that the script only runs when necessary
   const termsListElement = document.querySelector(".terms-and-definitions-list");
   const dtElements = termsListElement ? termsListElement.querySelectorAll("dt") : [];

   if (dtElements.length === 0) {
      document.getElementById("terminology-section-utility-container")?.remove();
   }
}

document.addEventListener("DOMContentLoaded", function () {
   hideShowUtilityContainer();
});
