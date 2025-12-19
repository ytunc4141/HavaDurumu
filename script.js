const API_KEY = '';

const form = document.getElementById('location-form');
const input = document.getElementById('location-input');
const currentWeatherEl = document.getElementById('current-weather');
const currentContentEl = document.getElementById('current-content');
const forecastGrid = document.getElementById('forecast-grid');
const lastUpdatedEl = document.getElementById('last-updated');
const toastEl = document.getElementById('toast');
const submitButton = document.querySelector('#location-form button');
const langToggle = document.getElementById('lang-toggle');
const themeToggle = document.getElementById('theme-toggle');
const sceneEl = document.getElementById('weather-scene');
let lottieContainer = document.getElementById('lottie-container');
const sliderEl = document.getElementById('weather-slider');

const STORAGE_KEYS = {
  lang: 'weather-lang',
  theme: 'weather-theme',
};

const translations = {
  en: {
    eyebrow: "Weather at a glance",
    title: "",
    lede: "Daily and weekly weather forecasts in one place.",
    inputPlaceholder: "e.g., Istanbul, London, New York",
    buttonLabel: "Get weather",
    currentTitle: "Current weather",
    forecastTitle: "7-day forecast",
    currentPlaceholder: "Enter a location to see the latest weather.",
    forecastPlaceholder: "Forecast will appear here after you search.",
    toastMissingKey: "Add your OpenWeather API key in script.js first.",
    toastEnterCity: "Please type a city.",
    geocodeFail: "Geocoding failed",
    notFound: "Location not found. Try another city.",
    currentFail: "Current weather failed",
    forecastFail: "Forecast lookup failed",
    updated: "Updated just now for {city}",
    temperature: "Temperature",
    feelsLike: "Feels like {value}",
    condition: "Condition",
    humidity: "Humidity",
    wind: "Wind",
    precipitation: "Precipitation chance",
    forecastMeta: "{description} | {pop}% rain",
    windUnit: "km/h",
    dash: "—",
  },
  tr: {
    eyebrow: "Hava durumu özeti",
    title: "",
    lede: "Günlük ve haftalık hava tahminlerini burada gör.",
    inputPlaceholder: "örn. İstanbul, Londra, New York",
    buttonLabel: "Hava durumunu getir",
    currentTitle: "Güncel hava",
    forecastTitle: "7 günlük tahmin",
    currentPlaceholder: "Güncel hava durumunu görmek için bir konum girin.",
    forecastPlaceholder: "Arama yaptıktan sonra tahmin burada görünecek.",
    toastMissingKey: "Önce script.js dosyasına OpenWeather API anahtarını ekleyin.",
    toastEnterCity: "Lütfen bir şehir yazın.",
    geocodeFail: "Konum arama başarısız",
    notFound: "Konum bulunamadı. Başka bir şehir deneyin.",
    currentFail: "Güncel hava alınamadı",
    forecastFail: "Tahmin alınamadı",
    updated: "{city} için az önce güncellendi",
    temperature: "Sıcaklık",
    feelsLike: "Hissedilen {value}",
    condition: "Durum",
    humidity: "Nem",
    wind: "Rüzgar",
    precipitation: "Yağış olasılığı",
    forecastMeta: "{description} | %{pop} yağış",
    windUnit: "km/sa",
    dash: "—",
  },
};

const weatherDictionary = {
  clear: "Açık",
  clouds: "Bulutlu",
  rain: "Yağmurlu",
  drizzle: "Çiseleyen",
  thunderstorm: "Gök gürültülü",
  snow: "KarlI",
  mist: "Puslu",
  fog: "Sisli",
};

const sliderCities = ["Istanbul", "Ankara", "Izmir", "Kocaeli"];
const sliderCache = {};
const SLIDER_CACHE_TTL = 10 * 60 * 1000;
let sliderIndex = 0;
let sliderTimer = null;
let sliderActive = true;

const sliderIcons = {
  clear: "☀️",
  clouds: "☁️",
  rain: "🌧️",
  drizzle: "🌦️",
  thunderstorm: "⛈️",
  snow: "❄️",
  mist: "🌫️",
  fog: "🌫️",
  default: "🌤️",
};

let currentLang = loadPreference(STORAGE_KEYS.lang, "en");
let currentTheme = loadPreference(STORAGE_KEYS.theme, "dark");
let lastCurrent = null;
let lastForecast = null;
let lastLocationName = "";
let lastCondition = null;

init();


function init() {
  document.documentElement.lang = currentLang;
  applyTheme(currentTheme);
  applyLanguage(currentLang);

  updateThemeToggleLabel();

  form.addEventListener("submit", handleSubmit);
  submitButton?.addEventListener("click", handleSubmit);

  langToggle?.addEventListener("click", () => {
    const next = currentLang === "en" ? "tr" : "en";
    applyLanguage(next);
  });

  themeToggle?.addEventListener("click", () => {
    const next = currentTheme === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  startWeatherSlider();
}


function handleSubmit(event) {
  if (event) event.preventDefault();
  stopWeatherSlider();

  const query = input.value.trim();
  if (!query) {
    showToast(t("toastEnterCity"));
    return;
  }
  fetchWeather(query);
}


async function fetchWeather(query) {
  setCurrentPlaceholder(t("currentPlaceholder"));
  setForecastPlaceholder(t("forecastPlaceholder"));

  try {
    const location = await geocodeLocation(query);
    const current = await getCurrentWeather(location.lat, location.lon);
    const forecast = await getForecastWeather(location.lat, location.lon);

    lastCurrent = current;
    lastForecast = forecast;
    lastLocationName = location.name;
    lastCondition = current.weather?.[0]?.main || "";

    updateWeatherScene(lastCondition);
    renderCurrent(current, location.name);
    renderForecast(forecast);

    lastUpdatedEl.textContent = formatString(t("updated"), { city: location.name });
  } catch (error) {
    console.error(error);
    showToast(error.message);
  }
}

async function geocodeLocation(query) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=1&appid=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.length) throw new Error(t("notFound"));

  const p = data[0];
  return {
    name: `${p.name}${p.state ? ", " + p.state : ""}, ${p.country}`,
    lat: p.lat,
    lon: p.lon,
  };
}

async function getCurrentWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(t("currentFail"));
  return res.json();
}

async function getForecastWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(t("forecastFail"));
  const data = await res.json();
  return summarizeForecast(data.list);
}


function updateWeatherScene(condition) {
    const c = (condition || "").toLowerCase();

    if (c.includes("rain") || c.includes("drizzle")) {
        sceneEl.style.background = "rgba(0,0,0,0.15)";
    } 
    else if (c.includes("snow")) {
        sceneEl.style.background = "rgba(255,255,255,0.08)";
    } 
    else if (c.includes("cloud")) {
        sceneEl.style.background = "rgba(200,200,200,0.05)";
    } 
    else if (c.includes("thunder")) {
        sceneEl.style.background = "rgba(255,255,0,0.05)";
    } 
    else if (c.includes("fog") || c.includes("mist") || c.includes("haze")) {
        sceneEl.style.background = "rgba(180,180,180,0.05)";
    } 
    else {
        sceneEl.style.background = "transparent";
    }
}



function renderCurrent(data, name) {
  const description = translateWeather(
    data.weather?.[0]?.description,
    data.weather?.[0]?.main
  );

  const windKmh = Math.round((data.wind?.speed || 0) * 3.6);

  currentContentEl.innerHTML = `
    <div class="current-grid">
      <div class="metric">
        <div class="label">${t("temperature")}</div>
        <div class="value">${Math.round(data.main.temp)}°C</div>
        <div class="meta muted">${formatString(t("feelsLike"), {
          value: Math.round(data.main.feels_like),
        })}°C</div>
      </div>

      <div class="metric">
        <div class="label">${t("condition")}</div>
        <div class="value">${description}</div>
      </div>

      <div class="metric">
        <div class="label">${t("humidity")}</div>
        <div class="value">${data.main.humidity}%</div>
      </div>

      <div class="metric">
        <div class="label">${t("wind")}</div>
        <div class="value">${windKmh} ${t("windUnit")}</div>
      </div>

      <div class="metric">
        <div class="label">${t("precipitation")}</div>
        <div class="value">${getPrecipChance()}</div>
      </div>
    </div>
  `;

  const headerSpan = currentWeatherEl.querySelector(".section-header .muted");
  if (headerSpan) headerSpan.textContent = name;

  lottieContainer = document.getElementById("lottie-container");
}

function renderForecast(days) {
  if (!days.length) {
    setForecastPlaceholder(t("forecastPlaceholder"));
    return;
  }

  const start = days.length > 1 ? 1 : 0;
  const list = days.slice(start, start + 7);

  forecastGrid.innerHTML = list
    .map((day) => {
      const desc = translateWeather(day.description, day.description);
      const meta = formatString(t("forecastMeta"), {
        description: desc,
        pop: day.pop,
      });
      return `
        <div class="forecast-day">
          <div class="name">${day.name}</div>
          <div class="temp">${day.max}° / ${day.min}°C</div>
          <div class="meta">${meta}</div>
        </div>
      `;
    })
    .join("");
}


function startWeatherSlider() {
  if (!API_KEY) return;

  sliderActive = true;
  sliderEl.classList.remove("slider-hidden");
  currentContentEl.classList.add("slider-hidden");

  sliderIndex = 0;
  renderSliderCity();

  sliderTimer = setInterval(() => {
    if (!sliderActive) return;
    sliderIndex = (sliderIndex + 1) % sliderCities.length;
    renderSliderCity();
  }, 4500);
}

function stopWeatherSlider() {
  sliderActive = false;
  if (sliderTimer)
    clearInterval(sliderTimer);
  sliderEl.classList.add("slider-hidden");
  currentContentEl.classList.remove("slider-hidden");
}

async function renderSliderCity() {
  if (!sliderActive) return;
  const city = sliderCities[sliderIndex];

  try {
    const data = await getSliderWeather(city);
    const iconKey = (data.main || "").toLowerCase();
    const icon = sliderIcons[iconKey] || sliderIcons.default;

    updateWeatherScene(data.main);

    sliderEl.innerHTML = `
      <div class="slider-card">
        <div class="slider-top">
          <span class="slider-city">${data.name}</span>
          <span class="slider-icon">${icon}</span>
        </div>
        <div class="slider-temp">${Math.round(data.temp)}°C</div>
        <div class="slider-meta">${translateWeather(data.description, data.main)}</div>
      </div>
    `;
  } catch (err) {
    console.warn("slider error:", err);
  }
}

async function getSliderWeather(city) {
  const key = city.toLowerCase();
  const cached = sliderCache[key];

  if (cached && Date.now() - cached.ts < SLIDER_CACHE_TTL)
    return cached.data;

  const loc = await geocodeLocation(city);
  const current = await getCurrentWeather(loc.lat, loc.lon);

  const data = {
    name: loc.name,
    temp: current.main?.temp,
    main: current.weather?.[0]?.main,
    description: current.weather?.[0]?.description,
  };

  sliderCache[key] = { data, ts: Date.now() };
  return data;
}


function summarizeForecast(list) {
  const map = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toISOString().slice(0, 10);

    const temp = item.main.temp;
    const pop = item.pop ?? 0;
    const desc = item.weather?.[0]?.main;

    if (!map[key]) {
      map[key] = {
        max: temp,
        min: temp,
        popSum: pop,
        popCount: 1,
        description: desc,
        date,
      };
    } else {
      map[key].max = Math.max(map[key].max, temp);
      map[key].min = Math.min(map[key].min, temp);
      map[key].popSum += pop;
      map[key].popCount += 1;
    }
  });

  return Object.values(map)
    .sort((a, b) => a.date - b.date)
    .map((d) => ({
      name: d.date.toLocaleDateString(getLocale(), { weekday: "long" }),
      max: Math.round(d.max),
      min: Math.round(d.min),
      pop: Math.round((d.popSum / d.popCount) * 100),
      description: d.description,
    }));
}

function translateWeather(text, main) {
  if (currentLang !== "tr") return text || main || "";

  const key = (main || "").toLowerCase();
  return weatherDictionary[key] || text || main || "";
}

function getPrecipChance() {
  if (!lastForecast?.length) return t("dash");
  const pop = lastForecast[0].pop;
  return typeof pop === "number" ? `${pop}%` : t("dash");
}

function setCurrentPlaceholder(msg) {
  currentContentEl.innerHTML = `
    <div class="content-placeholder">${msg}</div>
  `;
  lottieContainer = document.getElementById("lottie-container");
}

function setForecastPlaceholder(msg) {
  forecastGrid.innerHTML = `<div class="content-placeholder">${msg}</div>`;
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEYS.lang, lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });

  langToggle.textContent = lang.toUpperCase();
  renderIfExists();

  updateThemeToggleLabel();
}

function renderIfExists() {
  if (lastCurrent && lastForecast) {
    renderCurrent(lastCurrent, lastLocationName);
    renderForecast(lastForecast);
    lastUpdatedEl.textContent = formatString(t("updated"), {
      city: lastLocationName,
    });
  }
}

function applyTheme(theme) {
    currentTheme = theme;
    document.body.classList.toggle("theme-light", theme === "light");
    localStorage.setItem(STORAGE_KEYS.theme, theme);

    updateThemeToggleLabel();
}


function updateThemeToggleLabel() {
    if (currentLang === "tr") {
        themeToggle.textContent = currentTheme === "dark" ? "Koyu" : "Açık";
    } else {
        themeToggle.textContent = currentTheme === "dark" ? "Dark" : "Light";
    }
}


function t(key) {
  return translations[currentLang]?.[key] ?? key;
}

function loadPreference(key, fallback) {
  return localStorage.getItem(key) || fallback;
}

function getLocale() {
  return currentLang === "tr" ? "tr-TR" : undefined;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2500);
}

function formatString(str, values) {
    return str.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

