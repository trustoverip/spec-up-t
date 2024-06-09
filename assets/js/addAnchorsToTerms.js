function addAnchorsToTerms() {
    const dts = document.querySelectorAll('dt > span');

    dts.forEach(dt => {
        // dt.classList.add('toc-anchor');
        const id = dt.getAttribute('id');
        const a = document.createElement('a');
        a.setAttribute('href', `#${id}`);
        a.setAttribute('class', 'toc-anchor');
        a.innerHTML = '§ ';
        dt.parentNode.insertBefore(a, dt);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    addAnchorsToTerms();
});
