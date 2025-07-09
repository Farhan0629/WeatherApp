// 🌤 Lottie Animation Setup
let animationInstance = null;

function loadWeatherAnimation(condition) {
  const container = document.getElementById("weatherAnimation");
  container.innerHTML = ""; // Clear previous animation

  let animationURL = "";

  const cond = condition.toLowerCase().trim();

  if (cond.includes("thunder")) {
    animationURL = "https://assets4.lottiefiles.com/packages/lf20_qmfs6jxh.json"; // Thunder
  } else if (cond.includes("rain") || cond.includes("drizzle")) {
    animationURL = "https://assets2.lottiefiles.com/packages/lf20_jmBauI.json"; // Rain
  } else if (cond.includes("snow")) {
    animationURL = "https://assets10.lottiefiles.com/packages/lf20_hwbhwrqv.json"; // Snow
  } else if (cond.includes("clear")) {
    animationURL = "https://assets4.lottiefiles.com/packages/lf20_ukkmrvep.json"; // Sunny
  } else if (cond.includes("cloud")) {
    animationURL = "https://assets4.lottiefiles.com/packages/lf20_jmBauI.json"; // Cloudy
  } else if (cond.includes("fog") || cond.includes("mist") || cond.includes("haze")) {
    animationURL = "https://assets2.lottiefiles.com/packages/lf20_cg3qvksb.json"; // Fog/Mist/Haze
  } else {
    animationURL = "https://assets4.lottiefiles.com/packages/lf20_jmBauI.json"; // Default to cloudy
  }

  if (animationURL) {
    animationInstance = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: animationURL
    });
  }
}

// 🌍 Weather API Setup
const apiKey = "34ce131779ea96b9def18f429f0f373a";
let currentUnit = "metric";
let currentCity = "";

// 🔐 Sign-In Validation
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

// 🌦 Get Weather Info
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
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
      // Use description for more accurate matching
      const condition = data.weather[0].description.toLowerCase();
      console.log("Weather condition:", condition); // for debugging

      updateBackground(condition);              // ✅ Background
      loadWeatherAnimation(condition);          // ✅ Lottie animation

      const tempUnit = currentUnit === "metric" ? "°C" : "°F";
      const weatherHtml = `
        <p><strong>City:</strong> ${data.name}</p>
        <p><strong>Temperature:</strong> ${data.main.temp} ${tempUnit}</p>
        <p><strong>Weather:</strong> ${capitalize(data.weather[0].description)}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} ${currentUnit === "metric" ? "m/s" : "mph"}</p>
      `;
      resultDiv.innerHTML = weatherHtml;
    })
    .catch(error => {
      resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

// 🔁 Toggle Celsius / Fahrenheit
function toggleUnit() {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  const unitLabel = document.querySelector(".unit-label");
  unitLabel.textContent = currentUnit === "metric" ? "Celsius" : "Fahrenheit";
  if (currentCity) {
    getWeather();
  }
}

// 🎨 Background Visuals
function updateBackground(condition) {
  const body = document.body;
  body.className = ""; // Remove all previous classes

  if (condition.includes("cloud")) {
    body.classList.add("cloudy");
  } else if (condition.includes("rain") || condition.includes("drizzle")) {
    body.classList.add("rainy");
  } else if (condition.includes("snow")) {
    body.classList.add("snowy");
  } else if (condition.includes("clear")) {
    body.classList.add("sunny");
  } else if (condition.includes("fog") || condition.includes("mist") || condition.includes("haze")) {
    body.classList.add("foggy");
  } else {
    // default/fallback background
    body.style.background = "linear-gradient(to top right, #ccefff, #e6f7ff)";
  }
}

// 🔠 Capitalize Weather Description
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


