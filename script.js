const apiKey = "34ce131779ea96b9def18f429f0f373a";
let currentUnit = "metric";
let currentCity = "";

// Sign in validation
function signIn() {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;

  if (email.endsWith("@gmail.com") && pass.length >= 4) {
    document.getElementById("signinContainer").style.display = "none";
    document.getElementById("weatherContainer").style.display = "block";
  } else {
    alert("Please enter a valid Gmail ID and a password with at least 4 characters.");
  }
}

// Get weather by city name
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultDiv = document.getElementById("weatherResult");
  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  currentCity = city;
  const unitLabel = document.querySelector(".unit-label");
  unitLabel.textContent = currentUnit === "metric" ? "Celsius" : "Fahrenheit";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${currentUnit}`;

  resultDiv.innerHTML = "<p>Loading...</p>";

  fetch(url)
    .then(async response => {
      if (!response.ok) {
        let errorMsg = "City not found";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message.charAt(0).toUpperCase() + errorData.message.slice(1);
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }
      return response.json();
    })
    .then(data => {
      const sunrise = data.sys.sunrise;
      const sunset = data.sys.sunset;
      const currentTime = data.dt;
      updateBackground(data.weather[0].main.toLowerCase(), sunrise, sunset, currentTime);

      const tempUnit = currentUnit === "metric" ? "°C" : "°F";
      const windUnit = currentUnit === "metric" ? "m/s" : "mph";
      const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      const weatherHtml = `
        <img class="weather-icon" src="${iconUrl}" alt="${data.weather[0].description}">
        <p><strong>City:</strong> ${data.name}</p>
        <p><strong>Temperature:</strong> ${Math.round(data.main.temp)} ${tempUnit}</p>
        <p><strong>Weather:</strong> ${capitalize(data.weather[0].description)}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
        <p><strong>Visibility:</strong> ${data.visibility / 1000} km</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} ${windUnit}</p>
        <p><strong>Sunrise:</strong> ${sunriseTime}</p>
        <p><strong>Sunset:</strong> ${sunsetTime}</p>
      `;
      resultDiv.innerHTML = weatherHtml;
    })
    .catch(error => {
      if (error.message === "Failed to fetch") {
        resultDiv.innerHTML = `<p>Error: Network error. Please check your internet connection.</p>`;
      } else {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
      }
    });
}

// Get weather by geolocation
function getLocationWeather() {
  const resultDiv = document.getElementById("weatherResult");
  if (!navigator.geolocation) {
    resultDiv.innerHTML = "<p>Geolocation is not supported by your browser.</p>";
    return;
  }
  resultDiv.innerHTML = "<p>Getting your location...</p>";
  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const unitLabel = document.querySelector(".unit-label");
      unitLabel.textContent = currentUnit === "metric" ? "Celsius" : "Fahrenheit";
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
      fetch(url)
        .then(async response => {
          if (!response.ok) {
            let errorMsg = "Location not found";
            try {
              const errorData = await response.json();
              if (errorData && errorData.message) {
                errorMsg = errorData.message.charAt(0).toUpperCase() + errorData.message.slice(1);
              }
            } catch (e) {}
            throw new Error(errorMsg);
          }
          return response.json();
        })
        .then(data => {
          currentCity = data.name;
          const sunrise = data.sys.sunrise;
          const sunset = data.sys.sunset;
          const currentTime = data.dt;
          updateBackground(data.weather[0].main.toLowerCase(), sunrise, sunset, currentTime);

          const tempUnit = currentUnit === "metric" ? "°C" : "°F";
          const windUnit = currentUnit === "metric" ? "m/s" : "mph";
          const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
          const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
          const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
          const weatherHtml = `
            <img class="weather-icon" src="${iconUrl}" alt="${data.weather[0].description}">
            <p><strong>City:</strong> ${data.name}</p>
            <p><strong>Temperature:</strong> ${Math.round(data.main.temp)} ${tempUnit}</p>
            <p><strong>Weather:</strong> ${capitalize(data.weather[0].description)}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
            <p><strong>Visibility:</strong> ${data.visibility / 1000} km</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} ${windUnit}</p>
            <p><strong>Sunrise:</strong> ${sunriseTime}</p>
            <p><strong>Sunset:</strong> ${sunsetTime}</p>
          `;
          resultDiv.innerHTML = weatherHtml;
        })
        .catch(error => {
          resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        });
    },
    error => {
      resultDiv.innerHTML = "<p>Unable to retrieve your location.</p>";
    }
  );
}

// Toggle units
function toggleUnit() {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  const unitLabel = document.querySelector(".unit-label");
  unitLabel.textContent = currentUnit === "metric" ? "Celsius" : "Fahrenheit";
  if (currentCity) {
    getWeather();
  }
}

// Background update with night mode
function updateBackground(condition, sunrise, sunset, currentTime) {
  const body = document.body;
  body.className = "";

  // Night detection
  if (currentTime && sunrise && sunset) {
    if (currentTime < sunrise || currentTime > sunset) {
      body.classList.add("night");
    }
  }

  if (condition.includes("cloud")) {
    body.classList.add("cloudy");
  } else if (condition.includes("rain")) {
    body.classList.add("rainy");
  } else if (condition.includes("snow")) {
    body.classList.add("snowy");
  } else if (condition.includes("sun") || condition.includes("clear")) {
    body.classList.add("sunny");
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


