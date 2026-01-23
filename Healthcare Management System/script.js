document.addEventListener('DOMContentLoaded', () => {

    // --- UI Interactions ---
    const roleOptions = document.querySelectorAll('.role-option');
    const togglePassBtn = document.querySelector('.toggle-pass');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('login-form');
    const submitBtn = document.querySelector('.cta-btn');
    const submitBtnText = submitBtn.querySelector('span');
    const submitBtnIcon = submitBtn.querySelector('i');

    // Role Selection Handling
    roleOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            // e.preventDefault(); // If you want to stop the radio native behavior, but we used label so it's fine.

            // Visual Toggle
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Ensure the radio button inside is checked (though label click handles this mostly)
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = true;

            // Optional: Animate or change content based on role
            const role = option.dataset.role;
            console.log(`Switched to ${role} login`);
        });
    });

    // Password Visibility Toggle
    togglePassBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type');
        if (type === 'password') {
            passwordInput.setAttribute('type', 'text');
            togglePassBtn.classList.remove('fa-eye');
            togglePassBtn.classList.add('fa-eye-slash');
        } else {
            passwordInput.setAttribute('type', 'password');
            togglePassBtn.classList.remove('fa-eye-slash');
            togglePassBtn.classList.add('fa-eye');
        }
    });

    // Login Submission Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get Values
        const role = document.querySelector('input[name="role"]:checked').value;
        const email = document.getElementById('username').value;

        // UI Loading State
        submitBtn.disabled = true;
        const originalText = submitBtnText.innerText;
        submitBtnText.innerText = "Verifying Credentials...";
        submitBtnIcon.classList.remove('fa-arrow-right');
        submitBtnIcon.classList.add('fa-circle-notch', 'fa-spin');

        // Logic Simulation
        setTimeout(() => {
            // Restore Button
            submitBtn.disabled = false;
            submitBtnText.innerText = originalText;
            submitBtnIcon.classList.remove('fa-circle-notch', 'fa-spin');
            submitBtnIcon.classList.add('fa-arrow-right');

            // Save Data
            localStorage.setItem('currentUser', JSON.stringify({
                role: role,
                name: email.split('@')[0] || "User", // Use email prefix or default
                email: email
            }));

            // Redirect
            if (role === 'doctor') {
                window.location.href = 'doctor_dashboard.html';
            } else {
                window.location.href = 'patient_dashboard.html';
            }

        }, 1500); // 1.5s delay
    });

    // Focus Effects (Optional if needed beyond CSS)
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
});

// --- Modal Functions (Global) ---
function openRequestModal() {
    const modal = document.getElementById('requestAccessModal');
    const container = modal.querySelector('.modal-container');

    modal.style.display = 'flex';
    setTimeout(() => {
        modal.style.opacity = '1';
        container.style.transform = 'scale(1)';
    }, 10);
}

function closeRequestModal() {
    const modal = document.getElementById('requestAccessModal');
    const container = modal.querySelector('.modal-container');

    modal.style.opacity = '0';
    container.style.transform = 'scale(0.9)';

    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('request-form').reset();
    }, 300);
}

function handleRequestSubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;

    // UI state
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    // Simulate Server Request
    setTimeout(() => {
        closeRequestModal();
        showSuccessToast("Request sent successfully! Our team will contact you soon.");

        // Reset button
        setTimeout(() => {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }, 300);
    }, 1500);
}

function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInToast 0.3s ease;
    `;

    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>${message}</span>
    `;

    // Add slide-in animation style if not already present
    if (!document.getElementById('toast-animation-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-style';
        style.innerHTML = `
            @keyframes slideInToast {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
