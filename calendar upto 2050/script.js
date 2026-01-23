// Age Calculator Elements
const birthDateInput = document.getElementById("birthDateInput");
const targetDateInput = document.getElementById("targetDateInput");
const futureAgeDisplay = document.getElementById("futureAgeDisplay");
const ageResult = document.getElementById("ageResult");

const date = new Date(); // Start with current date
const currentMonthEl = document.getElementById("currentMonth");
const daysContainer = document.getElementById("calendarDays");
const yearSelect = document.getElementById("yearSelect");
const selectedFullDateEl = document.getElementById("selectedFullDate");
const liveClockEl = document.getElementById("liveClock");
const goToTodayBtn = document.getElementById("goToTodayBtn");

const dateSearchInput = document.getElementById("dateSearchInput");
const searchDateBtn = document.getElementById("searchDateBtn");
const reminderSection = document.getElementById("reminderSection");
const reminderInput = document.getElementById("reminderInput");
const setReminderBtn = document.getElementById("setReminderBtn");
const activeReminderDisplay = document.getElementById("activeReminderDisplay");
const reminderText = document.getElementById("reminderText");
const deleteReminderBtn = document.getElementById("deleteReminderBtn");


// Configuration
const START_YEAR = 2025; // Updated to include current real-time year
const END_YEAR = 2050;

let currentYear = date.getFullYear();
let currentMonth = date.getMonth();

let reminders = JSON.parse(localStorage.getItem('calendar_reminders')) || {};
let selectedDateKey = null;

// Clamp initial year to range if outside
if (currentYear < START_YEAR) {
    currentYear = START_YEAR;
    currentMonth = 0;
} else if (currentYear > END_YEAR) {
    currentYear = END_YEAR;
}

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Start Live Clock
function updateClock() {
    if (liveClockEl) {
        const now = new Date();
        liveClockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
}
setInterval(updateClock, 1000);
updateClock();

function getDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function initYearSelector() {
    yearSelect.innerHTML = "";
    for (let y = START_YEAR; y <= END_YEAR; y++) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

function renderCalendar() {
    currentMonthEl.innerText = months[currentMonth];
    yearSelect.value = currentYear;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDayPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    let days = "";

    for (let x = firstDay; x > 0; x--) {
        days += `<div class="empty">${lastDayPrevMonth - x + 1}</div>`;
    }

    for (let i = 1; i <= lastDate; i++) {
        const now = new Date();
        const isToday =
            i === now.getDate() &&
            currentMonth === now.getMonth() &&
            currentYear === now.getFullYear();

        const dateKey = getDateKey(currentYear, currentMonth, i);
        const hasReminder = reminders[dateKey] ? 'has-reminder' : '';
        const isSelected = selectedDateKey === dateKey ? 'selected' : '';

        days += `<div class="${isToday ? 'today' : ''} ${hasReminder} ${isSelected}" onclick="selectDate(event, ${i})">${i}</div>`;
    }

    daysContainer.innerHTML = days;
}

// Helper: Calculate Age
function calculateAge(birthDate, targetDate) {
    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        days += new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
}

function updateAgeDisplay() {
    if (!birthDateInput || !birthDateInput.value || !targetDateInput.value) {
        if (futureAgeDisplay) futureAgeDisplay.style.display = 'none';
        return;
    }

    const birthDate = new Date(birthDateInput.value);
    const targetDate = new Date(targetDateInput.value);

    if (!futureAgeDisplay || !ageResult) return;

    if (targetDate < birthDate) {
        futureAgeDisplay.style.display = 'block';
        ageResult.textContent = "Start Date must be before End Date";
        ageResult.style.color = "#ef4444";
        return;
    }

    const age = calculateAge(birthDate, targetDate);

    futureAgeDisplay.style.display = 'block';
    ageResult.style.color = "var(--primary-color)";
    ageResult.textContent = `${age.years} Years, ${age.months} Months, ${age.days} Days`;
}

// Age Listener
if (birthDateInput) {
    birthDateInput.addEventListener("change", () => {
        updateAgeDisplay();
        localStorage.setItem('calendar_birthDate', birthDateInput.value);
    });

    // Load saved birth date
    const savedBirthDate = localStorage.getItem('calendar_birthDate');
    if (savedBirthDate) {
        birthDateInput.value = savedBirthDate;
    }
}

if (targetDateInput) {
    targetDateInput.addEventListener("change", () => {
        const val = targetDateInput.value;
        if (!val) return;

        // Sync Calendar
        const [y, m, d] = val.split('-').map(Number);

        // Check bounds roughly
        if (y >= START_YEAR && y <= END_YEAR) {
            currentYear = y;
            currentMonth = m - 1;
            renderCalendar();
            // Simulate click to trigger reminders and visuals
            setTimeout(() => {
                const dayDivs = Array.from(daysContainer.querySelectorAll(":not(.empty)"));
                const target = dayDivs.find(div => parseInt(div.textContent) === d);
                if (target) {
                    target.click();
                }
            }, 50);
        } else {
            updateAgeDisplay();
        }
    });
}

document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
        if (currentYear < START_YEAR) {
            currentYear = START_YEAR;
            currentMonth = 0;
            return;
        }
    }
    renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
        if (currentYear > END_YEAR) {
            currentYear = END_YEAR;
            currentMonth = 11;
            return;
        }
    }
    renderCalendar();
});

document.getElementById("prevYear").addEventListener("click", () => {
    if (currentYear > START_YEAR) {
        currentYear--;
        renderCalendar();
    }
});

document.getElementById("nextYear").addEventListener("click", () => {
    if (currentYear < END_YEAR) {
        currentYear++;
        renderCalendar();
    }
});

yearSelect.addEventListener("change", (e) => {
    currentYear = parseInt(e.target.value);
    renderCalendar();
});

// Today Button Logic
if (goToTodayBtn) {
    goToTodayBtn.addEventListener("click", () => {
        const now = new Date();
        currentYear = now.getFullYear();
        if (currentYear < START_YEAR) currentYear = START_YEAR;
        if (currentYear > END_YEAR) currentYear = END_YEAR;

        currentMonth = now.getMonth();

        renderCalendar();

        if (now.getFullYear() >= START_YEAR && now.getFullYear() <= END_YEAR) {
            setTimeout(() => {
                const dayToCheck = now.getDate();
                const divs = Array.from(daysContainer.querySelectorAll(":not(.empty)"));
                const target = divs.find(d => parseInt(d.textContent) === dayToCheck);
                if (target) target.click();
            }, 50);
        }
    });
}

window.selectDate = (e, day) => {
    const allDays = daysContainer.querySelectorAll("div:not(.empty)");
    allDays.forEach(d => d.classList.remove("selected"));

    if (e && e.target) {
        const target = e.target.closest('div');
        if (target) target.classList.add("selected");
    }

    const selectedDate = new Date(currentYear, currentMonth, day);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    selectedFullDateEl.innerText = selectedDate.toLocaleDateString('en-US', options);

    selectedDateKey = getDateKey(currentYear, currentMonth, day);

    if (targetDateInput) {
        targetDateInput.value = selectedDateKey;
    }

    reminderSection.style.display = 'block';
    updateAgeDisplay(); // Calculate Age

    if (reminders[selectedDateKey]) {
        activeReminderDisplay.style.display = 'flex';
        activeReminderDisplay.style.alignItems = 'center';
        reminderText.textContent = reminders[selectedDateKey];
        document.querySelector('.reminder-section .input-group').style.display = 'none';
    } else {
        activeReminderDisplay.style.display = 'none';
        document.querySelector('.reminder-section .input-group').style.display = 'flex';
        reminderInput.value = '';
    }
};

setReminderBtn.addEventListener("click", () => {
    if (!selectedDateKey) return;
    const text = reminderInput.value.trim();
    if (text) {
        reminders[selectedDateKey] = text;
        localStorage.setItem('calendar_reminders', JSON.stringify(reminders));

        activeReminderDisplay.style.display = 'flex';
        activeReminderDisplay.style.alignItems = 'center';
        reminderText.textContent = text;
        document.querySelector('.reminder-section .input-group').style.display = 'none';

        renderCalendar();

        setTimeout(() => {
            const dayToCheck = parseInt(selectedDateKey.split('-')[2]);
            const divs = Array.from(daysContainer.querySelectorAll(":not(.empty)"));
            const target = divs.find(d => parseInt(d.textContent) === dayToCheck);
            if (target) target.classList.add('selected');
        }, 0);
    }
});

deleteReminderBtn.addEventListener("click", () => {
    if (confirm('Delete this reminder?')) {
        delete reminders[selectedDateKey];
        localStorage.setItem('calendar_reminders', JSON.stringify(reminders));

        activeReminderDisplay.style.display = 'none';
        document.querySelector('.reminder-section .input-group').style.display = 'flex';
        renderCalendar();

        setTimeout(() => {
            const dayToCheck = parseInt(selectedDateKey.split('-')[2]);
            const divs = Array.from(daysContainer.querySelectorAll(":not(.empty)"));
            const target = divs.find(d => parseInt(d.textContent) === dayToCheck);
            if (target) target.classList.add('selected');
        }, 0);
    }
});

searchDateBtn.addEventListener("click", () => {
    const val = dateSearchInput.value;
    if (!val) return;

    const [y, m, d] = val.split('-').map(Number);

    if (y < START_YEAR || y > END_YEAR) {
        alert(`Date out of range (${START_YEAR}-${END_YEAR})`);
        return;
    }

    currentYear = y;
    currentMonth = m - 1;

    renderCalendar();

    setTimeout(() => {
        const divs = Array.from(daysContainer.querySelectorAll(":not(.empty)"));
        const target = divs.find(div => parseInt(div.textContent) === d);
        if (target) {
            target.click();
        }
    }, 50);
});

initYearSelector();
renderCalendar();
