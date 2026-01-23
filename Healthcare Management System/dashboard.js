document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        // If no user is logged in, redirect to login page (optional security check)
        // window.location.href = 'index.html'; 
    }

    // --- Real-Time Simulation Components ---

    // 1. Fluctuating Vitals Simulation (For Patient)
    if (document.getElementById('reports-section')) {
        setInterval(() => {
            const hrElement = document.querySelector('.stat-card i.fa-heart-pulse')?.closest('.stat-card').querySelector('h3');
            if (hrElement) {
                const currentHR = parseInt(hrElement.textContent);
                const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
                hrElement.textContent = `${currentHR + variance} bpm`;
                hrElement.parentElement.style.transition = 'color 0.3s';
                hrElement.style.color = variance > 0 ? '#ef4444' : '#10b981';
                setTimeout(() => hrElement.style.color = '', 500);
            }
        }, 5000);
    }

    // 2. Working Chat System (For Doctor)
    const chatInput = document.querySelector('.chat-main input');
    const chatButton = document.querySelector('.chat-main .book-btn');
    const chatDisplay = document.querySelector('.chat-main div:nth-last-child(2)'); // Target the message container

    if (chatInput && chatButton) {
        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (text) {
                // Create User Message
                const msgDiv = document.createElement('div');
                msgDiv.style.cssText = 'background:var(--primary); color:white; padding:15px; border-radius:12px; max-width:70%; align-self:flex-end; margin-bottom:10px; animation: fadeIn 0.3s ease;';
                msgDiv.textContent = text;

                const chatHistory = document.getElementById('chat-history');
                chatHistory.appendChild(msgDiv);
                chatHistory.scrollTop = chatHistory.scrollHeight;
                chatInput.value = '';

                // Mock Auto-Reply
                setTimeout(() => {
                    const replyDiv = document.createElement('div');
                    replyDiv.style.cssText = 'background:#eff6ff; padding:15px; border-radius:12px; max-width:70%; align-self:flex-start; margin-bottom:10px; animation: fadeIn 0.3s ease;';
                    replyDiv.textContent = "Thank you for the update. I will review this shortly.";
                    chatHistory.appendChild(replyDiv);
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                }, 2000);
            }
        };

        chatButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    }

    // 3. Notification Simulator
    const showNotification = (title, message) => {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: white; padding: 20px; border-radius: 16px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
            border-left: 5px solid var(--primary); z-index: 9999;
            display: flex; align-items: center; gap: 15px;
            animation: slideInRight 0.5s forwards;
        `;
        toast.innerHTML = `
            <div class="icon-box blue-bg" style="width:40px; height:40px; font-size:1rem;"><i class="fa-solid fa-bell"></i></div>
            <div>
                <h4 style="font-size:0.9rem; margin-bottom:2px;">${title}</h4>
                <p style="font-size:0.8rem; color:var(--text-light)">${message}</p>
            </div>
        `;
        document.body.appendChild(toast);

        // Update the badge
        const badge = document.querySelector('.notification-dot');
        if (badge) badge.style.display = 'block';

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    };

    // Trigger random notifications
    const mockEvents = [
        { t: "System Update", m: "Lab results for Emma Watson are now available." },
        { t: "New Message", m: "John Doe sent you a follow-up query." },
        { t: "Appointment", m: "Your 2:00 PM surgery is confirmed." }
    ];

    if (user) {
        setTimeout(() => {
            const event = mockEvents[Math.floor(Math.random() * mockEvents.length)];
            showNotification(event.t, event.m);
        }, 8000);
    }

    // 4. Number Animation (Updated for dynamic updates)
    const stats = document.querySelectorAll('.stat-info h3');
    stats.forEach(stat => {
        const val = parseInt(stat.textContent.replace(/,/g, ''));
        if (!isNaN(val)) {
            let current = 0;
            const increment = Math.ceil(val / 50);
            const timer = setInterval(() => {
                current += increment;
                if (current >= val) {
                    current = val;
                    clearInterval(timer);
                }
                stat.textContent = current.toLocaleString() + (stat.textContent.includes('%') ? '%' : (stat.textContent.includes('bpm') ? ' bpm' : ''));
            }, 20);
        }
    });

    // Sidebar active state logic (Shared)
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === '#') {
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
});

// Animation Keyframes added to head
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(style);
