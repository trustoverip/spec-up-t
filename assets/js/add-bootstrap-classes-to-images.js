/**
 * @file This file adds Bootstrap classes to images for better responsiveness and styling.
 * @author Kor Dwarshuis
 * @version 1.0.0
 */

/**
 * Function to add Bootstrap classes to images for better responsiveness
 */
function addBootstrapClassesToImages() {
  const images = document.querySelectorAll('#content img');
  images.forEach(image => {
    // Add Bootstrap responsive image class
    image.classList.add('img-fluid');
    
    // Optional: Add rounded corners
    image.classList.add('rounded');
    
    // Optional: Add subtle shadow for better appearance
    image.classList.add('shadow-sm');
    
    // Add appropriate margins
    image.classList.add('my-3');
    
    // Create a figure element for images that are not already in one
    if (!image.closest('figure') && !image.parentElement.classList.contains('image-container')) {
      // Check if not already wrapped
      const figure = document.createElement('figure');
      figure.classList.add('figure', 'text-center');
      
      // Get the original parent and replace the image with the figure
      const parent = image.parentElement;
      parent.replaceChild(figure, image);
      
      // Add the image to the figure
      figure.appendChild(image);
      
      // If the image has an alt text, create a caption
      if (image.alt && image.alt.trim() !== '') {
        const figcaption = document.createElement('figcaption');
        figcaption.classList.add('figure-caption', 'text-center');
        figcaption.textContent = image.alt;
        figure.appendChild(figcaption);
      }
    }
  });
}

/**
 * Initialize the image enhancement with Bootstrap classes
 */
function initImageBootstrapClasses() {
  const markdownElement = document.querySelector('#content');
  
  if (markdownElement) {
    // Initialize bootstrap classes for all existing images
    addBootstrapClassesToImages();
    
    // Add a mutation observer to detect dynamically added images
    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach(mutation => {
          // Check if new nodes were added
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Look for added images
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element node
                if (node.tagName === 'IMG') {
                  shouldUpdate = true;
                } else if (node.querySelector && node.querySelector('img')) {
                  shouldUpdate = true;
                }
              }
            });
          }
        });
        
        if (shouldUpdate) {
          // Apply Bootstrap classes to newly added images
          addBootstrapClassesToImages();
        }
      });
      
      // Start observing content changes
      observer.observe(markdownElement, { 
        childList: true, 
        subtree: true 
      });
    }
  }
}

// Run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initImageBootstrapClasses();
});
