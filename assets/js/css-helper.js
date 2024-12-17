/*
    JS to help with CSS.
*/

function addClassToTranscludedTerms() {
    // Find all spans with class 'transcluded-xref-term'
    const spans = document.querySelectorAll('span.transcluded-xref-term');

    spans.forEach(span => {
        // Find the closest <dt> ancestor
        const dt = span.closest('dt');
        if (dt) {
            // Add class 'transcluded-xref-term' to the <dt>
            dt.classList.add('transcluded-xref-term');

            // Get the next sibling elements until the next <dt> or </dl>
            let sibling = dt.nextElementSibling;
            while (sibling && sibling.tagName !== 'DT' && sibling.tagName !== 'DL') {
                if (sibling.tagName === 'DD') {
                    sibling.classList.add('transcluded-xref-term');
                }
                sibling = sibling.nextElementSibling;
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    addClassToTranscludedTerms();
});
