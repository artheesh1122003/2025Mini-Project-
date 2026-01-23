const CONFIG = {
    WEATHER_API: 'https://api.open-meteo.com/v1/forecast',
    GEO_API: 'https://geocoding-api.open-meteo.com/v1/search'
};

const UI = {
    cityInput: document.getElementById('city-input'),
    suggestions: document.getElementById('search-suggestions'),
    locationName: document.getElementById('location-name'),
    currentDate: document.getElementById('current-date'),
    currentTemp: document.getElementById('current-temp'),
    weatherDesc: document.getElementById('weather-description'),
    largeIcon: document.getElementById('weather-icon-large'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    visibility: document.getElementById('visibility'),
    pressure: document.getElementById('pressure'),
    forecastList: document.getElementById('forecast-list'),
    unitSwitch: document.getElementById('unit-switch'),
    locationBtn: document.getElementById('location-btn'),
    loader: document.getElementById('loader'),
    hourlyList: document.getElementById('hourly-list'),
    uvIndex: document.getElementById('uv-index'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    feelsLike: document.getElementById('feels-like'),
    precipitation: document.getElementById('precipitation')
};

let currentData = null;
let isFahrenheit = false;

// Weather Code Mapping
const weatherCodes = {
    0: { desc: 'Clear Sky', icon: 'sun', gradient: 'var(--sunny-gradient)' },
    1: { desc: 'Mainly Clear', icon: 'cloud-sun', gradient: 'var(--sunny-gradient)' },
    2: { desc: 'Partly Cloudy', icon: 'cloud', gradient: 'var(--cloudy-gradient)' },
    3: { desc: 'Overcast', icon: 'cloud', gradient: 'var(--cloudy-gradient)' },
    45: { desc: 'Fog', icon: 'cloud-fog', gradient: 'var(--cloudy-gradient)' },
    48: { desc: 'Depositing Rime Fog', icon: 'cloud-fog', gradient: 'var(--cloudy-gradient)' },
    51: { desc: 'Light Drizzle', icon: 'cloud-drizzle', gradient: 'var(--rainy-gradient)' },
    53: { desc: 'Moderate Drizzle', icon: 'cloud-drizzle', gradient: 'var(--rainy-gradient)' },
    55: { desc: 'Dense Drizzle', icon: 'cloud-drizzle', gradient: 'var(--rainy-gradient)' },
    61: { desc: 'Slight Rain', icon: 'cloud-rain', gradient: 'var(--rainy-gradient)' },
    63: { desc: 'Moderate Rain', icon: 'cloud-rain', gradient: 'var(--rainy-gradient)' },
    65: { desc: 'Heavy Rain', icon: 'cloud-rain', gradient: 'var(--rainy-gradient)' },
    71: { desc: 'Slight Snow', icon: 'cloud-snow', gradient: 'var(--night-gradient)' },
    73: { desc: 'Moderate Snow', icon: 'cloud-snow', gradient: 'var(--night-gradient)' },
    75: { desc: 'Heavy Snow', icon: 'cloud-snow', gradient: 'var(--night-gradient)' },
    80: { desc: 'Slight Showers', icon: 'cloud-rain-wind', gradient: 'var(--rainy-gradient)' },
    81: { desc: 'Moderate Showers', icon: 'cloud-rain-wind', gradient: 'var(--rainy-gradient)' },
    82: { desc: 'Violent Showers', icon: 'cloud-rain-wind', gradient: 'var(--rainy-gradient)' },
    95: { desc: 'Thunderstorm', icon: 'cloud-lightning', gradient: 'var(--night-gradient)' },
};

// Extend UI config
Object.assign(UI, {
    mapModal: document.getElementById('map-modal'),
    closeModal: document.getElementById('close-modal'),
    confirmMapLoc: document.getElementById('confirm-map-location'),
    mapPreview: document.getElementById('map-preview'),
    modalSearchInput: document.getElementById('modal-search-input'),
    modalSuggestions: document.getElementById('modal-search-suggestions'),
    modalLocateBtn: document.getElementById('modal-locate-btn'),
    recentList: document.getElementById('recent-locations-list'),
    selectionName: document.getElementById('selection-name')
});

let map, marker, selectedCoords = null;
let recentLocations = JSON.parse(localStorage.getItem('recentLocations') || '[]');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    updateDate();
    await detectLocation();
    setupEventListeners();
    initMap(); // Pre-init Leaflet
    renderRecentLocations();
}

function updateDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    UI.currentDate.textContent = new Date().toLocaleDateString('en-US', options);
}

function initMap() {
    if (map) return;
    map = L.map('interactive-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    map.on('click', async (e) => {
        updateSelectedLocation(e.latlng.lat, e.latlng.lng);
    });
}

async function updateSelectedLocation(lat, lng) {
    selectedCoords = { lat, lng };

    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            updateSelectedLocation(pos.lat, pos.lng);
        });
    }

    UI.confirmMapLoc.disabled = false;
    UI.selectionName.textContent = `Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    // Attempt reverse geocoding
    try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
        const data = await resp.json();
        if (data.display_name) {
            const name = data.address.city || data.address.town || data.address.village || data.address.suburb || data.display_name.split(',')[0];
            UI.selectionName.textContent = name;
            UI.selectionName.dataset.fullName = data.display_name;
        }
    } catch (e) {
        console.warn('Reverse geocoding failed', e);
    }
}

function updateGoogleMap(lat, lon) {
    UI.mapPreview.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            style="border:0"
            src="https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed" 
            allowfullscreen>
        </iframe>`;
}

async function detectLocation() {
    if (navigator.geolocation) {
        const locationTimeout = setTimeout(() => {
            console.log('Geolocation timed out, falling back to London');
            fetchWeather(51.5074, -0.1278, 'London');
        }, 5000);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                clearTimeout(locationTimeout);
                const { latitude, longitude } = position.coords;
                await fetchWeather(latitude, longitude, 'Your Location');
            },
            (error) => {
                clearTimeout(locationTimeout);
                console.warn('Geolocation error:', error);
                fetchWeather(51.5074, -0.1278, 'London');
            },
            { timeout: 5000 }
        );
    } else {
        fetchWeather(51.5074, -0.1278, 'London');
    }
}

async function fetchWeather(lat, lon, name) {
    UI.loader.classList.remove('hidden');
    try {
        const hourlyParams = 'temperature_2m,weather_code';
        const dailyParams = 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset';
        const currentParams = 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,visibility';

        const response = await fetch(`${CONFIG.WEATHER_API}?latitude=${lat}&longitude=${lon}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=auto`);
        const data = await response.json();
        currentData = data;
        updateUI(data, name);
        updateGoogleMap(lat, lon);
        saveRecentLocation(lat, lon, name);

        // Update Leaflet marker if map exists
        if (map) {
            map.setView([lat, lon], 10);
            if (marker) marker.setLatLng([lat, lon]);
            else marker = L.marker([lat, lon]).addTo(map);
        }
    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('Failed to fetch weather data. Please try again.');
    } finally {
        UI.loader.classList.add('hidden');
    }
}

function updateUI(data, name) {
    const current = data.current;
    const weather = weatherCodes[current.weather_code] || {
        desc: 'Unknown', icon: 'help-circle', gradient: 'var(--primary-gradient)'
    };

    UI.locationName.textContent = name;
    UI.currentTemp.textContent = Math.round(isFahrenheit ? (current.temperature_2m * 9 / 5) + 32 : current.temperature_2m);
    UI.weatherDesc.textContent = weather.desc;
    UI.humidity.textContent = `${current.relative_humidity_2m}%`;
    UI.windSpeed.textContent = `${current.wind_speed_10m} ${isFahrenheit ? 'mph' : 'km/h'}`;
    UI.pressure.textContent = `${current.surface_pressure} hPa`;
    UI.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
    UI.feelsLike.textContent = `${Math.round(isFahrenheit ? (current.apparent_temperature * 9 / 5) + 32 : current.apparent_temperature)}°`;
    UI.precipitation.textContent = `${current.precipitation} mm`;

    // Update theme
    document.body.style.background = weather.gradient;

    // Large Icon
    UI.largeIcon.innerHTML = `<i data-lucide="${weather.icon}" size="120" stroke-width="1.5"></i>`;

    // Extra Metrics
    UI.uvIndex.textContent = data.daily.uv_index_max[0];
    UI.sunrise.textContent = new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    UI.sunset.textContent = new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Forecasts
    updateHourlyUI(data.hourly);
    updateForecastUI(data.daily);

    lucide.createIcons();
}

function updateHourlyUI(hourly) {
    UI.hourlyList.innerHTML = '';
    const now = new Date();
    const currentHour = now.getHours();

    // Show next 24 hours
    for (let i = 0; i < 24; i++) {
        const time = new Date(hourly.time[i]);
        const hour = time.getHours();
        const hourLabel = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        const temp = Math.round(isFahrenheit ? (hourly.temperature_2m[i] * 9 / 5) + 32 : hourly.temperature_2m[i]);
        const weather = weatherCodes[hourly.weather_code[i]] || { icon: 'cloud' };

        const item = document.createElement('div');
        item.className = `hourly-item ${hour === currentHour ? 'now' : ''}`;
        item.innerHTML = `
            <span class="hourly-time">${hour === currentHour ? 'Now' : hourLabel}</span>
            <div class="hourly-icon">
                <i data-lucide="${weather.icon}"></i>
            </div>
            <span class="hourly-temp">${temp}°</span>
        `;
        UI.hourlyList.appendChild(item);
    }
}

function updateForecastUI(daily) {
    UI.forecastList.innerHTML = '';

    for (let i = 1; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayMonth = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        const weather = weatherCodes[daily.weather_code[i]] || { desc: 'Unknown', icon: 'cloud' };

        const maxTemp = Math.round(isFahrenheit ? (daily.temperature_2m_max[i] * 9 / 5) + 32 : daily.temperature_2m_max[i]);
        const minTemp = Math.round(isFahrenheit ? (daily.temperature_2m_min[i] * 9 / 5) + 32 : daily.temperature_2m_min[i]);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.style.animationDelay = `${i * 0.1}s`;
        item.innerHTML = `
            <div class="forecast-date">
                <span class="day">${dayName}</span>
                <span class="date">${dayMonth}</span>
            </div>
            <div class="forecast-icon">
                <i data-lucide="${weather.icon}"></i>
            </div>
            <div class="forecast-desc">${weather.desc}</div>
            <div class="forecast-temps">
                <span class="high">${maxTemp}°</span>
                <span class="low">${minTemp}°</span>
            </div>
        `;
        UI.forecastList.appendChild(item);
    }
}

function setupEventListeners() {
    // Search Suggestions
    UI.cityInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value;
        if (query.length < 2) {
            UI.suggestions.classList.add('hidden');
            return;
        }

        try {
            const resp = await fetch(`${CONFIG.GEO_API}?name=${query}&count=5&language=en&format=json`);
            const data = await resp.json();

            if (data.results) {
                UI.suggestions.innerHTML = data.results.map(city => `
                    <div class="suggestion-item" data-lat="${city.latitude}" data-lon="${city.longitude}" data-name="${city.name}, ${city.country}">
                        ${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}
                    </div>
                `).join('');
                UI.suggestions.classList.remove('hidden');
            } else {
                UI.suggestions.classList.add('hidden');
            }
        } catch (e) { console.error(e); }
    }, 400));

    // Select Suggestion
    UI.suggestions.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const lat = item.dataset.lat;
            const lon = item.dataset.lon;
            const name = item.dataset.name;
            UI.cityInput.value = name;
            UI.suggestions.classList.add('hidden');
            fetchWeather(lat, lon, name);
        }
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (!UI.suggestions.contains(e.target) && e.target !== UI.cityInput) {
            UI.suggestions.classList.add('hidden');
        }
    });

    // Unit Toggle
    UI.unitSwitch.addEventListener('change', (e) => {
        isFahrenheit = e.target.checked;
        if (currentData) {
            updateUI(currentData, UI.locationName.textContent);
        }
    });

    // Location Button - Open Map Modal
    UI.locationBtn.addEventListener('click', () => {
        UI.mapModal.classList.remove('hidden');
        UI.modalSearchInput.value = '';
        UI.modalSuggestions.classList.add('hidden');
        // Leaflet needs a resize invalidate when shown from hidden
        setTimeout(() => map.invalidateSize(), 100);
    });

    // Close Modal
    UI.closeModal.addEventListener('click', () => {
        UI.mapModal.classList.add('hidden');
    });

    // Confirm map location
    UI.confirmMapLoc.addEventListener('click', () => {
        if (selectedCoords) {
            const name = UI.selectionName.textContent.replace('Selected: ', '');
            fetchWeather(selectedCoords.lat, selectedCoords.lng, name);
            UI.mapModal.classList.add('hidden');
        }
    });

    // Close modal on background click
    UI.mapModal.addEventListener('click', (e) => {
        if (e.target === UI.mapModal) {
            UI.mapModal.classList.add('hidden');
        }
    });

    // Modal Locate Button
    UI.modalLocateBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                map.setView([latitude, longitude], 12);
                updateSelectedLocation(latitude, longitude);
            });
        }
    });

    // Recent Locations Click
    UI.recentList.addEventListener('click', (e) => {
        const item = e.target.closest('.recent-item');
        if (item) {
            const { lat, lon, name } = item.dataset;
            fetchWeather(parseFloat(lat), parseFloat(lon), name);
            UI.mapModal.classList.add('hidden');
        }
    });

    // Modal Search Suggestions
    UI.modalSearchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value;
        if (query.length < 2) {
            UI.modalSuggestions.classList.add('hidden');
            return;
        }

        try {
            const resp = await fetch(`${CONFIG.GEO_API}?name=${query}&count=5&language=en&format=json`);
            const data = await resp.json();

            if (data.results) {
                UI.modalSuggestions.innerHTML = data.results.map(city => `
                    <div class="suggestion-item" data-lat="${city.latitude}" data-lon="${city.longitude}" data-name="${city.name}">
                        ${city.name}, ${city.admin1 ? city.admin1 + ', ' : ''}${city.country}
                    </div>
                `).join('');
                UI.modalSuggestions.classList.remove('hidden');
            } else {
                UI.modalSuggestions.classList.add('hidden');
            }
        } catch (e) { console.error(e); }
    }, 400));

    // Select Modal Suggestion
    UI.modalSuggestions.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
            const lat = parseFloat(item.dataset.lat);
            const lon = parseFloat(item.dataset.lon);
            const name = item.dataset.name;

            map.setView([lat, lon], 12);
            updateSelectedLocation(lat, lon);
            UI.modalSearchInput.value = name;
            UI.modalSuggestions.classList.add('hidden');
        }
    });
}

function saveRecentLocation(lat, lon, name) {
    if (name === 'Your Location' || name === 'London') return;

    const newLoc = { lat, lon, name };
    recentLocations = recentLocations.filter(loc => loc.name !== name);
    recentLocations.unshift(newLoc);
    recentLocations = recentLocations.slice(0, 5);

    localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
    renderRecentLocations();
}

function renderRecentLocations() {
    if (recentLocations.length === 0) {
        UI.recentList.innerHTML = '<span class="no-recent">No recent searches</span>';
        return;
    }

    UI.recentList.innerHTML = recentLocations.map(loc => `
        <div class="recent-item" data-lat="${loc.lat}" data-lon="${loc.lon}" data-name="${loc.name}">
            <i data-lucide="history" size="14"></i>
            ${loc.name}
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

