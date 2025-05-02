function addAnchorsToTerms() {
    // Function to find the deepest <span>
    // Spec-Up is generating nested spans. The deepest span is the main term, and that is what we need.
    function findDeepestSpan(element) {
        let currentElement = element;
        // While there is a <span> child, keep going deeper
        while (currentElement.querySelector('span[id^="term:"]')) {
            currentElement = currentElement.querySelector('span[id^="term:"]');
        }
        return currentElement;
    }


    const dts = document.querySelectorAll('dt:has(> span[id^="term:"])');

    dts.forEach(item => {

        const dt = findDeepestSpan(item);
        // dt.classList.add('toc-anchor');
        const id = dt.getAttribute('id');
        const a = document.createElement('a');
        a.setAttribute('href', `#${id}`);
        a.setAttribute('class', 'toc-anchor d-print-none');
        a.innerHTML = '# '; // was '§';
        dt.parentNode.insertBefore(a, dt);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    addAnchorsToTerms();
});
