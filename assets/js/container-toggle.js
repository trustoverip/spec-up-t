// Container toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the toggle button and container
    const containerToggle = document.getElementById('container_toggle');
    const mainContainer = document.querySelector('.container');
    
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('container_width_preference');
    
    // Apply saved preference if it exists
    if (savedPreference === 'container-fluid') {
        mainContainer.classList.remove('container');
        mainContainer.classList.add('container-fluid');
        containerToggle.querySelector('i').classList.remove('bi-arrows-angle-expand');
        containerToggle.querySelector('i').classList.add('bi-arrows-angle-contract');
    }
    
    // Add click event listener to toggle button
    containerToggle.addEventListener('click', function() {
        if (mainContainer.classList.contains('container')) {
            // Switch to fluid container
            mainContainer.classList.remove('container');
            mainContainer.classList.add('container-fluid');
            containerToggle.querySelector('i').classList.remove('bi-arrows-angle-expand');
            containerToggle.querySelector('i').classList.add('bi-arrows-angle-contract');
            localStorage.setItem('container_width_preference', 'container-fluid');
        } else {
            // Switch to fixed container
            mainContainer.classList.remove('container-fluid');
            mainContainer.classList.add('container');
            containerToggle.querySelector('i').classList.remove('bi-arrows-angle-contract');
            containerToggle.querySelector('i').classList.add('bi-arrows-angle-expand');
            localStorage.setItem('container_width_preference', 'container');
        }
    });
});