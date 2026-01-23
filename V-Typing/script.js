const wordPool = [
    "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "programming",
    "javascript", "velocity", "keyboard", "coding", "software", "development", "interface",
    "design", "experience", "beautiful", "dynamic", "performance", "efficient", "system",
    "creative", "innovation", "technology", "future", "challenge", "monitor", "success",
    "accuracy", "practice", "consistency", "mastery", "digital", "universe", "explore",
    "journey", "problem", "solution", "logical", "creative", "syntax", "array", "object",
    "function", "variable", "constant", "component", "render", "state", "effect", "context",
    "promise", "async", "await", "callback", "event", "listener", "element", "selector",
    "query", "style", "layout", "flexbox", "grid", "responsive", "mobile", "desktop",
    "browser", "engine", "compiler", "runtime", "execution", "memory", "stack", "heap"
];

const lessons = {
    "1": { name: "J, F, and Space", keys: ["j", "f", " "], preview: "j f space" },
    "2": { name: "U, R, and K Keys", keys: ["u", "r", "k", " "], preview: "u r k" },
    "3": { name: "D, E, and I Keys", keys: ["d", "e", "i", " "], preview: "d e i" },
    "4": { name: "C, G, and N Keys", keys: ["c", "g", "n", " "], preview: "c g n" },
    "5": { name: "Beginner Review 1", keys: ["j", "f", "u", "r", "k", "d", "e", "i", "c", "g", "n", " "], preview: "all previous" },
    "6": { name: "T, S, and L Keys", keys: ["t", "s", "l", " "], preview: "t s l" },
    "7": { name: "O, B, and A Keys", keys: ["o", "b", "a", " "], preview: "o b a" },
    "8": { name: "V, H, and M Keys", keys: ["v", "h", "m", " "], preview: "v h m" },
    "9": { name: "Period and Comma", keys: [".", ",", "j", "f", " "], preview: ". ," },
    "10": { name: "Beginner Review 2", keys: ["t", "s", "l", "o", "b", "a", "v", "h", "m", ".", ",", " "], preview: "all previous" },
    "11": { name: "W, X, and ; Keys", keys: ["w", "x", ";", " "], preview: "w x ;" },
    "12": { name: "Q, Y, and P Keys", keys: ["q", "y", "p", " "], preview: "q y p" },
    "13": { name: "Z and Enter Keys", keys: ["z", "\n", " "], preview: "z enter" },
    "14": { name: "Beginner Wrap-up", keys: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " "], preview: "full alphabet" },
    "15": { name: "Beginner Assessment", keys: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " "], preview: "exam" }
};

const keyboardLayout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
    ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
    ["Space"]
];

// DOM Elements
const views = {
    login: document.getElementById('view-login'),
    lessons: document.getElementById('view-lessons'),
    typing: document.getElementById('view-typing'),
    progress: document.getElementById('view-progress'),
    tests: document.getElementById('view-tests'),
    guide: document.getElementById('view-guide'),
    profile: document.getElementById('view-profile')
};
const appMainContent = document.getElementById('app-main-content');
const navBtns = document.querySelectorAll('.nav-btn');
const lessonsGrid = document.getElementById('lessons-grid');
const practiceTitle = document.getElementById('practice-title');
const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('type-input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const backToLessonsBtn = document.getElementById('back-to-lessons');
const timeBtns = document.querySelectorAll('.time-btn');
const soundBtn = document.getElementById('sound-btn');
const progressBar = document.getElementById('progress-bar');
const stars = document.querySelectorAll('.star');
const liveKeyboard = document.querySelector('.live-keyboard');
const resultModal = document.getElementById('result-modal');
const modalClose = document.getElementById('modal-close');
const modalNext = document.getElementById('modal-next');

// Result fields
const finalWpmEl = document.getElementById('final-wpm');
const finalAccuracyEl = document.getElementById('final-accuracy');
const finalCharsEl = document.getElementById('final-chars');

// State
let currentView = 'login';
let currentMode = 'course'; // 'course' or 'test'
let currentLessonId = '1';
let timeLeft = 30;
let initialTime = 30;
let timer = null;
let isRunning = false;
let charIndex = 0;
let mistakes = 0;
let characters = [];
let soundEnabled = true;
let audioCtx = null;

const progressData = JSON.parse(localStorage.getItem('velocity_progress') || '{}');
let testHistory = JSON.parse(localStorage.getItem('velocity_history') || '[]');
let keyMistakes = JSON.parse(localStorage.getItem('velocity_key_mistakes') || '{}');
let progressChart = null;

function initAuth() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn-submit');
        const originalText = btn.textContent;

        // Premium Loading State
        btn.disabled = true;
        btn.textContent = "Authenticating...";
        btn.style.opacity = "0.7";

        setTimeout(() => {
            if (views.login) views.login.classList.add('hidden');
            if (appMainContent) appMainContent.classList.remove('hidden');

            // Set initial app state
            switchView('lessons');

            // Restore btn state
            btn.disabled = false;
            btn.textContent = originalText;
            btn.style.opacity = "1";
        }, 1200);
    });

    // Helper links
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Password reset functionality is coming in v2.1!");
    });

    const signupLink = document.getElementById('show-signup');
    if (signupLink) signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Account creation is currently closed for the beta. Please use any email to sign in.");
    });
}

function playSound(freq, type = 'sine', duration = 0.1) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) { }
}

function init() {
    initAuth();
    renderLessons();
    generateLiveKeyboard();
    updateProgressStats();

    // Navigation View Switchers
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            switchView(view);
        });
    });

    backToLessonsBtn.addEventListener('click', () => switchView('lessons'));
    document.getElementById('clear-history').addEventListener('click', clearHistory);

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to logout?")) {
                appMainContent.classList.add('hidden');
                views.login.classList.remove('hidden');
                currentView = 'login';
            }
        });
    }

    inputField.addEventListener('input', startTyping);
    restartBtn.addEventListener('click', resetTest);

    modalClose.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        resetTest();
    });

    modalNext.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        const nextId = (parseInt(currentLessonId) + 1).toString();
        if (lessons[nextId]) {
            startLesson(nextId);
        } else {
            switchView('lessons');
        }
    });

    const soundToggleProfile = document.getElementById('profile-sound-toggle-main');

    const updateSoundUI = () => {
        document.querySelector('.sound-on').classList.toggle('hidden', !soundEnabled);
        document.querySelector('.sound-off').classList.toggle('hidden', soundEnabled);
        if (soundToggleProfile) soundToggleProfile.checked = soundEnabled;
    };

    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        updateSoundUI();
    });

    if (soundToggleProfile) {
        soundToggleProfile.addEventListener('change', () => {
            soundEnabled = soundToggleProfile.checked;
            updateSoundUI();
        });
    }

    // Edit Profile Logic
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            const newName = prompt("Enter your new display name:", "Arteesh");
            if (newName && newName.trim() !== "") {
                const nameEls = document.querySelectorAll('.user-display-name');
                nameEls.forEach(el => el.textContent = newName.trim());
                const avatars = document.querySelectorAll('.profile-avatar, .profile-avatar-large');
                avatars.forEach(el => el.textContent = newName.trim().charAt(0).toUpperCase());
            }
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('profile-dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            const isDark = darkModeToggle.checked;
            document.body.classList.toggle('light-theme', !isDark);
            localStorage.setItem('velocity_theme', isDark ? 'dark' : 'light');
        });

        // Load saved theme preference
        const savedTheme = localStorage.getItem('velocity_theme');
        if (savedTheme === 'light') {
            darkModeToggle.checked = false;
            document.body.classList.add('light-theme');
        }
    }

    // Milestone sound logic
    window.playMilestoneSound = () => {
        if (!soundEnabled) return;
        playSound(523.25, 'sine', 0.1); // C5
        setTimeout(() => playSound(659.25, 'sine', 0.1), 100); // E5
        setTimeout(() => playSound(783.99, 'sine', 0.1), 200); // G5
        setTimeout(() => playSound(1046.50, 'sine', 0.3), 300); // C6
    };

    // Global Shortcuts - Only active when not in login
    window.addEventListener('keydown', (e) => {
        if (currentView === 'login') return;
        // Esc - Close Modals
        if (e.key === 'Escape') {
            resultModal.classList.add('hidden');
        }

        // Navigation Shortcuts
        if (e.altKey) {
            const key = e.key.toLowerCase();
            if (key === 'l') { e.preventDefault(); switchView('lessons'); }
            if (key === 't') { e.preventDefault(); switchView('tests'); }
            if (key === 'p') { e.preventDefault(); switchView('progress'); }
            if (key === 'g') { e.preventDefault(); switchView('guide'); }
            if (key === 'u') { e.preventDefault(); switchView('profile'); }
        }
    });

    // Guide Interactive Logic
    const fingerBoxes = document.querySelectorAll('.f-box');
    const dutyDisplay = document.getElementById('duty-display');

    if (fingerBoxes && dutyDisplay) {
        fingerBoxes.forEach(box => {
            box.addEventListener('mouseenter', () => {
                const keys = box.getAttribute('data-keys');
                const name = box.querySelector('span').textContent;
                dutyDisplay.textContent = `${name} Responsibility: ${keys}`;
                dutyDisplay.style.color = getComputedStyle(box).borderColor;
            });
            box.addEventListener('mouseleave', () => {
                dutyDisplay.textContent = "Hover over a finger to see its keys";
                dutyDisplay.style.color = 'var(--primary)';
            });
        });
    }

    // Guide Tab Logic
    const guideTabs = document.querySelectorAll('.g-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    guideTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            guideTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabPanes.forEach(pane => {
                pane.classList.toggle('active', pane.id === `tab-${target}`);
            });
        });
    });

    timeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isRunning) return;
            timeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            initialTime = parseInt(btn.getAttribute('data-time'));
            resetTest();
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && currentView === 'typing') {
            e.preventDefault();
            resetTest();
        }
    });

    const curriculumSelect = document.getElementById('curriculum-select');
    if (curriculumSelect) {
        curriculumSelect.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            document.getElementById('current-category').textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
            renderLessons();
        });
    }
}

const categories = {
    beginner: {
        units: [
            { name: "Getting Started", description: "Master the home row and basic keys", lessons: ["1", "2", "3", "4", "5"] },
            { name: "Reaching Out", description: "Learn top row and common punctuation", lessons: ["6", "7", "8", "9", "10"] },
            { name: "Beginner Wrap-up", description: "Finish the alphabet and primary controls", lessons: ["11", "12", "13", "14", "15"] }
        ]
    },
    intermediate: {
        units: [
            { name: "Advanced Punctuation", description: "Practice symbols and numbers", lessons: [] }, // Dummy unit
            { name: "Capitalization & Shift", description: "Master shift key usage", lessons: [] } // Dummy unit
        ]
    },
    advanced: {
        units: [
            { name: "Speed & Accuracy Drills", description: "Focus on speed and precision", lessons: [] }, // Dummy unit
            { name: "Programming Syntax", description: "Practice common coding characters", lessons: [] } // Dummy unit
        ]
    }
};

let currentCategory = 'beginner';

function switchView(viewName, mode = 'course') {
    currentView = viewName;
    currentMode = mode;

    Object.keys(views).forEach(v => {
        if (views[v]) views[v].classList.toggle('hidden', v !== viewName);
    });

    // Explicitly handle progress view which might not be in views object if not updated
    const progressView = document.getElementById('view-progress');
    if (progressView) progressView.classList.toggle('hidden', viewName !== 'progress');

    navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    if (viewName === 'profile') {
        updateProfileStats();
    }

    if (viewName === 'typing') {
        if (mode === 'test') {
            practiceTitle.textContent = initialTime < 60 ? "Speed Test" : `${initialTime / 60} Minute Test`;
            document.getElementById('timer-container').classList.remove('hidden');
            document.getElementById('time-options').classList.remove('hidden');
        } else {
            document.getElementById('timer-container').classList.add('hidden');
            document.getElementById('time-options').classList.add('hidden');
        }
        resetTest();
    } else if (viewName === 'lessons') {
        renderLessons();
    } else if (viewName === 'tests') {
        // Handle tests dashboard if needed
    } else if (viewName === 'progress') {
        updateProgressStats();
        renderProgressChart();
    }
}

window.startTest = function (seconds) {
    initialTime = seconds;
    timeLeft = seconds;
    switchView('typing', 'test');
};

function renderLessons() {
    const unitsWrapper = document.getElementById('units-wrapper');
    if (!unitsWrapper) return;

    unitsWrapper.innerHTML = '';
    const catData = categories[currentCategory];

    // Update dashboard header based on category
    document.getElementById('current-category').textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);

    // Add Category Title/Subtitle (Optional: can be added to HTML)
    const headerTitle = catData.title || (currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1));
    const headerSubtitle = catData.subtitle || "";

    catData.units.forEach((unit, unitIdx) => {
        const unitDiv = document.createElement('div');
        unitDiv.classList.add('unit-container', 'dynamic-unit');

        const completedCount = unit.lessons.filter(id => progressData[id] && progressData[id].completed).length;
        const percent = unit.lessons.length > 0 ? Math.round((completedCount / unit.lessons.length) * 100) : 0;

        unitDiv.innerHTML = `
            <div class="unit-header">
                <div class="unit-info">
                    <div class="unit-title-row">
                        <h2>${unit.name}</h2>
                        <button class="reset-unit-btn" onclick="resetUnit('${currentCategory}', ${unitIdx})" title="Reset Unit Progress">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                            Reset
                        </button>
                    </div>
                    <p>${unit.description}</p>
                    <div class="unit-objectives">
                        ${(unit.objectives || []).map(obj => `<span class="objective-tag">${obj}</span>`).join('')}
                    </div>
                </div>
                <div class="unit-progress">
                    <div class="percentage">${percent}% Complete</div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            </div>
            <div class="lessons-grid">
                ${unit.lessons.length > 0 ? unit.lessons.map(id => {
            const lesson = lessons[id];
            const isCompleted = progressData[id] && progressData[id].completed;
            return `
                        <div class="lesson-card">
                            <div class="lesson-main">
                                <div class="lesson-content">
                                    <h3>${lesson.name}</h3>
                                    <div class="lesson-preview">${lesson.preview || ""}</div>
                                    <div class="lesson-progress-dots">
                                        ${Array(5).fill(0).map((_, i) => `<div class="dot ${isCompleted ? 'filled' : ''}"></div>`).join('')}
                                    </div>
                                </div>
                            </div>
                            <div class="lesson-actions">
                                <button class="start-btn" onclick="startLesson('${id}')">${isCompleted ? 'Review' : 'Start'}</button>
                            </div>
                        </div>
                    `;
        }).join('') : '<p style="color: rgba(255,255,255,0.3); padding: 1rem;">Coming soon...</p>'}
            </div>
        `;
        unitsWrapper.appendChild(unitDiv);
    });
}

window.resetUnit = function (catKey, unitIdx) {
    const unit = categories[catKey].units[unitIdx];
    if (confirm(`Reset all progress for "${unit.name}"?`)) {
        unit.lessons.forEach(id => {
            delete progressData[id];
        });
        localStorage.setItem('velocity_progress', JSON.stringify(progressData));
        renderLessons();
        updateProgressStats();
    }
};

window.startLesson = function (id) {
    currentLessonId = id;
    switchView('typing', 'course');
    practiceTitle.textContent = lessons[id].name;
};

function generateLiveKeyboard() {
    liveKeyboard.innerHTML = '';
    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('key-row');
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.classList.add('key');
            if (key === 'Space') keyDiv.classList.add('space');
            keyDiv.textContent = key;
            keyDiv.id = `live-key-${key.toLowerCase()}`;
            rowDiv.appendChild(keyDiv);
        });
        liveKeyboard.appendChild(rowDiv);
    });
}

function generateLessonText(id) {
    const keys = lessons[id].keys;
    let text = "";
    if (id === "15") {
        const randomWords = [];
        for (let i = 0; i < 30; i++) randomWords.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
        return randomWords.join(' ');
    }

    for (let i = 0; i < 15; i++) {
        let word = "";
        const len = Math.floor(Math.random() * 3) + 2;
        for (let j = 0; j < len; j++) word += keys[Math.floor(Math.random() * (keys.length - 1))];
        text += word + " ";
    }
    return text.trim();
}

function loadNewText() {
    textDisplay.innerHTML = '';
    let text = "";

    if (currentMode === 'test') {
        const randomWords = [];
        // Increase word count for longer tests
        const wordCount = Math.max(40, Math.ceil(initialTime / 1.5));
        for (let i = 0; i < wordCount; i++) randomWords.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
        text = randomWords.join(' ');
    } else {
        text = generateLessonText(currentLessonId);
    }

    characters = text.split('').map(char => {
        const span = document.createElement('span');
        span.classList.add('char');
        span.innerText = char;
        textDisplay.appendChild(span);
        return span;
    });

    if (characters.length > 0) characters[0].classList.add('current');
    charIndex = 0;
    mistakes = 0;
    progressBar.style.width = '0%';
    updateKeyboardHighlight();
}

function startTyping(e) {
    if (!isRunning) {
        isRunning = true;
        if (currentMode === 'test') startTimer();
    }

    const inputVal = inputField.value;
    const inputChars = inputVal.split('');

    if (inputChars.length > charIndex) {
        const lastInput = inputChars[inputChars.length - 1];
        if (lastInput === characters[charIndex].innerText) {
            playSound(400, 'sine', 0.05);
        } else {
            playSound(150, 'sawtooth', 0.1);
        }
    }

    characters.forEach((char, index) => {
        char.classList.remove('correct', 'incorrect', 'current');
        if (index < inputChars.length) {
            if (inputChars[index] === char.innerText) {
                char.classList.add('correct');
            } else {
                char.classList.add('incorrect');
                // Record trouble key
                const targetChar = char.innerText.toLowerCase();
                if (targetChar !== ' ') {
                    keyMistakes[targetChar] = (keyMistakes[targetChar] || 0) + 1;
                    localStorage.setItem('velocity_key_mistakes', JSON.stringify(keyMistakes));
                }
            }
        }
    });

    charIndex = inputChars.length;
    if (charIndex < characters.length) {
        characters[charIndex].classList.add('current');
    }

    progressBar.style.width = `${(charIndex / characters.length) * 100}%`;

    mistakes = 0;
    inputChars.forEach((char, index) => {
        if (char !== characters[index].innerText) mistakes++;
    });

    calculateStats();
    updateKeyboardHighlight();

    if (charIndex === characters.length) {
        endTest();
    }
}

function startTimer() {
    timeLeft = initialTime;
    timerDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            calculateStats();
        } else {
            endTest();
        }
    }, 1000);
}

function calculateStats() {
    const timeElapsed = currentMode === 'test' ? (initialTime - timeLeft) : 10; // Mock time for lessons
    const effectiveTime = Math.max(1, timeElapsed);
    const wpm = Math.round(((charIndex - mistakes) / 5) / (effectiveTime / 60));
    const accuracy = charIndex > 0 ? Math.round(((charIndex - mistakes) / charIndex) * 100) : 100;

    wpmDisplay.textContent = Math.max(0, wpm);
    accuracyDisplay.textContent = `${Math.max(0, accuracy)}%`;
    return { wpm, accuracy };
}

function updateKeyboardHighlight() {
    document.querySelectorAll('.key').forEach(k => k.classList.remove('target'));
    if (charIndex < characters.length) {
        let target = characters[charIndex].innerText.toLowerCase();
        if (target === ' ') target = 'space';
        const keyEl = document.getElementById(`live-key-${target}`);
        if (keyEl) keyEl.classList.add('target');
    }
}

function endTest() {
    clearInterval(timer);
    isRunning = false;
    inputField.disabled = true;

    const stats = calculateStats();
    finalWpmEl.textContent = `${stats.wpm} WPM`;
    finalAccuracyEl.textContent = `${stats.accuracy}%`;
    finalCharsEl.textContent = charIndex;

    // Save to history
    testHistory.push({
        date: new Date().toISOString(),
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        mode: currentMode,
        duration: initialTime,
        lesson: currentMode === 'course' ? currentLessonId : 'test'
    });
    localStorage.setItem('velocity_history', JSON.stringify(testHistory));

    updateStars(stats);

    if (currentMode === 'course') {
        progressData[currentLessonId] = { completed: true, wpm: stats.wpm, accuracy: stats.accuracy };
        localStorage.setItem('velocity_progress', JSON.stringify(progressData));
    }

    resultModal.classList.remove('hidden');

    if (stats.accuracy > 95) {
        playSound(523, 'sine', 0.1);
        setTimeout(() => playSound(659, 'sine', 0.1), 100);
        setTimeout(() => playSound(783, 'sine', 0.2), 200);
    }

    updateProgressStats();
    updateProfileStats();
}

let lastLevel = 1;

function updateProgressStats() {
    const totalWpm = testHistory.reduce((sum, entry) => sum + entry.wpm, 0);
    const avgWpm = testHistory.length > 0 ? Math.round(totalWpm / testHistory.length) : 0;
    const topWpm = testHistory.length > 0 ? Math.max(...testHistory.map(e => e.wpm)) : 0;
    const bestAcc = testHistory.length > 0 ? Math.max(...testHistory.map(e => e.accuracy)) : 0;
    const completedLessons = Object.values(progressData).filter(p => p.completed).length;

    // XP calculation
    const totalXP = (completedLessons * 100) + (testHistory.length * 50);
    const level = Math.floor(totalXP / 500) + 1;
    const currentLevelXP = totalXP % 500;
    const levelPercent = (currentLevelXP / 500) * 100;

    if (level > lastLevel) {
        if (typeof playMilestoneSound === 'function') playMilestoneSound();
        lastLevel = level;
    }

    const avgWpmEl = document.getElementById('avg-wpm');
    const topWpmEl = document.getElementById('top-wpm');
    const bestAccEl = document.getElementById('best-acc');
    const totalLessonsEl = document.getElementById('total-lessons');
    const totalTestsEl = document.getElementById('total-tests');

    if (avgWpmEl) avgWpmEl.textContent = avgWpm;
    if (topWpmEl) topWpmEl.textContent = topWpm;
    if (bestAccEl) bestAccEl.textContent = `${bestAcc}%`;
    if (totalLessonsEl) totalLessonsEl.textContent = completedLessons;
    if (totalTestsEl) totalTestsEl.textContent = testHistory.length;

    document.getElementById('user-level-label').textContent = `Level ${level}`;
    document.getElementById('xp-fill-bar').style.width = `${levelPercent}%`;

    // Trouble Keys
    const troubleKeysBody = document.getElementById('trouble-keys-list');
    if (troubleKeysBody) {
        troubleKeysBody.innerHTML = '';
        const sortedMistakes = Object.entries(keyMistakes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (sortedMistakes.length === 0) {
            troubleKeysBody.innerHTML = '<p style="color: var(--text-dim); font-size: 0.9rem;">Keep practice to see key analysis!</p>';
        } else {
            sortedMistakes.forEach(([key, count]) => {
                const keyEl = document.createElement('div');
                keyEl.classList.add('trouble-key-item');
                keyEl.innerHTML = `
                    <span class="key-char">${key.toUpperCase()}</span>
                    <span class="mistake-count">${count} misses</span>
                `;
                troubleKeysBody.appendChild(keyEl);
            });
        }
    }

    // Populate History Table
    const historyBody = document.getElementById('history-body');
    if (historyBody) {
        historyBody.innerHTML = '';
        [...testHistory].reverse().slice(0, 5).forEach(entry => {
            const row = document.createElement('tr');
            const date = new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            row.innerHTML = `
                <td>${date}</td>
                <td><span class="mode-badge ${entry.mode}">${entry.mode}</span></td>
                <td style="font-weight: 700; color: var(--primary);">${entry.wpm}</td>
                <td>${entry.accuracy}%</td>
            `;
            historyBody.appendChild(row);
        });
    }
}

function renderProgressChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (progressChart) {
        progressChart.destroy();
    }

    const data = testHistory.slice(-10); // Last 10 tests
    const labels = data.map((_, i) => `Test ${testHistory.length - data.length + i + 1}`);
    const wpmValues = data.map(e => e.wpm);

    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded');
        return;
    }

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'WPM',
                data: wpmValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

function clearHistory() {
    if (confirm('Delete all progress history? This cannot be undone.')) {
        testHistory = [];
        localStorage.removeItem('velocity_history');
        updateProgressStats();
        if (progressChart) {
            progressChart.destroy();
            progressChart = null;
        }
        renderProgressChart();
    }
}

function updateStars(stats) {
    stars.forEach(s => s.classList.remove('active'));
    let count = 0;
    if (stats.accuracy >= 98) count = 3;
    else if (stats.accuracy >= 90) count = 2;
    else if (stats.accuracy >= 70) count = 1;

    stars.forEach((s, i) => {
        if (i < count) setTimeout(() => s.classList.add('active'), i * 150 + 300);
    });
}

function resetTest() {
    clearInterval(timer);
    timeLeft = initialTime;
    timerDisplay.textContent = timeLeft;
    isRunning = false;
    charIndex = 0;
    mistakes = 0;
    inputField.disabled = false;
    inputField.value = '';
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    loadNewText();
    setTimeout(() => inputField.focus(), 100);
}

function updateProfileStats() {
    const totalWpm = testHistory.length > 0 ? Math.round(testHistory.reduce((a, b) => a + b.wpm, 0) / testHistory.length) : 0;
    const totalTests = testHistory.length;
    const totalSeconds = testHistory.reduce((a, b) => a + (b.duration || 30), 0);
    const totalMinutes = Math.floor(totalSeconds / 60);

    const totalAcc = testHistory.length > 0 ? Math.round(testHistory.reduce((a, b) => a + b.accuracy, 0) / testHistory.length) : 100;

    const profileWpm = document.getElementById('profile-total-wpm');
    const profileAcc = document.getElementById('profile-total-acc');
    const profileTests = document.getElementById('profile-total-tests');
    const profileTime = document.getElementById('profile-total-time');

    if (profileWpm) profileWpm.textContent = totalWpm;
    if (profileAcc) profileAcc.textContent = `${totalAcc}%`;
    if (profileTests) profileTests.textContent = totalTests;
    if (profileTime) profileTime.textContent = totalMinutes + "m";

    // Level calculation (Sync with Progress view logic)
    const completedLessons = Object.values(progressData).filter(p => p.completed).length;
    const totalXP = (completedLessons * 100) + (testHistory.length * 50);
    const level = Math.floor(totalXP / 500) + 1;
    const currentLevelXP = totalXP % 500;
    const levelPercent = Math.round((currentLevelXP / 500) * 100);

    const levelTag = document.getElementById('profile-level-tag');
    const xpPercent = document.getElementById('profile-xp-percent');
    const xpFill = document.getElementById('profile-xp-fill');

    if (levelTag) levelTag.textContent = `Level ${level}`;
    if (xpPercent) xpPercent.textContent = `${levelPercent}% to Level ${level + 1}`;
    if (xpFill) {
        xpFill.textContent = "";
        xpFill.style.width = `${levelPercent}%`;
    }


    // Keyboard Mastery (Estimated based on keyMistakes)
    updateKeyboardMastery();

    // Achievements
    checkAchievements(totalWpm, totalTests, completedLessons);

    // Personality
    updatePersonality(totalWpm, totalAcc);
}

function updatePersonality(wpm, acc) {
    const iconEl = document.querySelector('.p-icon');
    const titleEl = document.querySelector('.p-title');
    const descEl = document.querySelector('.personality-panel p');
    if (!iconEl || !titleEl || !descEl) return;

    if (testHistory.length < 3) {
        iconEl.textContent = "🆕";
        titleEl.textContent = "The Novice";
        descEl.textContent = "Complete more tests to reveal your typing personality.";
        return;
    }

    if (acc >= 98 && wpm < 40) {
        iconEl.textContent = "🎯";
        titleEl.textContent = "The Perfectionist";
        descEl.textContent = "Every keystroke is deliberate. You value flawless execution over raw speed.";
    } else if (wpm >= 70 && acc < 94) {
        iconEl.textContent = "⚡";
        titleEl.textContent = "The Speedster";
        descEl.textContent = "Blazing fast but sometimes messy. You push the limits of velocity.";
    } else if (wpm >= 60 && acc >= 96) {
        iconEl.textContent = "🏆";
        titleEl.textContent = "The Master";
        descEl.textContent = "The perfect balance of precision and pace. A true professional.";
    } else if (acc >= 95) {
        iconEl.textContent = "🧐";
        titleEl.textContent = "The Tactician";
        descEl.textContent = "You prioritize accuracy over speed. A steady hand leads to mastery.";
    } else {
        iconEl.textContent = "⌨️";
        titleEl.textContent = "The Grinder";
        descEl.textContent = "Consistent and hardworking. Your skills are sharpening with every session.";
    }
}


function updateKeyboardMastery() {
    const rowAccs = { home: 100, top: 100, bottom: 100 };
    const rows = {
        home: "asdfghjkl;",
        top: "qwertyuiop",
        bottom: "zxcvbnm,./"
    };

    // Very simple estimation: 100 - (mistakes / 10)
    Object.keys(rows).forEach(row => {
        let rowMistakes = 0;
        rows[row].split('').forEach(char => {
            rowMistakes += (keyMistakes[char] || 0);
        });
        const acc = Math.max(70, 100 - (rowMistakes * 2)); // Dynamic but protected
        document.getElementById(`${row}-row-acc`).textContent = `${acc}%`;
        document.getElementById(`${row}-row-fill`).style.width = `${acc}%`;
    });
}

function checkAchievements(avgWpm, totalTests, completedLessons) {
    const topWpm = testHistory.length > 0 ? Math.max(...testHistory.map(e => e.wpm)) : 0;
    const testWith98 = testHistory.filter(t => t.accuracy >= 98).length;

    if (topWpm >= 60) unlockAchievement('ach-speed-60');
    if (testWith98 >= 5) unlockAchievement('ach-acc-98');
    if (completedLessons >= 15) unlockAchievement('ach-beginner-done');
    if (topWpm >= 100) unlockAchievement('ach-velocity-100');
}

function unlockAchievement(id) {
    const el = document.getElementById(id);
    if (el && el.classList.contains('locked')) {
        el.classList.remove('locked');
        el.classList.add('unlocked');
        if (typeof playMilestoneSound === 'function') playMilestoneSound();
    }
}

init();
