document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Room Search Form handling
    const roomForm = document.getElementById('room-search-form');
    if (roomForm) {
        roomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = roomForm.querySelector('select').value;
            alert(`Searching for available ${type} rooms in Tiruvannamalai...`);
        });
    }

    // Book Now button handling
    document.querySelectorAll('.btn-book-now').forEach(button => {
        button.addEventListener('click', function () {
            const stayName = this.parentElement.querySelector('h4').innerText;
            alert(`Redirecting to booking page for: ${stayName}`);
        });
    });
});
