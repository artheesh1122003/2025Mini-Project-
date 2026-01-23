document.addEventListener('DOMContentLoaded', () => {
    // Theme Init
    if (localStorage.getItem('skp_theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    updateDate();
    initCharts();
    populateTable();
    initAnalyticsForm(); // Added form init

    // Simulations
    setInterval(updateLiveCharts, 2000);
    setInterval(updateDate, 60000);
});

function updateDate() {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);
    document.getElementById('currentDate').textContent = dateStr;
}

// Mock Data
const vehicles = [
    { id: '1042', driver: 'Rajesh Kumar', location: 'Girivalam Path', status: 'moving', speed: 45, fuel: 78 },
    { id: '2201', driver: 'Senthil Node', location: 'Arunachaleswarar Temple', status: 'idle', speed: 0, fuel: 45 },
    { id: '998', driver: 'Anand T', location: 'Polur Road', status: 'moving', speed: 62, fuel: 92 },
    { id: '105', driver: 'Karthik S', location: 'Chengam Road', status: 'alert', speed: 0, fuel: 15 },
    { id: '3301', driver: 'Mani B', location: 'Tindivanam Hwy', status: 'moving', speed: 55, fuel: 60 }
];

let speedChart;
let statusChart;

function initCharts() {
    // 1. Live Speed Chart (Line)
    const ctxSpeed = document.getElementById('speedChart').getContext('2d');

    // Initial data points (last 10 updates)
    const initialLabels = Array.from({ length: 10 }, (_, i) => `-${10 - i}s`);
    const initialData = Array(10).fill(40).map(() => Math.floor(Math.random() * 20) + 30); // Random 30-50

    speedChart = new Chart(ctxSpeed, {
        type: 'line',
        data: {
            labels: initialLabels,
            datasets: [{
                label: 'Avg Speed (km/h)',
                data: initialData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1e293b',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#64748b' }
                },
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#64748b' }
                }
            },
            animation: {
                duration: 1000,
                easing: 'linear'
            }
        }
    });

    // 2. Status Chart (Doughnut)
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    statusChart = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Moving', 'Idle', 'Alert'],
            datasets: [{
                data: [3, 1, 1], // Initial count based on mock data
                backgroundColor: ['#10b981', '#94a3b8', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#94a3b8', font: { family: 'Outfit', size: 11 }, usePointStyle: true, boxWidth: 6 }
                }
            },
            cutout: '70%'
        }
    });
}

function updateLiveCharts() {
    // 1. Update Speed Chart
    // Remove oldest
    speedChart.data.labels.shift();
    speedChart.data.datasets[0].data.shift();

    // Add newest
    const now = new Date();
    speedChart.data.labels.push(`${now.getSeconds()}s`);

    // Simulate avg speed fluctuation
    const newSpeed = Math.floor(Math.random() * 30) + 30; // Random between 30 and 60
    speedChart.data.datasets[0].data.push(newSpeed);

    speedChart.update('none'); // 'none' mode prevents full re-render animation for smoother flow

    // 2. Update Random Values in Table for "Live" effect
    const randomVehicleIndex = Math.floor(Math.random() * vehicles.length);
    if (vehicles[randomVehicleIndex].status === 'moving') {
        vehicles[randomVehicleIndex].speed = Math.floor(Math.random() * 20) + 40; // Change speed
    }
    populateTable(); // Re-render table rows
}

function populateTable() {
    const tbody = document.getElementById('vehicleTableBody');
    tbody.innerHTML = ''; // Clear current

    vehicles.forEach(v => {
        const tr = document.createElement('tr');

        // Determine status class
        let statusClass = 'idle';
        let statusText = 'Idle';
        if (v.status === 'moving') { statusClass = 'moving'; statusText = 'Moving'; }
        if (v.status === 'alert') { statusClass = 'alert'; statusText = 'Alert'; }

        tr.innerHTML = `
            <td><strong>#${v.id}</strong></td>
            <td>${v.driver}</td>
            <td style="color: var(--text-muted)">${v.location}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${v.speed} km/h</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <div style="width: 50px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                        <div style="width: ${v.fuel}%; height: 100%; background: ${v.fuel < 20 ? '#ef4444' : '#10b981'}; border-radius: 2px;"></div>
                    </div>
                    <span style="font-size: 0.8rem; color: var(--text-muted)">${v.fuel}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Student Registration Logic (Shared key with Dashboard)
const STUDENT_STORAGE_KEY = 'skp_student_data';

function getStudentData() {
    const stored = localStorage.getItem(STUDENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveStudentData(data) {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(data));
}

function initAnalyticsForm() {
    const form = document.getElementById('analyticsStudentForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = form.querySelectorAll('input, select');

        // Collect Data
        // Inputs order: Roll No, Name, Dept, Year, Bus Route
        // Note: Dept and Year are in a half div, need careful indexing

        // 0: Roll, 1: Name, 2: Dept, 3: Year, 4: Bus Route

        const newStudent = {
            rollNo: inputs[0].value,
            name: inputs[1].value,
            dept: inputs[2].value,
            year: inputs[3].value,
            busRoute: inputs[4].value,
            registeredDate: new Date().toISOString()
        };

        const data = getStudentData();
        data.push(newStudent);
        saveStudentData(data);

        // Success Feedback
        alert(`Student ${newStudent.name} registered successfully!`);
        form.reset();
    });
}
