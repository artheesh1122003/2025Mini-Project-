class Auth {
    static login(role) {
        localStorage.setItem('userRole', role);
        if (role === 'admin') {
            window.location.href = 'index.html';
        } else {
            window.location.href = 'live-map.html';
        }
    }

    static logout() {
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    }

    static checkAccess(allowedRoles) {
        const role = localStorage.getItem('userRole');

        if (!role) {
            window.location.href = 'login.html';
            return;
        }

        if (!allowedRoles.includes(role)) {
            // Redirect based on role
            if (role === 'student') {
                window.location.href = 'live-map.html';
            } else {
                window.location.href = 'index.html';
            }
        }

        // Apply UI changes based on role
        this.updateUI(role);
    }

    static updateUI(role) {
        if (role === 'student') {
            document.body.classList.add('role-student');

            // Hide restricted sidebar items
            const sidebar = document.querySelector('.nav-menu');
            if (sidebar) {
                // Keep only Live Map (index 1 usually, but let's filter by link)
                const links = sidebar.querySelectorAll('.nav-link');
                links.forEach(link => {
                    if (!link.innerText.includes('Live Map')) {
                        link.style.display = 'none';
                    }
                });
            }

            // Update Profile Info from stored session
            const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            const profileName = document.querySelector('.user-info h4');
            const profileRole = document.querySelector('.user-info p');
            const avatar = document.querySelector('.avatar img');

            const displayName = storedUser.name || 'Student User';
            const displayRole = storedUser.rollNo ? `Roll: ${storedUser.rollNo}` : 'SKP Engineering';

            if (profileName) profileName.textContent = displayName;
            if (profileRole) profileRole.textContent = displayRole;
            if (avatar) avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`;
        }

        // Bind Logout Button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }
}
