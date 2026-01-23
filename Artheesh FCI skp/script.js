document.addEventListener('DOMContentLoaded', () => {
    // Search Functionality for Courses
    const searchInput = document.querySelector('.search-bar input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const courseCards = document.querySelectorAll('.course-card');

            courseCards.forEach(card => {
                const titleElement = card.querySelector('h3');
                if (titleElement) {
                    const title = titleElement.textContent.toLowerCase();
                    if (title.includes(searchTerm)) {
                        card.style.display = ''; // Show
                        // specific animation for showing could be added here
                        card.style.animation = 'fadeIn 0.3s ease-out';
                    } else {
                        card.style.display = 'none'; // Hide
                    }
                }
            });
        });
    }

    // Add simple animation for cards on load
    const cards = document.querySelectorAll('.course-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s forwards`;
    });

    // Mobile Sidebar Toggle
    const menuBtn = document.querySelector('.menu-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (menuBtn && sidebar && overlay) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
});
