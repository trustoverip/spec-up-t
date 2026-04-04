/**
 * @file Intercepts clicks on external tref/xref navigation links and shows
 * an intermediate modal before navigating to another specification.
 *
 * Why: Spec-Up-T specs share a consistent layout, so navigating to an external
 * spec feels like staying on the same site. The modal makes the context-switch
 * explicit, improving user orientation.
 *
 * Progressive enhancement: the link's native href still works when JS is absent.
 *
 * Relevant selectors:
 * - `a.x-term-reference` — inline xref/tref links in the spec body
 * - `dd.meta-info-content-wrapper a` — "Link" row inside tref definition panels
 */
(function () {
    'use strict';

    /** Selectors for the two types of external navigating links */
    const SELECTOR_X_TERM = 'a.x-term-reference';
    const SELECTOR_META_LINK = 'dd.meta-info-content-wrapper a';

    /** Delay before auto-navigating (seconds) */
    const AUTO_NAVIGATE_DELAY_S = 10;

    /**
     * Returns true when the given href points to a different hostname,
     * i.e. outside the current specification.
     *
     * @param {string} href
     * @returns {boolean}
     */
    function isExternalUrl(href) {
        try {
            return new URL(href, window.location.href).hostname !== window.location.hostname;
        } catch {
            return false;
        }
    }

    /**
     * Resolves a human-readable spec name from the href.
     * Uses the global `allXTrefs` dataset when available (populated at build time),
     * otherwise falls back to the URL hostname.
     *
     * @param {string} href
     * @returns {string}
     */
    function resolveSpecName(href) {
        if (typeof allXTrefs !== 'undefined' && Array.isArray(allXTrefs?.xtrefs)) {
            const match = allXTrefs.xtrefs.find(x => href.startsWith(x.ghPageUrl));
            if (match?.externalSpec) {
                return match.externalSpec;
            }
        }
        try {
            return new URL(href).hostname;
        } catch {
            return href;
        }
    }

    /**
     * Builds the modal DOM structure and returns the overlay element.
     * Uses textContent for all user-supplied strings to prevent XSS.
     *
     * @param {string} href - The external URL being navigated to
     * @param {string} specName - Human-readable name of the destination spec
     * @param {Function} onClose - Callback invoked when the modal should close
     * @returns {{ overlay: HTMLElement, noticeEl: HTMLElement }} overlay and the live notice element
     */
    function buildModalOverlay(href, specName, onClose) {
        /* Overlay */
        const overlay = document.createElement('div');
        overlay.className = 'spec-up-t-modal-overlay';

        /* Modal box — reuses existing .spec-up-t-modal styles */
        const modal = document.createElement('div');
        modal.className = 'spec-up-t-modal tref-nav-modal';

        /* Heading */
        const heading = document.createElement('h2');
        heading.textContent = 'Navigating to external specification';

        /* Description */
        const description = document.createElement('p');
        const specStrong = document.createElement('strong');
        specStrong.textContent = specName;
        description.append('', specStrong);

        /* URL display */
        const urlEl = document.createElement('p');
        urlEl.className = 'tref-nav-url';
        urlEl.textContent = href;

        /* Notice with live countdown */
        const notice = document.createElement('p');
        notice.className = 'tref-nav-notice';
        const countdownSpan = document.createElement('span');
        countdownSpan.className = 'tref-nav-countdown';
        countdownSpan.textContent = String(AUTO_NAVIGATE_DELAY_S);
        notice.append('Navigating in ', countdownSpan, '\u2009s\u2026');

        /* Actions row */
        const actions = document.createElement('div');
        actions.className = 'tref-nav-actions';

        /* "Go now" button — plain anchor so the browser handles navigation */
        const goBtn = document.createElement('a');
        goBtn.className = 'btn btn-primary tref-nav-go-btn';
        goBtn.href = href;
        goBtn.textContent = 'Go now';

        /* "Cancel" button */
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-secondary tref-nav-cancel-btn';
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', onClose);

        actions.append(goBtn, cancelBtn);
        modal.append(heading, description, urlEl, notice, actions);
        overlay.appendChild(modal);

        /* Close on backdrop click */
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) {
                onClose();
            }
        });

        /* Close on Escape key */
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                onClose();
            }
        }, { once: true });

        return { overlay, countdownSpan };
    }

    /**
     * Shows the external-navigation modal for the given href.
     * Auto-navigates after AUTO_NAVIGATE_DELAY_S seconds unless cancelled.
     * A live countdown ticks every second.
     *
     * @param {string} href - The external URL to navigate to
     * @param {string} specName - Human-readable name of the destination spec
     */
    function showTrefNavModal(href, specName) {
        function doClose() {
            clearTimeout(navTimer);
            clearInterval(tickInterval);
            overlay.remove();
        }

        const { overlay, countdownSpan } = buildModalOverlay(href, specName, doClose);
        document.body.appendChild(overlay);

        let remaining = AUTO_NAVIGATE_DELAY_S;

        /* Tick every second to update the displayed countdown */
        const tickInterval = setInterval(function () {
            remaining -= 1;
            countdownSpan.textContent = String(remaining);
        }, 1000);

        const navTimer = setTimeout(function () {
            clearInterval(tickInterval);
            window.location.href = href;
        }, AUTO_NAVIGATE_DELAY_S * 1000);
    }

    /**
     * Delegated click handler attached to the document.
     * Checks whether the clicked (or ancestor) element is a qualifying external link
     * and, if so, prevents default navigation and shows the modal instead.
     *
     * @param {MouseEvent} event
     */
    function handleLinkClick(event) {
        const target = event.target;
        const link = target.closest(SELECTOR_X_TERM) || target.closest(SELECTOR_META_LINK);

        if (!link) {
            return;
        }

        const href = link.getAttribute('href');

        if (!href || !isExternalUrl(href)) {
            return;
        }

        event.preventDefault();
        showTrefNavModal(href, resolveSpecName(href));
    }

    document.addEventListener('click', handleLinkClick);
}());
