/**
 * @file This file copies the url of an anchor to the clipboard when clicked
 * @author Kor Dwarshuis
 * @version 0.0.1
 * @since 2024-06-20
 */
function copyAnchorToCliboard() {
    // add click event to all .toc-anchor via event delegation
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('toc-anchor')) {
            e.preventDefault();
            const anchorText = e.target.href;
            navigator.clipboard.writeText(anchorText).then(() => {
                console.log('Anchor copied to clipboard');
                notyf.success(`Anchor copied to clipboard: ${anchorText}`);
            }).catch(err => {
                console.error('Failed to copy anchor to clipboard', err);
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    copyAnchorToCliboard();
});
