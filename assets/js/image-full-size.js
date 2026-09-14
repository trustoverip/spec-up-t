/**
 * @file This file adds functionality to display images in full-size on a web page when clicked. The functionality is implemented via a class added to the image element.
 * @author Kor Dwarshuis
 * @version 1.0.0
 */


const imageFullSize = () => {
  const imageFullSizeClass = 'image-full-page';
  const markdownElement = document.querySelector('#content');
  let previouslyFocused = null;
  let overlayKeydownHandler = null;

  function removeContainer() {
    const container = document.querySelector('.image-container-full-page');
    if (!container) {
      return;
    }
    if (overlayKeydownHandler) {
      document.removeEventListener('keydown', overlayKeydownHandler);
      overlayKeydownHandler = null;
    }
    container.remove();
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  }

  function openLightbox(image) {
    if (document.querySelector('.image-container-full-page')) {
      return;
    }

    previouslyFocused = document.activeElement;

    const clonedImage = image.cloneNode(true);
    clonedImage.removeAttribute('tabindex');
    clonedImage.removeAttribute('role');
    clonedImage.classList.remove(imageFullSizeClass);

    const container = document.createElement('div');
    container.classList.add('image-container', 'image-container-full-page');
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-label', image.alt ? `Enlarged image: ${image.alt}` : 'Enlarged image');
    container.tabIndex = -1;

    const closeHint = document.createElement('p');
    closeHint.className = 'visually-hidden';
    closeHint.textContent = 'Press Escape or activate the image to close.';

    container.append(closeHint, clonedImage);
    document.body.appendChild(container);

    overlayKeydownHandler = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        removeContainer();
        return;
      }
      handleFocusTrap(event, container);
    };
    document.addEventListener('keydown', overlayKeydownHandler);

    container.addEventListener('click', function containerClickEvent() {
      container.removeEventListener('click', containerClickEvent);
      removeContainer();
    });

    container.focus();
  }

  function isLightboxCandidate(image) {
    return image
      && image.tagName === 'IMG'
      && markdownElement.contains(image)
      && !image.closest('a')
      && !image.classList.contains('scrollHintImage');
  }

  function enhanceImage(image) {
    if (!isLightboxCandidate(image) || image.dataset.fullSizeEnhanced === 'true') {
      return;
    }
    image.dataset.fullSizeEnhanced = 'true';
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    const label = image.alt && image.alt.trim() !== ''
      ? `View larger: ${image.alt}`
      : 'View larger image';
    image.setAttribute('aria-label', label);
  }

  if (markdownElement) {
    markdownElement.querySelectorAll('img').forEach(enhanceImage);

    markdownElement.addEventListener('click', (event) => {
      if (event.target.tagName === 'IMG' && isLightboxCandidate(event.target)) {
        openLightbox(event.target);
        event.target.classList.toggle(imageFullSizeClass);
      }
    });

    markdownElement.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && isLightboxCandidate(event.target)) {
        event.preventDefault();
        openLightbox(event.target);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        removeContainer();
      }
    });

  } else {
    console.log("Element with class '.markdown' not found.");
  }
};

document.addEventListener('DOMContentLoaded', () => {
  imageFullSize();
});
