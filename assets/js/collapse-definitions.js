function collapseDefinitions() {
    const dds = document.querySelectorAll('#content dl dd');
    const buttons = document.querySelectorAll('.collapse-all-defs-button');

    function toggleVisibility() {
        const isHidden = dds[0].classList.contains('hidden');
        dds.forEach(dd => {
            dd.classList.toggle('hidden', !isHidden);
            dd.classList.toggle('visible', isHidden);
        });
        buttons.forEach(button => {
            button.innerHTML = isHidden ? '▲' : '▼';
            button.title = isHidden ? 'Collapse all definitions' : 'Expand all definitions';
        });
    }

    // Add button as last child of every <dl>
    document.querySelectorAll('dt').forEach(dt => {
        const button = document.createElement('button');
        button.classList.add('collapse-all-defs-button', 'btn');
        button.innerHTML = '▲';
        button.setAttribute('id', 'toggleButton');
        dt.appendChild(button);
    });

    // Via event delegation add event listener to every .collapse-all-defs-button element
    document.addEventListener('click', event => {
        if (event.target.classList.contains('collapse-all-defs-button')) {
            toggleVisibility();

            event.target.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });

            // Adjust the scroll position by 100px smoothly
            setTimeout(() => {
                window.scrollBy({
                    top: -100,
                    behavior: 'smooth'
                });
            }, 500); // Delay to ensure the initial scrollIntoView completes
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    collapseDefinitions();
});