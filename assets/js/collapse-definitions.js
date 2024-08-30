function collapseDefinitions() {
    function toggleVisibility() {
        const dds = document.querySelectorAll('dl dd');
        dds.forEach(dd => {
            if (dd.classList.contains('hidden')) {
                console.log('hidden');
                dd.classList.remove('hidden');
                dd.classList.add('visible');
            } else {
                console.log('visible');
                dd.classList.add('hidden');
                dd.classList.remove('visible');
            }
        });
    }
    // Add button as last child of every <dl>
    document.querySelectorAll('dt').forEach(dt => {
        const button = document.createElement('button');
        button.classList.add('collapse-definitions-button')
        button.innerHTML = 'Toggle';
        button.setAttribute('id', 'toggleButton');
        dt.appendChild(button);
    });

    // Via event delegation add event listener to every .collapse-definitions-button element
    document.addEventListener('click', event => {
        if (event.target.classList.contains('collapse-definitions-button')) {
            toggleVisibility();

            const rect = event.target.getBoundingClientRect();
            console.log('rect: ', rect);
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            console.log('scrollTop: ', scrollTop);
            const elementTop = rect.top + scrollTop;
            console.log('elementTop: ', elementTop);

            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
    });

}

document.addEventListener("DOMContentLoaded", function () {
    collapseDefinitions();
});
