// Route data structure
const routes = [
    {
        id: 'route-1',
        name: 'Chengam Route',
        buses: ['Bus-1', 'Bus-4'],
        stops: ['SKP College', 'Chengam Bus Stand', 'Tiruvannamalai Junction', 'Polur'],
        distance: '45 km',
        duration: '1.5 hrs',
        status: 'active',
        color: '#10b981'
    },
    {
        id: 'route-2',
        name: 'Polur Route',
        buses: ['Bus-5', 'Bus-8'],
        stops: ['SKP College', 'Polur Town', 'Arani', 'Vellore'],
        distance: '65 km',
        duration: '2 hrs',
        status: 'active',
        color: '#6366f1'
    },
    {
        id: 'route-3',
        name: 'Kanji Route',
        buses: ['Bus-3'],
        stops: ['SKP College', 'Kanji', 'Chetpet', 'Tiruvannamalai'],
        distance: '25 km',
        duration: '45 min',
        status: 'active',
        color: '#f59e0b'
    },
    {
        id: 'route-4',
        name: 'Campus Shuttle',
        buses: ['Bus-12'],
        stops: ['Main Gate', 'Hostel Block A', 'Hostel Block B', 'Academic Block'],
        distance: '5 km',
        duration: '15 min',
        status: 'active',
        color: '#8b5cf6'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    initTheme();
    renderRoutes();
    updateStats();
    initSearch();

    setInterval(updateDate, 60000);
    setInterval(updateLiveData, 5000); // Update every 5 seconds
});

function updateDate() {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = dateStr;
}

function initTheme() {
    if (localStorage.getItem('skp_theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            localStorage.setItem('skp_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        });
    }
}

function getVehicleData() {
    const stored = localStorage.getItem('skp_fleet_data');
    if (stored) return JSON.parse(stored);

    // Default data
    return [
        { id: 'Bus-1', name: 'Bus 1 (Chengam)', status: 'moving', route: 'route-1' },
        { id: 'Bus-4', name: 'Bus 4 (Chengam)', status: 'idle', route: 'route-1' },
        { id: 'Bus-5', name: 'Bus 5 (Polur)', status: 'moving', route: 'route-2' },
        { id: 'Bus-8', name: 'Bus 8 (Polur)', status: 'moving', route: 'route-2' },
        { id: 'Bus-3', name: 'Bus 3 (Kanji)', status: 'alert', route: 'route-3' },
        { id: 'Bus-12', name: 'Bus 12 (Campus)', status: 'moving', route: 'route-4' }
    ];
}

function renderRoutes() {
    const grid = document.getElementById('routesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const vehicles = getVehicleData();

    routes.forEach(route => {
        const routeBuses = vehicles.filter(v => route.buses.includes(v.id));
        const activeBuses = routeBuses.filter(b => b.status === 'moving').length;

        const card = document.createElement('div');
        card.className = 'route-card';
        card.style.borderLeft = `4px solid ${route.color}`;

        card.innerHTML = `
            <div class="route-header">
                <div class="route-title">
                    <i class='bx bxs-route' style="color: ${route.color}; font-size: 1.5rem;"></i>
                    <div>
                        <h3>${route.name}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
                            ${route.stops.length} stops • ${route.distance}
                        </p>
                    </div>
                </div>
                <span class="status-badge ${route.status === 'active' ? 'moving' : 'idle'}">
                    ${route.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            </div>
            
            <div class="route-info">
                <div class="info-item">
                    <i class='bx bxs-bus'></i>
                    <span>${activeBuses}/${routeBuses.length} Buses Active</span>
                </div>
                <div class="info-item">
                    <i class='bx bx-time'></i>
                    <span>${route.duration}</span>
                </div>
            </div>
            
            <div class="route-stops">
                <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text-muted);">
                    <i class='bx bxs-map-pin'></i> Route Stops
                </h4>
                <div class="stops-list">
                    ${route.stops.map((stop, index) => `
                        <div class="stop-item">
                            <div class="stop-number" style="background: ${route.color};">${index + 1}</div>
                            <span>${stop}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="route-buses">
                <h4 style="font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text-muted);">
                    <i class='bx bxs-bus'></i> Assigned Buses
                </h4>
                <div class="buses-list">
                    ${routeBuses.map(bus => {
            const statusColor = bus.status === 'moving' ? '#10b981' : bus.status === 'alert' ? '#ef4444' : '#94a3b8';
            return `
                            <div class="bus-chip" onclick="trackBus('${bus.id}')">
                                <div class="bus-status-dot" style="background: ${statusColor};"></div>
                                <span>${bus.id}</span>
                                <i class='bx bx-map-alt' style="margin-left: auto; opacity: 0.5;"></i>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
            
            <div class="route-actions">
                <button class="action-btn" onclick="viewRouteMap('${route.id}')">
                    <i class='bx bxs-map'></i> View on Map
                </button>
                <button class="action-btn outline" onclick="viewRouteDetails('${route.id}')">
                    Details
                </button>
            </div>
        `;

        grid.appendChild(card);
    });
}

function updateStats() {
    const vehicles = getVehicleData();
    const activeRoutes = routes.filter(r => r.status === 'active').length;
    const busesOnRoute = vehicles.filter(v => v.status === 'moving').length;
    const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);

    const activeRoutesEl = document.getElementById('activeRoutesCount');
    const busesOnRouteEl = document.getElementById('busesOnRouteCount');
    const totalStopsEl = document.getElementById('totalStopsCount');

    if (activeRoutesEl) activeRoutesEl.textContent = activeRoutes;
    if (busesOnRouteEl) busesOnRouteEl.textContent = busesOnRoute;
    if (totalStopsEl) totalStopsEl.textContent = totalStops;
}

function updateLiveData() {
    // Simulate real-time updates
    renderRoutes();
    updateStats();
}

function initSearch() {
    const searchInput = document.getElementById('routeSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.route-card');

        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(term) ? 'block' : 'none';
        });
    });
}

function trackBus(busId) {
    window.location.href = `index.html?track=${busId}`;
}

function viewRouteMap(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (route && route.buses.length > 0) {
        window.location.href = `index.html?track=${route.buses[0]}`;
    }
}

function viewRouteDetails(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (route) {
        alert(`Route: ${route.name}\nDistance: ${route.distance}\nDuration: ${route.duration}\nStops: ${route.stops.join(', ')}`);
    }
}
