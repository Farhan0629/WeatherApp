class SkyCast {
    constructor() {
        this.apiKey = "34ce131779ea96b9def18f429f0f373a";
        this.currentUnit = 'metric'; // metric for Celsius, imperial for Fahrenheit
        this.initializeElements();
        this.bindEvents();
        this.updateDateTime();
        this.loadDefaultWeather();
        
        // Update date/time every minute
        setInterval(() => this.updateDateTime(), 60000);
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.unitToggle = document.getElementById('unitToggle');
        this.weatherCard = document.getElementById('weatherCard');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherAnimation = document.getElementById('weatherAnimation');
        
        // Weather data elements
        this.cityName = document.getElementById('cityName');
        this.country = document.getElementById('country');
        this.dateTime = document.getElementById('dateTime');
        this.temperature = document.getElementById('temperature');
        this.tempUnit = document.getElementById('tempUnit');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.weatherMain = document.getElementById('weatherMain');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.visibility = document.getElementById('visibility');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.feelsLike = document.getElementById('feelsLike');
        this.pressure = document.getElementById('pressure');
        this.uvIndex = document.getElementById('uvIndex');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.unitToggle.addEventListener('click', () => this.toggleUnit());
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) return;
        
        await this.getWeatherData(city);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.showError('Unable to retrieve your location');
            }
        );
    }

    async getWeatherData(city) {
        this.showLoading();
        
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.currentUnit}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`City not found: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayWeatherData(data);
            this.updateBackgroundAnimation(data.weather[0].main.toLowerCase());
        } catch (error) {
            this.showError(`Unable to fetch weather data: ${error.message}`);
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.currentUnit}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather data not found: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayWeatherData(data);
            this.updateBackgroundAnimation(data.weather[0].main.toLowerCase());
        } catch (error) {
            this.showError(`Unable to fetch weather data: ${error.message}`);
        }
    }

    displayWeatherData(data) {
        // Update location info
        this.cityName.textContent = data.name;
        this.country.textContent = data.sys.country;
        
        // Update temperature
        this.temperature.textContent = Math.round(data.main.temp);
        this.tempUnit.textContent = this.currentUnit === 'metric' ? '°C' : '°F';
        
        // Update weather icon
        this.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        this.weatherIcon.alt = data.weather[0].description;
        
        // Update weather description
        this.weatherMain.textContent = data.weather[0].main;
        this.weatherDescription.textContent = data.weather[0].description;
        
        // Update weather details
        this.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        this.humidity.textContent = `${data.main.humidity}%`;
        this.windSpeed.textContent = `${data.wind.speed.toFixed(1)} ${this.currentUnit === 'metric' ? 'm/s' : 'mph'}`;
        this.feelsLike.textContent = `${Math.round(data.main.feels_like)}${this.currentUnit === 'metric' ? '°C' : '°F'}`;
        this.pressure.textContent = `${data.main.pressure} hPa`;
        
        // UV Index (simulated - OpenWeatherMap free tier doesn't include UV)
        this.uvIndex.textContent = this.calculateUVIndex(data.weather[0].id);
        
        this.showWeatherCard();
    }

    calculateUVIndex(weatherId) {
        // Simple simulation based on weather conditions
        if (weatherId >= 800 && weatherId <= 804) return Math.floor(Math.random() * 5) + 6; // Clear/Clouds
        if (weatherId >= 500 && weatherId <= 531) return Math.floor(Math.random() * 3) + 2; // Rain
        if (weatherId >= 200 && weatherId <= 232) return Math.floor(Math.random() * 2) + 1; // Thunderstorm
        return Math.floor(Math.random() * 4) + 3; // Other conditions
    }

    updateBackgroundAnimation(weatherCondition) {
        // Remove existing weather classes
        this.weatherAnimation.className = 'weather-animation';
        
        // Add appropriate weather class
        const weatherClasses = {
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
        
        const weatherClass = weatherClasses[weatherCondition] || 'clear-sky';
        this.weatherAnimation.classList.add(weatherClass);
    }

    toggleUnit() {
        this.currentUnit = this.currentUnit === 'metric' ? 'imperial' : 'metric';
        this.unitToggle.textContent = this.currentUnit === 'metric' ? '°C' : '°F';
        
        // Refresh weather data with new units if we have a current city
        if (this.cityInput.value.trim()) {
            this.searchWeather();
        }
    }

    updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        this.dateTime.textContent = now.toLocaleDateString('en-US', options);
    }

    loadDefaultWeather() {
        // Load weather for user's location (Kolkata) as default
        this.getWeatherData('Kolkata');
    }

    showLoading() {
        this.weatherCard.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.loading.style.display = 'block';
    }

    showWeatherCard() {
        this.loading.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.weatherCard.style.display = 'block';
    }

    showError(message) {
        this.loading.style.display = 'none';
        this.weatherCard.style.display = 'none';
        this.errorMessage.style.display = 'block';
        document.getElementById('errorText').textContent = message;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SkyCast();
});
