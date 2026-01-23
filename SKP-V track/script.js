// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    updateDate();

    // Theme Init
    if (localStorage.getItem('skp_theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    initMap();
    initInteractions();
    initSearch();
    initStudentForm();

    // Every 2 seconds update positions for simulation
    setInterval(simulateMovement, 2000);

    // Update date every minute
    setInterval(updateDate, 60000);

    // Check for track param
    const urlParams = new URLSearchParams(window.location.search);
    const trackId = urlParams.get('track');
    if (trackId) {
        // Wait slightly for map to init
        setTimeout(() => {
            flyToVehicle(trackId);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 1000);
    }
});

// Update current date display
function updateDate() {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = dateStr;
}

// Map Configuration
let map;
let markers = {}; // Store marker references
let vehicleTrails = {}; // Store polyline paths
let activeVehicleId = null; // Currently tracked vehicle
const TIRUVANNAMALAI_COORDS = [12.2253, 79.0747];

// Data Handling - Unified in LocalStorage
const STORAGE_KEY = 'skp_fleet_data';

function getStoredVehicles() {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Return stored or some default dummy data if completely empty, for demo
    if (stored) return JSON.parse(stored);

    // Default dummy data if nothing exists
    const defaults = [
        { id: 'Bus-1', name: 'Bus 1 (Chengam)', lat: 12.2253, lng: 79.0747, status: 'moving', speed: 45 },
        { id: 'Bus-5', name: 'Bus 5 (Polur)', lat: 12.2500, lng: 79.1000, status: 'moving', speed: 50 },
        { id: 'Bus-12', name: 'Bus 12 (Campus)', lat: 12.2200, lng: 79.0700, status: 'idle', speed: 0 },
        { id: 'Bus-3', name: 'Bus 3 (Kanji)', lat: 12.2300, lng: 79.0800, status: 'alert', speed: 0 }
    ];
    return defaults;
}

// Initial Data Loading
let vehicles = getStoredVehicles();

// Listen for updates from Fleet page
window.addEventListener('storage', () => {
    vehicles = getStoredVehicles();
    updateVehicleMarkers(); // Refresh map
    // Also re-init trails if new vehicles appeared
    vehicles.forEach(v => {
        if (!vehicleTrails[v.id]) {
            vehicleTrails[v.id] = {
                path: [[v.lat, v.lng]],
                polyline: null
            };
        }
    });
});

// Initialize history for trails
vehicles.forEach(v => {
    vehicleTrails[v.id] = {
        path: [[v.lat, v.lng]], // Array of [lat, lng]
        polyline: null // Leaflet polyline object
    };
});

function initMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return; // Exit if no map container (e.g., maybe on other pages)

    map = L.map('map-container').setView(TIRUVANNAMALAI_COORDS, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    updateVehicleMarkers();
}

function updateVehicleMarkers() {
    updateMapStats();

    if (!map) return;

    vehicles.forEach(vehicle => {
        const color = getStatusColor(vehicle.status);

        // Update Marker Position
        if (markers[vehicle.id]) {
            markers[vehicle.id].setLatLng([vehicle.lat, vehicle.lng]);
        } else {
            // Create new marker with custom bus style
            const marker = L.marker([vehicle.lat, vehicle.lng], {
                icon: L.divIcon({
                    className: `custom-bus-marker status-${vehicle.status}`,
                    html: `<i class='bx bxs-bus' style="font-size: 1.2rem;"></i>`,
                    iconSize: [30, 30]
                })
            }).addTo(map);

            marker.bindPopup(`<b>${vehicle.name}</b><br>Status: ${vehicle.status.toUpperCase()}`);
            markers[vehicle.id] = marker;

            // Allow clicking marker to track
            marker.on('click', () => flyToVehicle(vehicle.id));
        }

        // Update Trail (Live Travel Path)
        if (vehicle.status === 'moving') {
            const trailData = vehicleTrails[vehicle.id];

            // Add new point only if it moved significantly (simple check)
            const lastPoint = trailData.path[trailData.path.length - 1];
            if (lastPoint[0] !== vehicle.lat || lastPoint[1] !== vehicle.lng) {
                trailData.path.push([vehicle.lat, vehicle.lng]);

                // Limit path length to last 50 points to save memory
                if (trailData.path.length > 50) trailData.path.shift();
            }

            // If this is the active vehicle, draw/update the line
            if (activeVehicleId === vehicle.id) {
                drawTrail(vehicle.id);
            }
        }
    });

    // Update live map overlay if present
    updateLiveMapOverlay();
}

function updateMapStats() {
    const totalEl = document.getElementById('totalBusesStat');
    const activeEl = document.getElementById('activeBusesStat');

    if (totalEl) totalEl.textContent = vehicles.length;
    if (activeEl) activeEl.textContent = vehicles.filter(v => v.status === 'moving').length;
}

function drawTrail(id) {
    const trailData = vehicleTrails[id];

    // Remove existing line if any
    if (trailData.polyline) {
        map.removeLayer(trailData.polyline);
    }

    // Draw new line
    // Use the color of the vehicle status or a standard 'track' color
    trailData.polyline = L.polyline(trailData.path, {
        color: '#6366f1', // Primary color
        weight: 4,
        opacity: 0.7,
        dashArray: '5, 10', // Dashed line for effect
        lineCap: 'round'
    }).addTo(map);
}

function removeAllTrails() {
    Object.keys(vehicleTrails).forEach(id => {
        if (vehicleTrails[id].polyline) {
            map.removeLayer(vehicleTrails[id].polyline);
            vehicleTrails[id].polyline = null;
        }
    });
}

function simulateMovement() {
    vehicles.forEach(vehicle => {
        if (vehicle.status === 'moving') {
            // Simulate localized movement (approx 100 meters jump)
            vehicle.lat += (Math.random() - 0.5) * 0.002;
            vehicle.lng += (Math.random() - 0.5) * 0.002;
        }
    });
    updateVehicleMarkers();
}

function getStatusColor(status) {
    switch (status) {
        case 'moving': return '#10b981'; // Green
        case 'idle': return '#94a3b8';   // Grey
        case 'alert': return '#ef4444';  // Red
        default: return '#6366f1';       // Indigo
    }
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('vehicleSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            const foundVehicle = vehicles.find(v => v.id === query || v.name.toLowerCase().includes(query.toLowerCase()));

            if (foundVehicle) {
                flyToVehicle(foundVehicle.id);
            } else {
                alert('Bus not found! Try Bus-1, Bus-5, Bus-12');
            }
        }
    });
}

// Global function to be called from HTML
window.flyToVehicle = function (id) {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) return;

    // Set Active State
    activeVehicleId = id;

    // Clean up previous trails
    removeAllTrails();

    // Draw trail logic immediately
    drawTrail(id);

    // Fly Logic
    if (map) {
        map.flyTo([vehicle.lat, vehicle.lng], 16, {
            animate: true,
            duration: 2
        });
    }

    // Open Popup
    if (markers[id]) markers[id].openPopup();

    // Highlight list item (visual feedback)
    document.querySelectorAll('.vehicle-item').forEach(item => {
        item.style.backgroundColor = 'transparent';
        if (item.textContent.includes(id)) {
            item.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
        }
    });
};

function initInteractions() {
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            localStorage.setItem('skp_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        });
    }
}

// Student Registry Logic
const STUDENT_STORAGE_KEY = 'skp_student_data';

function getStudentData() {
    const stored = localStorage.getItem(STUDENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveStudentData(data) {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(data));
}

function initStudentForm() {
    // Modified to handle inline form
    const form = document.getElementById('studentForm');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = form.querySelectorAll('input, select');

            // Collect Data
            const newStudent = {
                rollNo: inputs[0].value,
                name: inputs[1].value,
                dept: inputs[2].value,
                year: inputs[3].value,
                busRoute: inputs[4].value,
                registeredDate: new Date().toISOString()
            };

            // Save
            const data = getStudentData();
            data.push(newStudent);
            saveStudentData(data);

            alert('Student Registered Successfully!');
            form.reset();

            // Update Stats if it exists
            updateStudentStats();
        });
    }

    // Init stats on load
    updateStudentStats();
}

function updateStudentStats() {
    const count = getStudentData().length;
    const statEl = document.getElementById('totalStudentsCount');
    if (statEl) statEl.textContent = count;
}

// Active Bus Toggle Functionality
let showActiveOnly = false;

function updateLiveMapOverlay() {
    const fleetStatsEl = document.getElementById('mapFleetStats');
    const vehicleListEl = document.querySelector('.map-vehicle-list');

    if (!fleetStatsEl || !vehicleListEl) return;

    vehicleListEl.innerHTML = '';

    const activeVehicles = vehicles.filter(v => v.status === 'moving');
    const displayVehicles = showActiveOnly ? activeVehicles : vehicles;

    fleetStatsEl.innerHTML = `<span style="color: var(--accent-success);">● ${activeVehicles.length} Active</span>`;

    if (displayVehicles.length === 0) {
        vehicleListEl.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);"><p style="font-size:0.8rem;">No buses to display</p></div>`;
        return;
    }

    displayVehicles.forEach(v => {
        const item = document.createElement('div');
        item.className = 'map-vehicle-item';
        item.dataset.id = v.id;

        const dotClass = v.status === 'moving' ? 'dot-green' : v.status === 'alert' ? 'dot-red' : 'dot-grey';

        item.innerHTML = `
            <div class="v-status-dot ${dotClass}"></div>
            <span style="font-weight: 600;">${v.id}</span>
            <span style="margin-left:auto; font-size:0.85rem; color: var(--text-muted);">${v.name}</span>
        `;

        item.addEventListener('click', () => {
            flyToVehicle(v.id);
            document.querySelectorAll('.map-vehicle-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });

        vehicleListEl.appendChild(item);
    });
}

function toggleActiveBuses() {
    showActiveOnly = !showActiveOnly;
    const btn = document.getElementById('activeBusBtn');

    if (btn) {
        btn.textContent = showActiveOnly ? 'Show All Buses' : 'Show Active Only';
        btn.style.background = showActiveOnly ? 'var(--primary)' : 'var(--accent-success)';
    }

    // Update marker visibility
    vehicles.forEach(v => {
        const marker = markers[v.id];
        if (!marker || !map) return;

        if (showActiveOnly && v.status !== 'moving') {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        } else {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        }
    });

    updateLiveMapOverlay();
}

// Initialize active bus button
window.addEventListener('DOMContentLoaded', () => {
    const activeBtn = document.getElementById('activeBusBtn');
    if (activeBtn) {
        activeBtn.addEventListener('click', toggleActiveBuses);
    }
});
