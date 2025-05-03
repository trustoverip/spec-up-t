/**
 * Implements Docusaurus-like collapsible navigation menu for the TOC with accessibility support
 */
function initCollapsibleMenu() {
  // The TOC is within the #toc container element
  const tocContainer = document.getElementById('toc');
  if (!tocContainer) {
    console.warn("TOC container not found");
    return;
  }

  // Clear any existing toggle buttons to prevent duplicates when reinitializing
  const existingButtons = tocContainer.querySelectorAll('.collapse-toggle');
  existingButtons.forEach(button => button.remove());
  
  // Get all TOC list items with children
  // The TOC structure is ul.toc within #toc container
  const tocItems = tocContainer.querySelectorAll('ul li');
  
  tocItems.forEach((item, index) => {
    const hasChildren = item.querySelector('ul');
    
    if (hasChildren) {
      // Mark item as having children
      item.classList.add('has-children');
      
      // Create toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'collapse-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle section');
      toggleBtn.setAttribute('type', 'button');
      toggleBtn.id = `toc-toggle-${index}`;
      
      // Find the direct link child of the item to position the button next to it
      const linkElement = item.querySelector(':scope > a');
      
      // Improve accessibility by marking the relationship between button and menu
      if (linkElement) {
        // Get the text of the link for the aria-label
        const linkText = linkElement.textContent.trim();
        toggleBtn.setAttribute('aria-label', `Toggle ${linkText} section`);
        
        // Add the toggle button next to the link
        linkElement.parentNode.insertBefore(toggleBtn, linkElement.nextSibling);
        
        // Connect the link and the toggle button for better accessibility
        hasChildren.setAttribute('role', 'group');
        hasChildren.setAttribute('aria-labelledby', linkElement.id || `toc-item-${index}`);
        
        // If the link doesn't have an ID, add one for reference
        if (!linkElement.id) {
          linkElement.id = `toc-item-${index}`;
        }
      } else {
        // Fallback - just append to the item
        item.appendChild(toggleBtn);
      }
      
      // Add aria attributes for accessibility
      toggleBtn.setAttribute('aria-controls', `toc-children-${index}`);
      hasChildren.id = `toc-children-${index}`;
      
      // Add click event to toggle button
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isCollapsed = item.classList.contains('collapsed');
        
        // Toggle collapsed state
        if (isCollapsed) {
          item.classList.remove('collapsed');
          toggleBtn.classList.remove('collapsed');
          toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
          item.classList.add('collapsed');
          toggleBtn.classList.add('collapsed');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Add keyboard navigation
      toggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleBtn.click();
        }
      });
      
      // Set initial states - expand the active section, collapse others
      const hasActiveChild = item.querySelector('a.highlight-cfib41dyhcd99sm, a.active');
      if (!hasActiveChild) {
        item.classList.add('collapsed');
        toggleBtn.classList.add('collapsed');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    }
  });
  
  console.log('Collapsible menu initialized with accessibility improvements');
}

// Log TOC structure to help debugging
function logTOCStructure() {
  const tocContainer = document.getElementById('toc');
  if (tocContainer) {
    console.log('TOC container found:', tocContainer);
    console.log('TOC container children:', tocContainer.children);
    const firstUL = tocContainer.querySelector('ul');
    if (firstUL) {
      console.log('First UL found:', firstUL);
      console.log('UL class list:', firstUL.classList);
      const listItems = firstUL.querySelectorAll('li');
      console.log('List items count:', listItems.length);
    } else {
      console.warn('No UL found in TOC container');
    }
  } else {
    console.warn('TOC container not found');
  }
}

// Run after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initCollapsibleMenu();
  // Log the TOC structure for debugging
  logTOCStructure();
});

// Re-initialize when highlighting changes
document.addEventListener('highlight-menu-item', initCollapsibleMenu);