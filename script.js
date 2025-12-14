// // ===== DOM ELEMENTS (same IDs as before) =====
// const cityInput = document.getElementById("cityInput");
// const useLocationBtn = document.getElementById("useLocationBtn");

// const locationLabel = document.getElementById("locationLabel");
// const timeLabel = document.getElementById("timeLabel");
// const tempLabel = document.getElementById("tempLabel");
// const conditionLabel = document.getElementById("conditionLabel");
// const feelsLikeLabel = document.getElementById("feelsLikeLabel");
// const updatedLabel = document.getElementById("updatedLabel");
// const humidityLabel = document.getElementById("humidityLabel");
// const windLabel = document.getElementById("windLabel");
// const rainLabel = document.getElementById("rainLabel");

// const pressureLabel = document.getElementById("pressureLabel");
// const visibilityLabel = document.getElementById("visibilityLabel");
// const uvLabel = document.getElementById("uvLabel");
// const dewLabel = document.getElementById("dewLabel");
// const sunriseLabel = document.getElementById("sunriseLabel");
// const sunsetLabel = document.getElementById("sunsetLabel");

// const hourlyContainer = document.getElementById("hourlyContainer");
// const dailyContainer = document.getElementById("dailyContainer");

// // ===== SIMPLE HELPERS =====
// function weatherCodeToText(code) {
//   // very small mapping - expand later if you want [web:57]
//   if (code === 0) return "Clear sky";
//   if (code === 1 || code === 2) return "Partly cloudy";
//   if (code === 3) return "Overcast";
//   if (code >= 45 && code <= 48) return "Foggy";
//   if (code >= 51 && code <= 67) return "Drizzle / Rain";
//   if (code >= 71 && code <= 77) return "Snow";
//   if (code >= 80 && code <= 82) return "Showers";
//   if (code >= 95) return "Thunderstorm";
//   return `Code ${code}`;
// }

// function formatDay(dateStr) {
//   return new Date(dateStr).toLocaleDateString([], { weekday: "short" });
// }

// function formatHour(dateStr) {
//   return new Date(dateStr).toLocaleTimeString([], { hour: "numeric" });
// }

// // ===== MAIN FETCH USING OPEN‑METEO =====
// // Docs: https://open-meteo.com/en/docs [web:57]
// async function loadWeatherOpenMeteo(lat, lon, labelText) {
//   const url =
//     `https://api.open-meteo.com/v1/forecast` +
//     `?latitude=${lat}` +
//     `&longitude=${lon}` +
//     `&current_weather=true` +
//     `&hourly=temperature_2m,relativehumidity_2m,precipitation_probability` +
//     `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
//     `&timezone=auto`;

//   try {
//     const res = await fetch(url);
//     const data = await res.json();

//     // ----- current -----
//     const cur = data.current_weather;
//     const now = new Date();

//     locationLabel.textContent =
//       labelText || `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
//     timeLabel.textContent = now.toLocaleString([], {
//       weekday: "long",
//       hour: "numeric",
//       minute: "2-digit",
//     });
//     tempLabel.textContent = `${Math.round(cur.temperature)}°`;
//     conditionLabel.textContent = weatherCodeToText(cur.weathercode);
//     feelsLikeLabel.textContent = `Wind ${Math.round(cur.windspeed)} km/h`;
//     updatedLabel.textContent = "Updated from Open‑Meteo";

//     // humidity & rain from first hourly slot
//     const hTemp = data.hourly.temperature_2m[0];
//     const hHum = data.hourly.relativehumidity_2m[0];
//     const hRainProb = data.hourly.precipitation_probability
//       ? data.hourly.precipitation_probability[0]
//       : 0;

//     humidityLabel.textContent = `${hHum}%`;
//     windLabel.textContent = `${Math.round(cur.windspeed)} km/h`;
//     rainLabel.textContent = `${hRainProb}%`;

//     // placeholders: Open‑Meteo does not give pressure/visibility/UV directly here. [web:57]
//     pressureLabel.textContent = "–";
//     visibilityLabel.textContent = "–";
//     uvLabel.textContent = "–";
//     dewLabel.textContent = "–";

//     // sunrise / sunset from first day
//     sunriseLabel.textContent = new Date(
//       data.daily.sunrise[0]
//     ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
//     sunsetLabel.textContent = new Date(
//       data.daily.sunset[0]
//     ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

//     // ----- hourly (next 6 entries) -----
//     hourlyContainer.innerHTML = "";
//     for (let i = 0; i < 6; i++) {
//       const hourTime = data.hourly.time[i];
//       const temp = Math.round(data.hourly.temperature_2m[i]);
//       const rainProb = data.hourly.precipitation_probability
//         ? data.hourly.precipitation_probability[i]
//         : 0;

//       const col = document.createElement("div");
//       col.className = "col";
//       col.innerHTML = `
//         <div class="hour-chip">
//           <div class="fw-semibold">${i === 0 ? "Now" : formatHour(hourTime)}</div>
//           <div>☀️</div>
//           <div>${temp}°</div>
//           <small class="text-muted">${rainProb}%</small>
//         </div>
//       `;
//       hourlyContainer.appendChild(col);
//     }

//     // ----- daily (up to 7 days) -----
//     dailyContainer.innerHTML = "";
//     data.daily.time.slice(0, 7).forEach((d, i) => {
//       const label = i === 0 ? "Today" : formatDay(d);
//       const max = Math.round(data.daily.temperature_2m_max[i]);
//       const min = Math.round(data.daily.temperature_2m_min[i]);
//       const code = data.daily.weathercode[i];

//       const row = document.createElement("div");
//       row.className =
//         "d-flex justify-content-between align-items-center py-2 border-bottom";
//       row.innerHTML = `
//         <div>${label}</div>
//         <div class="text-muted small">${weatherCodeToText(code)}</div>
//         <div>
//           <span class="fw-semibold">${max}°</span>
//           <span class="text-muted">${min}°</span>
//         </div>
//       `;
//       dailyContainer.appendChild(row);
//     });
//   } catch (err) {
//     alert("Error loading weather");
//     console.error(err);
//   }
// }

// // ===== CITY SEARCH (geocoding via Open‑Meteo helper) =====
// // Open‑Meteo has a free geocoding API so you can search by city name. [web:56][web:57]
// async function searchCityAndLoad(cityName) {
//   const url =
//     `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
//       cityName
//     )}&count=1`;
//   try {
//     const res = await fetch(url);
//     const data = await res.json();
//     if (!data.results || !data.results.length) {
//       alert("City not found");
//       return;
//     }
//     const place = data.results[0];
//     const label = `${place.name}, ${place.country}`;
//     await loadWeatherOpenMeteo(place.latitude, place.longitude, label);
//   } catch (e) {
//     alert("Error finding city");
//   }
// }

// // ===== EVENTS =====
// cityInput.addEventListener("keyup", (e) => {
//   if (e.key === "Enter" && cityInput.value.trim()) {
//     searchCityAndLoad(cityInput.value.trim());
//   }
// });

// useLocationBtn.addEventListener("click", () => {
//   if (!navigator.geolocation) {
//     alert("Geolocation not supported");
//     return;
//   }
//   navigator.geolocation.getCurrentPosition(
//     (pos) => {
//       const { latitude, longitude } = pos.coords;
//       loadWeatherOpenMeteo(latitude, longitude, "Your location");
//     },
//     () => alert("Unable to get location")
//   );
// });

// // initial default (e.g., New Delhi)
// loadWeatherOpenMeteo(28.61, 77.21, "New Delhi, IN");



const API_KEY  = "34c77e50b8e529c7847fe8bf18163669";  // only the key, no URL
const BASE_URL = "https://api.openweathermap.org/data/2.5";


const cityInput = document.getElementById("cityInput");
const useLocationBtn = document.getElementById("useLocationBtn");

const locationLabel = document.getElementById("locationLabel");
const timeLabel = document.getElementById("timeLabel");
const tempLabel = document.getElementById("tempLabel");
const conditionLabel = document.getElementById("conditionLabel");
const feelsLikeLabel = document.getElementById("feelsLikeLabel");
const updatedLabel = document.getElementById("updatedLabel");
const humidityLabel = document.getElementById("humidityLabel");
const windLabel = document.getElementById("windLabel");
const rainLabel = document.getElementById("rainLabel");

// detail labels
const pressureLabel = document.getElementById("pressureLabel");
const visibilityLabel = document.getElementById("visibilityLabel");
const uvLabel = document.getElementById("uvLabel");
const dewLabel = document.getElementById("dewLabel");
const sunriseLabel = document.getElementById("sunriseLabel");
const sunsetLabel = document.getElementById("sunsetLabel");


const hourlyContainer = document.getElementById("hourlyContainer");
const dailyContainer = document.getElementById("dailyContainer");

// ==== MAP (Leaflet + OpenWeather weather layers) ====
let map, baseMaps, overlayMaps;

function initMap() {
  map = L.map("map").setView([28.61, 77.21], 5);

  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  });

  osm.addTo(map);

  // Weather tile layers from OpenWeather (Weather Maps 1.0) [web:122][web:137]
  const precipitation = L.tileLayer(
    `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
    { opacity: 0.6, attribution: "© OpenWeather" }
  );

  const clouds = L.tileLayer(
    `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
    { opacity: 0.6, attribution: "© OpenWeather" }
  );

  const temperature = L.tileLayer(
    `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
    { opacity: 0.6, attribution: "© OpenWeather" }
  );

  baseMaps = { "OpenStreetMap": osm };
  overlayMaps = {
    "Precipitation": precipitation,
    "Clouds": clouds,
    "Temperature": temperature
  };

  // Default: show precipitation
  precipitation.addTo(map);

  // Layer control in top-right corner [web:137][web:138]
  L.control.layers(baseMaps, overlayMaps, {
    position: "topright",
    collapsed: false
  }).addTo(map);
}

initMap();


// ==== HELPERS ====
function formatTime(ts, timezoneOffset) {
  const date = new Date((ts + timezoneOffset) * 1000);
  const options = { weekday: "long", hour: "numeric", minute: "2-digit" };
  return date.toLocaleString(undefined, options);
}

function formatHour(ts, timezoneOffset) {
  const date = new Date((ts + timezoneOffset) * 1000);
  return date.toLocaleTimeString(undefined, { hour: "numeric" });
}

function formatDay(ts, timezoneOffset) {
  const date = new Date((ts + timezoneOffset) * 1000);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function kelvinToC(k) {
  return Math.round(k - 273.15);
}

function buildIcon(code) {
  if (code >= 200 && code < 600) return "🌧️";
  if (code >= 600 && code < 700) return "❄️";
  if (code >= 700 && code < 800) return "🌫️";
  if (code === 800) return "☀️";
  if (code > 800) return "☁️";
  return "☀️";
}

// ==== EXTRA DATA FROM OPEN-METEO (UV + DEW) ====
async function fetchExtras(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&hourly=dewpoint_2m,uv_index` +
    `&daily=uv_index_max` +
    `&timezone=auto`; // [web:36][web:57]

  try {
    const res = await fetch(url);
    const data = await res.json();

    const dewNow = data.hourly && data.hourly.dewpoint_2m
      ? Math.round(data.hourly.dewpoint_2m[0])
      : null;
    const uvNow = data.hourly && data.hourly.uv_index
      ? Math.round(data.hourly.uv_index[0])
      : null;
    const uvMax = data.daily && data.daily.uv_index_max
      ? Math.round(data.daily.uv_index_max[0])
      : null;

    dewLabel.textContent = dewNow != null ? `${dewNow}°` : "-";
    uvLabel.textContent =
      uvNow != null && uvMax != null ? `${uvNow} (max ${uvMax})`
      : uvNow != null ? `${uvNow}`
      : "-";
  } catch (e) {
    console.error("Extras error", e);
    dewLabel.textContent = "-";
    uvLabel.textContent = "-";
  }
}

// ==== MAIN FETCH USING FREE OPENWEATHER APIS ====
async function fetchWeatherByCity(city) {
  try {
    // current weather [web:31]
    const currentRes = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`
    );
    if (!currentRes.ok) throw new Error("City not found");
    const current = await currentRes.json();

    // move map to city
    if (map && current.coord) {
      map.setView([current.coord.lat, current.coord.lon], 8);
    }

    // forecast (5 day / 3 hour) [web:118]
    const forecastRes = await fetch(
      `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}`
    );
    if (!forecastRes.ok) throw new Error("Forecast request failed");
    const forecast = await forecastRes.json();

    updateCurrentUI(current);
    updateForecastUI(forecast);

    const { coord } = current;
    if (coord && coord.lat != null && coord.lon != null) {
      fetchExtras(coord.lat, coord.lon);
    } else {
      dewLabel.textContent = "-";
      uvLabel.textContent = "-";
    }
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}

// geolocation version
async function fetchWeatherByCoords(lat, lon) {
  try {
    const currentRes = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    if (!currentRes.ok) throw new Error("Unable to fetch location weather");
    const current = await currentRes.json();

    if (map) {
      map.setView([lat, lon], 8);
    }

    const forecastRes = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    if (!forecastRes.ok) throw new Error("Forecast request failed");
    const forecast = await forecastRes.json();

    updateCurrentUI(current);
    updateForecastUI(forecast);

    fetchExtras(lat, lon);
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}

// ==== UI UPDATE FUNCTIONS ====
function updateCurrentUI(data) {
  const tz = data.timezone;
  const main = data.main;
  const weather = data.weather[0];

  locationLabel.textContent = `${data.name}, ${data.sys.country}`;
  timeLabel.textContent = formatTime(data.dt, tz);
  tempLabel.textContent = `${kelvinToC(main.temp)}°`;
  conditionLabel.textContent = weather.description;
  feelsLikeLabel.textContent = `Feels like ${kelvinToC(main.feels_like)}°`;
  updatedLabel.textContent = "Updated just now";

  humidityLabel.textContent = `${main.humidity}%`;
  windLabel.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  rainLabel.textContent = data.rain ? "Yes" : "—";

  pressureLabel.textContent = `${main.pressure} hPa`;
  visibilityLabel.textContent = data.visibility
    ? `${(data.visibility / 1000).toFixed(1)} km`
    : "-";

  // uvLabel and dewLabel are set by fetchExtras(lat, lon)

  const sunrise = data.sys.sunrise;
  const sunset  = data.sys.sunset;
  sunriseLabel.textContent = new Date(sunrise * 1000).toLocaleTimeString(
    [],
    { hour: "numeric", minute: "2-digit" }
  );
  sunsetLabel.textContent = new Date(sunset * 1000).toLocaleTimeString(
    [],
    { hour: "numeric", minute: "2-digit" }
  );
}

function updateForecastUI(data) {
  const tz = data.city.timezone;

  // Hourly strip: next 6 entries
  hourlyContainer.innerHTML = "";
  data.list.slice(0, 6).forEach((item, index) => {
    const hour = index === 0 ? "Now" : formatHour(item.dt, tz);
    const temp = `${kelvinToC(item.main.temp)}°`;
    const rainChance = item.pop ? Math.round(item.pop * 100) + "%" : "0%";
    const icon = buildIcon(item.weather[0].id);

    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `
      <div class="hour-chip">
        <div class="fw-semibold">${hour}</div>
        <div>${icon}</div>
        <div>${temp}</div>
        <small class="text-muted">${rainChance}</small>
      </div>
    `;
    hourlyContainer.appendChild(col);
  });

  // 7‑day style forecast
  const daysMap = {};
  data.list.forEach((item) => {
    const day = formatDay(item.dt, tz);
    if (!daysMap[day]) {
      daysMap[day] = {
        temps: [],
        desc: item.weather[0].description,
      };
    }
    daysMap[day].temps.push(kelvinToC(item.main.temp));
  });

  const days = Object.entries(daysMap).slice(0, 7);
  dailyContainer.innerHTML = "";
  days.forEach(([day, info], index) => {
    const max = Math.max(...info.temps);
    const min = Math.min(...info.temps);
    const label = index === 0 ? "Today" : day;

    const row = document.createElement("div");
    row.className =
      "d-flex justify-content-between align-items-center py-2 border-bottom";
    row.innerHTML = `
      <div>${label}</div>
      <div class="text-muted small">${info.desc}</div>
      <div><span class="fw-semibold">${max}°</span>
           <span class="text-muted">${min}°</span></div>
    `;
    dailyContainer.appendChild(row);
  });
}

// ==== EVENTS ====

// Search on Enter
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && cityInput.value.trim()) {
    fetchWeatherByCity(cityInput.value.trim());
  }
});

// Use my location
useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => alert("Unable to get your location")
  );
});

// initial load
fetchWeatherByCity("San Francisco");




