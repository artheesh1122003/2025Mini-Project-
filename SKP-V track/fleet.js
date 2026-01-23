document.addEventListener('DOMContentLoaded', () => {
    updateDate();

    // Theme Init
    if (localStorage.getItem('skp_theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    initFleet();
    initModal();


    // Update date every minute
    setInterval(updateDate, 60000);
});

function updateDate() {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);
    document.getElementById('currentDate').textContent = dateStr;
}

// Data Handling - Unified in LocalStorage
const STORAGE_KEY = 'skp_fleet_data';

// Initial Seed Data (if empty)
// Initial Seed Data (if empty)
const initialFleet = [
    {
        id: 'TN-25-AB-1234',
        model: 'Ashok Leyland 4220',
        name: 'Bus 1 (Chengam)',
        type: 'bus',
        driver: 'Rajesh Kumar',
        fuel: 'Diesel',
        location: 'Chengam',
        km: '15400',
        status: 'moving',
        lat: 12.2253,
        lng: 79.0747
    },
    {
        id: 'TN-25-XY-9876',
        model: 'Tata Marcopolo',
        name: 'Bus 5 (Polur)',
        type: 'bus',
        driver: 'Senthil Node',
        fuel: 'Diesel',
        location: 'Polur',
        km: '8500',
        status: 'moving',
        lat: 12.2500,
        lng: 79.1000
    },
    {
        id: 'TN-25-K-4455',
        model: 'Tempo Traveller',
        name: 'Staff Van 2',
        type: 'van',
        driver: 'Kumar P',
        fuel: 'Diesel',
        location: 'Campus',
        km: '42000',
        status: 'idle',
        lat: 12.2200,
        lng: 79.0700
    },
    {
        id: 'TN-25-Z-1122',
        model: 'Eicher Pro',
        name: 'Bus 3 (Kanji)',
        type: 'bus',
        driver: 'Mani B',
        fuel: 'Diesel',
        location: 'Workshop',
        km: '1200',
        status: 'maintenance',
        lat: 12.2300,
        lng: 79.0800
    }
];

function getFleetData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    // If stored is empty array or null, use initial
    if (!stored) return initialFleet;
    const parsed = JSON.parse(stored);
    return parsed.length > 0 ? parsed : initialFleet;
}

function saveFleetData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch event for other tabs
    window.dispatchEvent(new Event('storage'));
}

function initFleet() {
    const data = getFleetData();
    // Ensure we save the seed data so other pages see it too
    if (!localStorage.getItem(STORAGE_KEY)) {
        saveFleetData(data);
    }
    renderFleet(data);
    initFilters();
    initSearch();
}

function renderFleet(data) {
    const grid = document.getElementById('fleetGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">
            <i class='bx bx-search' style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <p>No vehicles found matching your criteria.</p>
        </div>`;
        return;
    }

    data.forEach(vehicle => {
        const card = document.createElement('div');
        card.className = 'fleet-card';

        let iconClass = 'bxs-car';
        if (vehicle.type === 'truck') iconClass = 'bxs-truck';
        if (vehicle.type === 'bus') iconClass = 'bxs-bus';
        if (vehicle.type === 'van') iconClass = 'bxs-bus'; // Fallback

        let statusClass = 'idle';
        let statusText = 'Idle';
        if (vehicle.status === 'moving') { statusClass = 'moving'; statusText = 'Active'; }
        if (vehicle.status === 'maintenance') { statusClass = 'alert'; statusText = 'Maintenance'; }

        card.innerHTML = `
            <div class="card-header">
                <div class="v-type-icon"><i class='bx ${iconClass}'></i></div>
                <span class="status-badge ${statusClass}">${statusText}</span>
                <div class="menu-dots"><i class='bx bx-dots-vertical-rounded'></i></div>
            </div>
            
            <div style="height: 120px; border-radius: 8px; overflow: hidden; margin: 1rem 0; background: #000; display: flex; align-items: center; justify-content: center;">
                 <div style="text-align:center; color: #fff;">
                    <i class='bx ${iconClass}' style="font-size: 3rem; opacity: 0.5;"></i>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem; color: #888;">${vehicle.type.toUpperCase()}</div>
                 </div>
            </div>

            <div class="vehicle-details">
                <h3>${vehicle.name || vehicle.model}</h3>
                <p class="plate-number">${vehicle.id}</p>
                <div class="detail-row">
                    <span><i class='bx bx-user'></i> ${vehicle.driver || 'N/A'}</span>
                    <span><i class='bx bx-gas-pump'></i> ${vehicle.fuel || 'Diesel'}</span>
                </div>
                <div class="detail-row">
                    <span><i class='bx bx-map'></i> ${vehicle.location || 'Campus'}</span>
                    <span><i class='bx bx-ruler'></i> ${vehicle.km || '0'} km</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="action-btn" onclick="window.location.href='index.html?track=${vehicle.id}'"><i class='bx bxs-map-alt'></i> Live Map</button>
                <button class="action-btn outline" onclick="viewVehicle('${vehicle.id}')">Details</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filtering
function initFilters() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filter = chip.dataset.filter;
            const currentData = getFleetData();

            if (filter === 'all') {
                renderFleet(currentData);
            } else if (filter === 'maintenance') {
                const filtered = currentData.filter(v => v.status === 'maintenance');
                renderFleet(filtered);
            } else {
                const filtered = currentData.filter(v => v.type === filter);
                renderFleet(filtered);
            }
        });
    });
}

// Search
function initSearch() {
    const searchInput = document.getElementById('fleetSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const currentData = getFleetData();
        const filtered = currentData.filter(v =>
            (v.name && v.name.toLowerCase().includes(term)) ||
            (v.id && v.id.toLowerCase().includes(term)) ||
            (v.driver && v.driver.toLowerCase().includes(term))
        );
        renderFleet(filtered);
    });
}

// Modal Logic
function initModal() {
    const modal = document.getElementById('addVehicleModal');
    const openBtn = document.getElementById('addVehicleBtn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.querySelector('.vehicle-form');

    if (!modal) return;

    // Open
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        });
    }

    // Close
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle Real Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract inputs
            const inputs = form.querySelectorAll('input, select');
            const model = inputs[0].value;
            const plate = inputs[1].value;
            const driver = inputs[2].value;

            let finalType = 'bus';

            const newVehicle = {
                id: plate,
                model: model,
                name: `${model} (${plate})`,
                type: finalType,
                driver: driver,
                fuel: 'Diesel',
                location: 'Campus',
                km: '0',
                status: 'idle',
                lat: 12.2310 + (Math.random() - 0.5) * 0.01,
                lng: 79.0650 + (Math.random() - 0.5) * 0.01
            };

            const currentData = getFleetData();
            currentData.push(newVehicle);
            saveFleetData(currentData);

            alert('Vehicle Added Successfully!');
            form.reset();
            closeModal();
            renderFleet(getFleetData());
        });
    }

    // View Modal Logic
    const viewModal = document.getElementById('viewVehicleModal');
    const closeViewBtn = document.getElementById('closeViewModal');

    if (viewModal && closeViewBtn) {
        closeViewBtn.addEventListener('click', () => {
            // Close view modal
            viewModal.classList.remove('active');
            setTimeout(() => viewModal.style.display = 'none', 300);
        });
        viewModal.addEventListener('click', (e) => {
            if (e.target === viewModal) {
                viewModal.classList.remove('active');
                setTimeout(() => viewModal.style.display = 'none', 300);
            }
        });
    }

    // Delete Button Logic
    const deleteBtn = document.getElementById('deleteVehicleBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (currentViewId && confirm('Are you sure you want to remove this vehicle?')) {
                const currentData = getFleetData();
                const newData = currentData.filter(v => v.id !== currentViewId);
                saveFleetData(newData);

                if (viewModal) {
                    viewModal.classList.remove('active');
                    setTimeout(() => viewModal.style.display = 'none', 300);
                }
                renderFleet(newData);
            }
        });
    }
}

let currentViewId = null;

function viewVehicle(id) {
    const data = getFleetData();
    const vehicle = data.find(v => v.id === id);
    if (!vehicle) return;

    currentViewId = id;

    // Populate Data
    document.getElementById('detailModel').textContent = vehicle.name || vehicle.model;
    document.getElementById('detailPlate').textContent = vehicle.id;
    document.getElementById('detailDriver').textContent = vehicle.driver || 'N/A';
    document.getElementById('detailLocation').textContent = vehicle.location || 'Unknown';
    document.getElementById('detailFuel').textContent = vehicle.fuel || 'Diesel';
    document.getElementById('detailKm').textContent = (vehicle.km || '0') + ' km';

    // Status Badge
    const statusBadge = document.getElementById('detailStatus');
    statusBadge.className = 'status-badge ' + (vehicle.status === 'moving' ? 'moving' : vehicle.status === 'maintenance' ? 'alert' : 'idle');
    statusBadge.textContent = vehicle.status === 'moving' ? 'Active' : vehicle.status === 'maintenance' ? 'Maintenance' : 'Idle';

    // Icon
    const icon = document.getElementById('detailIcon');
    icon.className = 'bx ' + (vehicle.type === 'truck' ? 'bxs-truck' : 'bxs-bus');

    // Show Modal
    const modal = document.getElementById('viewVehicleModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}


