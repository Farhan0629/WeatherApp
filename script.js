const apiKey = "34ce131779ea96b9def18f429f0f373a";
let currentUnit = 'metric';  // 'metric' for Celsius, 'imperial' for Fahrenheit
let lastCity = '';
let locationGranted = false;

// DOM references
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const suggestionsList = document.getElementById('suggestions');
const locationBtn = document.getElementById('locationBtn');
const unitToggle = document.getElementById('unitToggle');
const weatherCard = document.getElementById('weatherCard');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const weatherAnimation = document.getElementById('weatherAnimation');
const dateTime = document.getElementById('dateTime');
// Weather data DOM refs
const cityName = document.getElementById('cityName');
const country = document.getElementById('country');
const temperature = document.getElementById('temperature');
const tempUnit = document.getElementById('tempUnit');
const weatherIcon = document.getElementById('weatherIcon');
const weatherMain = document.getElementById('weatherMain');
const weatherDescription = document.getElementById('weatherDescription');
const visibility = document.getElementById('visibility');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const feelsLike = document.getElementById('feelsLike');
const pressure = document.getElementById('pressure');
const uvIndex = document.getElementById('uvIndex');

const forecastSection = document.getElementById('forecast');
const forecastCards = document.getElementById('forecastCards');

// Particle canvas setup
const particleCanvas = document.getElementById('particle-canvas');
const ctx = particleCanvas.getContext('2d');
let particles = [];
let animationFrame;

// Weather backgrounds and particles
const weatherBackgrounds = {
    'clear': 'clear-sky',
    'clouds': 'few-clouds',
    'few clouds': 'few-clouds',
    'scattered clouds': 'scattered-clouds',
    'broken clouds': 'broken-clouds',
    'rain': 'rain',
    'drizzle': 'shower-rain',
    'thunderstorm': 'thunderstorm',
    'snow': 'snow',
    'mist': 'mist',
    'fog': 'mist',
    'haze': 'mist'
};

//--- Accessibility helpers

function setAriaSelected(idx) {
    const list = suggestionsList.querySelectorAll('li');
    list.forEach((el, i) => el.setAttribute('aria-selected', i === idx));
}

//--- Particle animation (rain/snow)

function setParticleType(type) {
    cancelAnimationFrame(animationFrame);
    particles = [];
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    if (type === "rain") initRain();
    else if (type === "snow") initSnow();
    else return; // Clear
    animateParticles();
}

function resizeCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initRain() {
    for(let i=0;i<180;i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            l: Math.random() * 16 + 16,
            xs: Math.random() * 4 - 2,
            ys: Math.random() * 14 + 14
        });
    }
}
function initSnow() {
    for(let i=0;i<100;i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            r: Math.random() * 2.8 + 1.6,
            d: Math.random() * 10
        });
    }
}
function animateParticles() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    if (particles[0]?.l) {  // Rain
        ctx.strokeStyle = "rgba(174,194,224,0.89)";
        ctx.lineWidth = 2.1;
        for(let i=0;i<particles.length;i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.xs, p.y + p.l);
            ctx.stroke();
        }
        updateRain();
    } else if (particles[0]?.r) { // Snow
        ctx.fillStyle = "rgba(255,255,255,0.93)";
        for(let i=0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, false);
            ctx.fill();
        }
        updateSnow();
    }
    animationFrame = requestAnimationFrame(animateParticles);
}
function updateRain() {
    for(let i=0;i<particles.length;i++) {
        const p = particles[i];
        p.x += p.xs;
        p.y += p.ys;
        if(p.x > particleCanvas.width || p.y > particleCanvas.height) {
            p.x = Math.random() * particleCanvas.width;
            p.y = -16;
        }
    }
}
let angle = 0;
function updateSnow() {
    angle += 0.01;
    for(let i=0;i<particles.length;i++) {
        const p = particles[i];
        p.y += Math.cos(angle + p.d) + 1 + p.r/2;
        p.x += Math.sin(angle) * 2;
        if(p.x > particleCanvas.width + 7 || p.x < -7 || p.y > particleCanvas.height) {
            p.x = Math.random() * particleCanvas.width;
            p.y = -7;
        }
    }
}

//--- Main logic

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTime.textContent = now.toLocaleDateString('en-US', options);
}

function updateBackgroundAnimation(weatherCondition) {
    weatherAnimation.className = 'weather-animation';
    const key = weatherCondition.toLowerCase();
    weatherAnimation.classList.add(weatherBackgrounds[key] || 'clear-sky');
    particleCanvas.style.display = 'none';
    if (key.includes('rain') || key.includes('drizzle')) {
        setParticleType('rain');
        particleCanvas.style.display = '';
    } else if (key.includes('snow')) {
        setParticleType('snow');
        particleCanvas.style.display = '';
    } else {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    }
}

// Search suggestions
let citiesData = [];
fetch('https://countriesnow.space/api/v0.1/countries/population/cities')
  .then(res => res.json())
  .then(data => { citiesData = data.data.map(c => c.city); });

function showSuggestions(value) {
    if (!value) {
        suggestionsList.innerHTML = '';
        suggestionsList.classList.remove('visible');
        return;
    }
    const match = citiesData.filter(
        c => c.toLowerCase().startsWith(value.toLowerCase())
    ).slice(0,8);
    if (match.length) {
        suggestionsList.innerHTML = match.map((city, i) =>
            `<li role="option" aria-selected="${i === 0 ? 'true' : 'false'}">${city}</li>`).join('');
        suggestionsList.classList.add('visible');
    } else {
        suggestionsList.innerHTML = '';
        suggestionsList.classList.remove('visible');
    }
}

// Get weather data (current and forecast)
async function getWeatherData(city, skipForecast = false) {
    showLoading();
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${currentUnit}`;
        const res = await fetch(weatherUrl);
        if (!res.ok) throw new Error('City not found');
        const data = await res.json();
        displayWeatherData(data);
        updateBackgroundAnimation(data.weather[0].main.toLowerCase());
        if (!skipForecast) getForecastData(city, data.coord);
        lastCity = city;
    } catch (err) {
        showError(err.message);
    }
}
async function getWeatherByCoords(lat, lon, skipForecast = false) {
    showLoading();
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Unable to find weather for your location');
        const data = await res.json();
        displayWeatherData(data);
        updateBackgroundAnimation(data.weather[0].main.toLowerCase());
        if (!skipForecast) getForecastData(`${data.name}`, data.coord);
        lastCity = data.name;
    } catch (err) {
        showError(err.message);
    }
}
async function getForecastData(city, coord) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${apiKey}&units=${currentUnit}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderForecast(data);
    } catch (err) {
        forecastSection.style.display = 'none';
    }
}

// Render current weather
function displayWeatherData(data) {
    cityName.textContent = data.name;
    country.textContent = data.sys.country;
    temperature.textContent = Math.round(data.main.temp);
    tempUnit.textContent = currentUnit === 'metric' ? '°C' : '°F';
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    weatherMain.textContent = data.weather[0].main;
    weatherDescription.textContent = data.weather[0].description;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed.toFixed(1)} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}${currentUnit === 'metric' ? '°C' : '°F'}`;
    pressure.textContent = `${data.main.pressure} hPa`;
    uvIndex.textContent = calculateUVIndex(data.weather[0].id);
    updateDateTime();
    showWeatherCard();
}

// Render forecast section
function renderForecast(data) {
    const forecastArray = [];
    let currentDay = '';
    for (const item of data.list) {
        const dt = new Date(item.dt * 1000);
        const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
        if (forecastArray.length < 5 && dayName !== currentDay && dt.getHours() === 12) {
            forecastArray.push({
                day: dayName,
                icon: item.weather[0].icon,
                temp: Math.round(item.main.temp),
                description: item.weather[0].main
            });
            currentDay = dayName;
        }
    }
    if (forecastArray.length) {
        forecastCards.innerHTML = forecastArray.map(fc =>
          `<div class="forecast-card" aria-label="${fc.day} forecast">
                <div>${fc.day}</div>
                <img src="https://openweathermap.org/img/wn/${fc.icon}.png" alt="${fc.description}">
                <div>${fc.temp}${currentUnit === 'metric' ? '°C' : '°F'}</div>
                <div>${fc.description}</div>
           </div>`).join('');
        forecastSection.style.display = '';
    } else {
        forecastSection.style.display = 'none';
    }
}

// Simulated UV index (OpenWeatherMap free does not provide)
function calculateUVIndex(weatherId) {
    if (weatherId >= 800 && weatherId <= 804) return Math.floor(Math.random() * 5) + 6;
    if (weatherId >= 500 && weatherId <= 531) return Math.floor(Math.random() * 3) + 2;
    if (weatherId >= 200 && weatherId <= 232) return Math.floor(Math.random() * 2) + 1;
    return Math.floor(Math.random() * 4) + 3;
}

function showLoading() {
    weatherCard.style.display = 'none';
    forecastSection.style.display = 'none';
    errorMessage.style.display = 'none';
    loading.style.display = 'block';
}
function showWeatherCard() {
    loading.style.display = 'none';
    errorMessage.style.display = 'none';
    weatherCard.style.display = 'block';
}
function showError(message) {
    loading.style.display = 'none';
    weatherCard.style.display = 'none';
    forecastSection.style.display = 'none';
    errorMessage.style.display = 'block';
    document.getElementById('errorText').textContent = message;
}

// Input handling, search, and autocomplete
let suggestionsIndex = -1;
cityInput.addEventListener('input', e => {
    showSuggestions(cityInput.value);
    suggestionsIndex = -1;
});
cityInput.addEventListener('focus', e => {
    showSuggestions(cityInput.value);
});
cityInput.addEventListener('blur', e => setTimeout(() => {
    suggestionsList.classList.remove('visible');
}, 100));
suggestionsList.addEventListener('mousedown', function(e){
    if (e.target.tagName === 'LI') {
        cityInput.value = e.target.textContent;
        suggestionsList.classList.remove('visible');
        getWeatherData(cityInput.value);
    }
});
cityInput.addEventListener('keydown', function(e){
    let options = Array.from(suggestionsList.querySelectorAll('li'));
    if (suggestionsList.classList.contains('visible')) {
        if (e.key === 'ArrowDown') {
            suggestionsIndex = (suggestionsIndex + 1) % options.length;
            setAriaSelected(suggestionsIndex);
        }
        if (e.key === 'ArrowUp') {
            suggestionsIndex = (suggestionsIndex - 1 + options.length) % options.length;
            setAriaSelected(suggestionsIndex);
        }
        if (e.key === 'Enter' && options[suggestionsIndex]) {
            cityInput.value = options[suggestionsIndex].textContent;
            suggestionsList.classList.remove('visible');
            getWeatherData(cityInput.value);
        }
    }
});
searchBtn.addEventListener('click', () => {
    getWeatherData(cityInput.value.trim());
});
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeatherData(cityInput.value.trim());
});
unitToggle.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggle.textContent = currentUnit === 'metric' ? '°C' : '°F';
    if (lastCity) {
        getWeatherData(lastCity);
    }
});

locationBtn.addEventListener('click', () => {
    requestLocation();
});
// On load: attempt auto-location
function requestLocation(force=false) {
    if (navigator.geolocation && (force || !locationGranted)) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                locationGranted = true;
                getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
            },
            err => {
                if (!force) getWeatherData('Kolkata');
            }
        );
    } else {
        getWeatherData('Kolkata');
    }
}

// Accessibility: set ARIA roles and labels

document.addEventListener('DOMContentLoaded', () => {
    requestLocation();
    updateDateTime();
    setInterval(updateDateTime, 60000);
});
