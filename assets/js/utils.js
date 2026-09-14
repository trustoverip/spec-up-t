function delegateEvent(type, selector, fn, options = {}){
  return (options.container || document).addEventListener(type, e => {
    let match = e.target.closest(selector);
    if (match) fn(e, match);
  }, options);
}

/**
 * Interactive descendants that should participate in a keyboard focus trap.
 * Filters out hidden or disabled controls.
 *
 * @param {ParentNode} container
 * @returns {HTMLElement[]}
 */
function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  return Array.from(container.querySelectorAll(selector)).filter((element) => {
    if (element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true' || element.hidden) {
      return false;
    }
    const style = globalThis.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

/**
 * Keeps Tab / Shift+Tab cycling inside `container` (WCAG 2.4.3).
 *
 * @param {KeyboardEvent} event
 * @param {HTMLElement} container
 */
function handleFocusTrap(event, container) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

const skipAnimationFrame = fn => requestAnimationFrame(() => requestAnimationFrame(fn));

const domReady = new Promise(resolve => {
  if (document.readyState !== 'loading') {
    resolve();
  } else {
    document.addEventListener('DOMContentLoaded', e => resolve());
  }
});