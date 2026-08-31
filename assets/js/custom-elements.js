


customElements.define('slide-panels', class SidePanels extends HTMLElement {
  static get observedAttributes() {
    return ['open'];
  }
  constructor() {
    super();

    this.addEventListener('pointerup', e => {
      if (e.target === this) this.close();
    })
  }
  get active() {
    return this.getAttribute('open');
  }
  toggle(panel) {
    this.active === panel ? this.close() : this.open(panel)
  }
  open(panel) {
    this.setAttribute('open', panel);
  }
  close() {
    this.removeAttribute('open');
  }

  attributeChangedCallback(attr, last, current) {
    if (attr === 'open') {
      for (let child of this.children) {
        if (child.id === current) child.setAttribute('open', '');
        else child.removeAttribute('open', '');
      }
    }
  }
});
customElements.define('detail-box', class DetailBox extends HTMLElement {
  static get observedAttributes() {
    return ['open'];
  }
  constructor() {
    super();

    this.addEventListener('pointerup', e => {
      if (e.target.hasAttribute('detail-box-toggle') || e.target.closest('[detail-box-toggle]')) {
        e.stopPropagation();
        this.toggle();
      }
    });

    this.addEventListener('keydown', e => {
      const toggle = e.target.closest('[detail-box-toggle]');
      if (!toggle || (e.key !== 'Enter' && e.key !== ' ')) {
        return;
      }
      e.preventDefault();
      this.toggle();
    });

    this.addEventListener('transitionend', e => {
      let node = e.target;
      if (node.parentElement === this && node.tagName === 'SECTION' && e.propertyName === 'height') {
        node.style.height = this.hasAttribute('open') ? 'auto' : null;
      }
    });
  }
  connectedCallback() {
    this.syncToggle();
  }
  toggle() {
    this.toggleAttribute('open');
  }
  syncToggle() {
    const toggle = this.querySelector('[detail-box-toggle]');
    if (!toggle) {
      return;
    }
    if (!toggle.hasAttribute('aria-label') && toggle.tagName !== 'BUTTON') {
      toggle.setAttribute('role', 'button');
      if (!toggle.hasAttribute('tabindex')) {
        toggle.setAttribute('tabindex', '0');
      }
    }
    toggle.setAttribute('aria-expanded', this.hasAttribute('open') ? 'true' : 'false');
  }
  attributeChangedCallback(attr, last, current) {
    if (attr === 'open') {
      this.syncToggle();
      for (let node of this.children) {
        if (node.tagName === 'SECTION') {
          if (current !== null) {
            if (node.offsetHeight < node.scrollHeight) {
              node.style.height = node.scrollHeight + 'px';
            }
          } else if (node.offsetHeight > 0) {
            node.style.height = node.offsetHeight + 'px';
            node.style.height = 0;
          }
        }
      }
    }
  }
});

customElements.define('tab-panels', class TabPanels extends HTMLElement {
  constructor() {
    super();
    delegateEvent('click', 'tab-panels > nav > *', (e, delegate) => {
      let nav = delegate.parentElement;
      if (nav.parentElement === this) {
        this.setAttribute('selected-index', Array.prototype.indexOf.call(nav.children, delegate))
      }
    }, { container: this, passive: true });

    this.addEventListener('keydown', e => {
      const tab = e.target.closest('[role="tab"]');
      const nav = this.querySelector(':scope > nav');
      if (!tab || !nav || tab.parentElement !== nav) {
        return;
      }
      const tabs = Array.from(nav.children);
      const currentIndex = tabs.indexOf(tab);
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      this.setAttribute('selected-index', nextIndex);
      tabs[nextIndex].focus();
    });
  }
  static get observedAttributes() {
    return ['selected-index'];
  }
  connectedCallback() {
    if (!this.hasAttribute('selected-index')) {
      this.setAttribute('selected-index', '0');
    } else {
      this.attributeChangedCallback('selected-index', null, this.getAttribute('selected-index'));
    }
  }
  attributeChangedCallback(attr, last, current) {
    domReady.then(() => {
      if (attr === 'selected-index') {
        let index = current || 0;
        let nav = this.querySelector('nav');
        if (nav && nav.parentElement === this) {
          nav.setAttribute('role', 'tablist');
          if (!this.id) {
            this.id = `tab-panels-${Math.random().toString(36).slice(2, 9)}`;
          }
          let tabs = nav.children;
          let selected = tabs[index];
          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            const isSelected = tab === selected;
            tab.removeAttribute('selected');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            tab.tabIndex = isSelected ? 0 : -1;
            if (!tab.id) {
              tab.id = `${this.id}-tab-${i}`;
            }
            if (isSelected) {
              tab.setAttribute('selected', '');
            }
          }
          let panel = Array.prototype.filter.call(this.children, node => {
            if (node.tagName === 'DIV') {
              node.removeAttribute('selected');
              return true;
            }
          })[index];
          Array.prototype.forEach.call(this.children, (node, panelIndex) => {
            if (node.tagName !== 'DIV') {
              return;
            }
            node.setAttribute('role', 'tabpanel');
            const matchingTab = tabs[panelIndex];
            if (matchingTab) {
              node.setAttribute('aria-labelledby', matchingTab.id);
              matchingTab.setAttribute('aria-controls', node.id || `${this.id}-panel-${panelIndex}`);
              if (!node.id) {
                node.id = `${this.id}-panel-${panelIndex}`;
                matchingTab.setAttribute('aria-controls', node.id);
              }
            }
          });
          if (panel) panel.setAttribute('selected', '');
        }
      }
    });
  }
});