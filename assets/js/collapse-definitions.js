function collapseDefinitions() {
    function toggleVisibility() {
        const dds = document.querySelectorAll('#content dl dd');
        dds.forEach(dd => {
            if (dd.classList.contains('hidden')) {
                dd.classList.remove('hidden');
                dd.classList.add('visible');
                document.querySelectorAll('.collapse-all-defs-button').forEach(button => {
                    button.innerHTML = '▲';
                    button.title = 'Collapse all definitions';
                });
            } else {
                dd.classList.add('hidden');
                dd.classList.remove('visible');
                document.querySelectorAll('.collapse-all-defs-button').forEach(button => {
                    button.innerHTML = '▼';
                    button.title = 'Expand all definitions';
                });
            }
        });
    }
    // Add button as last child of every <dl>
    document.querySelectorAll('dt > span > span > span').forEach(dt => {
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
