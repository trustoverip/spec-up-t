function collapseDefinitions() {
    const dds = document.querySelectorAll('#content dl.terms-and-definitions-list > dd');
    const dts = document.querySelectorAll('#content dl.terms-and-definitions-list > dt');
    const buttonTitleTextCollapsed = 'Expand all definitions';
    const buttonTitleTextExpanded = 'Collapse all definitions';

    function toggleVisibility() {
        const buttons = document.querySelectorAll('.collapse-all-defs-button');
        const isHidden = dds[0].classList.contains('hidden');
        dds.forEach(dd => {
            dd.classList.toggle('hidden', !isHidden);
            dd.classList.toggle('visible', isHidden);
        });
        buttons.forEach(button => {
            button.innerHTML = isHidden ? '▲' : '▼';
            button.title = isHidden ? buttonTitleTextExpanded : buttonTitleTextCollapsed;
        });
        document.querySelector('html').classList.toggle('defs-hidden');
    }

    // Add button as last child of every <dl>
    dts.forEach(dt => {
        const button = document.createElement('button');
        button.classList.add('collapse-all-defs-button', 'd-print-none', 'btn', 'p-0', 'fs-5', 'd-flex', 'align-items-center','justify-content-center');
        button.innerHTML = '▲';
        button.setAttribute('id', 'toggleButton');
        button.setAttribute('title', buttonTitleTextExpanded);
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