/*
  Author: Kor Dwarshuis, kor@dwarshuis.com
  Created: 2024-03-30
  Description: Highlight menu items based on visibility of corresponding headings in main content. Styling in /assets/css/highlightMenuItems.css
*/

function highlightMenuItems() {
   let lastHeadingInView = null;

   function highlightMenuItem(heading) {
      // Remove highlight from all menu items first
      document.querySelectorAll('#toc a').forEach(item => {
         item.classList.remove("menu-item-highlighted");
      });

      // Highlight the new menu item
      const menuItem = document.querySelector(`#toc a[href="#${heading.id}"]`);
      if (menuItem) {
         menuItem.classList.add("menu-item-highlighted");
         
         // Expand all parent items that contain this menu item
         let parentLi = menuItem.closest('li');
         const parentsToExpand = [];
         
         // Collect all parent li elements
         while (parentLi) {
            parentsToExpand.push(parentLi);
            // Move to the parent li (skip the ul)
            const parentUl = parentLi.parentElement;
            if (parentUl && parentUl.tagName === 'UL') {
               parentLi = parentUl.closest('li');
            } else {
               parentLi = null;
            }
         }
         
         // Use setTimeout to ensure collapsible menu is initialized
         setTimeout(() => {
            // Collapse all items first
            document.querySelectorAll('#toc li.has-children').forEach(item => {
               const toggleBtn = item.querySelector('.collapse-toggle');
               if (toggleBtn && !parentsToExpand.includes(item)) {
                  item.classList.add('collapsed');
                  toggleBtn.classList.add('collapsed');
                  toggleBtn.setAttribute('aria-expanded', 'false');
               }
            });
            
            // Expand the parents of the active item
            parentsToExpand.forEach(parent => {
               if (parent.classList.contains('has-children')) {
                  const toggleBtn = parent.querySelector('.collapse-toggle');
                  if (toggleBtn) {
                     parent.classList.remove('collapsed');
                     toggleBtn.classList.remove('collapsed');
                     toggleBtn.setAttribute('aria-expanded', 'true');
                  }
               }
            });
         }, 50);
         
         // Scroll the menu item into view within the sidebar only (without affecting main scroll)
         const tocContainer = document.getElementById('toc');
         if (tocContainer && menuItem) {
            const tocRect = tocContainer.getBoundingClientRect();
            const itemRect = menuItem.getBoundingClientRect();
            
            // Check if item is outside the visible area of the TOC container
            if (itemRect.top < tocRect.top || itemRect.bottom > tocRect.bottom) {
               // Scroll the TOC container, not the whole page
               const scrollOffset = itemRect.top - tocRect.top - (tocRect.height / 2) + (itemRect.height / 2);
               tocContainer.scrollBy({ top: scrollOffset, behavior: 'smooth' });
            }
         }

         // Dispatch custom event for the collapsible menu to handle
         document.dispatchEvent(new CustomEvent('highlight-menu-item', {
            detail: { menuItem, headingId: heading.id }
         }));
      }
   }

   const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
   };

   const observer = new IntersectionObserver((entries, observer) => {
      // Find all headings currently in view
      const headingsInView = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);

      if (headingsInView.length > 0) {
         // Update last heading in view to the first one found in the current viewport
         lastHeadingInView = headingsInView[0];
         highlightMenuItem(lastHeadingInView);
      } else if (lastHeadingInView) {
         // No headings are currently in view
         // Highlight the last heading in view if it exists
         highlightMenuItem(lastHeadingInView);
      }
   }, options);

   document.querySelectorAll('h2, h3, h4, h5, h6').forEach(target => observer.observe(target));
}

document.addEventListener("DOMContentLoaded", function () {
   highlightMenuItems();
});
