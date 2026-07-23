// ============================================================
//  weather.js  –  HB Weather Dashboard
// ============================================================

import { settings } from "./settings.js";
import { getForecast } from "./forecast.js";

export const API_KEY = "a0864cf21f7cb1d0b83c66198182a4f5";

const countryEl = document.querySelector("#country");
const tempEl = document.querySelector(".temp-display");
const feelslike = document.querySelector(".feels-like");
const weatherStatus = document.querySelector("#weather-status");
const tempMax = document.querySelector("#temp-max");
const tempMin = document.querySelector("#temp-min");
const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");
const uvindex = document.querySelector("#uv-index");
const visibility = document.querySelector("#visibility");
const pressure = document.querySelector("#pressure");
const dewPoint = document.querySelector("#dew-point");

/// AXIOS CREATING A WEATHER CLIENT
export const weatherApi = axios.create({
  baseURL: "https://api.openweathermap.org",
  timeout: 20000,
});

//FETCHING CURRENT CITY  WHEN INTAIL LOAD
export async function getCurrentCity() {
  try {
    const response = await fetch("https://ipinfo.io/json");
    const data = await response.json();
    searchWeather(data.city);
  } catch (error) {
    console.error(error);
  }
}

export function getTemperatureUints() {
  return settings.tempUnit === "C" ? "metric" : "imperial";
}

///SEARCHING WEAHTE BASE ON CITY
export async function searchWeather(city) {
  if (!city.trim()) return;
  try {
    const { data } = await weatherApi.get("/data/2.5/weather", {
      params: {
        q: city.trim(),
        appid: API_KEY,
        units: getTemperatureUints(),
      },
    });

    updateWeatherUI(data);
  } catch (error) {
    console.error("Failed to fetch weather:", error);

    if (error.response?.status === 404) {
      alert("City not found.");
    } else {
      alert("Something went wrong. Please try again.");
    }
  }
}

const regionNames = new Intl.DisplayNames(["en"], {
  type: "region",
});

export function getTemperatureSymbol() {
  return settings.tempUnit === "C" ? "°C" : "°F";
}

/// UPDATING UI
export function updateWeatherUI(data) {
  const city = data.name;
  const unit = getTemperatureSymbol();

  const country = regionNames.of(data.sys.country);
  countryEl.textContent = `${city}, ${country}`;

  tempEl.textContent = `${Math.round(data.main.temp)}${unit}`;

  const description = data.weather[0].description;
  weatherStatus.textContent =
    description.charAt(0).toUpperCase() + description.slice(1);
  weatherStatus.textContent = data.weather[0].description;
  feelslike.textContent = `Feels like ${Math.round(data.main.feels_like)}${unit}`;
  tempMax.textContent = `${Math.round(data.main.temp_max)}${unit}`;
  tempMin.textContent = `${Math.round(data.main.temp_min)}${unit}`;
  humidity.textContent = `${data.main.humidity}%`;
  const windSpeed = (data.wind.speed * 3.6).toFixed(1);

  wind.textContent = `${windSpeed} km/h`;

  const visibilityKm = (data.visibility / 1000).toFixed(1);
  visibility.textContent = `${visibilityKm} km`;

  pressure.textContent = `${data.main.pressure} hPa`;
  const dew = calculateDewPoint(data.main.temp, data.main.humidity);

  dewPoint.textContent = `${Math.round(dew)}${unit}`;

  const lat = data.coord.lat;
  const lon = data.coord.lon;
  getUVIndex(lat, lon);
  getForecast(city);
}

export async function getUVIndex(lat, lon) {
  try {
    const { data } = await weatherApi.get("/data/2.5/uvi", {
      params: { lat, lon, appid: API_KEY },
    });

    uvindex.textContent = data.value;
  } catch (error) {
    console.error(error);
  }
}

export function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;

  const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);

  return (b * alpha) / (a - alpha);
}
