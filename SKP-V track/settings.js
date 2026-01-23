document.addEventListener('DOMContentLoaded', () => {
    applyThemeGlobal();
    initSettingsPage();
});

function applyThemeGlobal() {
    const isDark = localStorage.getItem('skp_theme') !== 'light';
    const toggle = document.getElementById('themeToggle');

    if (isDark) {
        document.body.classList.remove('light-mode');
        if (toggle) toggle.checked = true;
    } else {
        document.body.classList.add('light-mode');
        if (toggle) toggle.checked = false;
    }
}

function initSettingsPage() {
    // 1. Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                // Dark Mode
                document.body.classList.remove('light-mode');
                localStorage.setItem('skp_theme', 'dark');
            } else {
                // Light Mode
                document.body.classList.add('light-mode');
                localStorage.setItem('skp_theme', 'light');
            }
        });
    }

    // 2. Profile Form
    // Since I didn't add IDs to the form in HTML, I'll select by structure or add IDs. 
    // It's the first .vehicle-form in the page.
    const forms = document.querySelectorAll('.vehicle-form');
    if (forms.length > 0) {
        const profileForm = forms[0];

        // Initial Load
        const inputs = profileForm.querySelectorAll('input');
        if (inputs.length >= 2) {
            const savedName = localStorage.getItem('skp_user_name');
            const savedEmail = localStorage.getItem('skp_user_email');

            if (savedName) inputs[0].value = savedName;
            if (savedEmail) inputs[1].value = savedEmail;
        }

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = profileForm.querySelectorAll('input');
            const newName = inputs[0].value;
            const newEmail = inputs[1].value;

            localStorage.setItem('skp_user_name', newName);
            localStorage.setItem('skp_user_email', newEmail);

            // Update UI
            updateProfileUI(newName);

            alert('Profile Updated Successfully');
        });
    }

    // 3. Security Form
    const passForm = document.getElementById('passwordForm');
    if (passForm) {
        passForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Just a simulation of password update
            alert('Password updated successfully!');
            passForm.reset();
        });
    }

    // 4. Factory Reset
    const resetBtn = document.getElementById('resetDataBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('CRITICAL WARNING: This will delete ALL Fleet, Student, and Settings data. Are you sure?')) {
                localStorage.clear();
                alert('System has been reset. Redirecting to login...');
                window.location.href = 'login.html';
            }
        });
    }

    // Initial UI Check
    const savedName = localStorage.getItem('skp_user_name');
    if (savedName) updateProfileUI(savedName);
}

function updateProfileUI(name) {
    const names = document.querySelectorAll('.user-info h4, .panel-header h3'); // Sidebar and Profile Card
    names.forEach(el => el.textContent = name);

    // Update Avatars
    const avatars = document.querySelectorAll('.avatar img, .panel-header img'); // Sidebar and Profile Card imgs
    avatars.forEach(img => {
        // Keep styling but change src
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;
    });
}
