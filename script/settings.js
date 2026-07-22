// ============================================================
//  settings.js  –  HB Weather Dashboard
// ============================================================

import { getCurrentCity } from "./weather.js";
import { forecastData, renderHourlyForecast } from "./forecast.js";

export const SETTINGS_KEY = "hb_weather_settings";

const unitToggle = document.querySelector("#unitToggle");
const timeToggle = document.querySelector("#timeToggle");

const defaultSettings = {
  tempUnit: "C",
  timeFormat: "12h",
};

export let settings = { ...defaultSettings };

export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (stored) {
      settings = {
        ...defaultSettings,
        ...JSON.parse(stored),
      };
    } else {
      settings = { ...defaultSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    timeToggle.checked = settings.timeFormat === "24h";

    getCurrentCity();

    return settings;
  } catch (error) {
    console.error(error);
    return settings;
  }
}

unitToggle.addEventListener("change", () => {
  settings.tempUnit = settings.tempUnit === "C" ? "F" : "C";

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  getCurrentCity(); // Refresh weather with new unit
});

timeToggle.addEventListener("change", () => {
  settings.timeFormat = timeToggle.checked ? "24h" : "12h";

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  renderHourlyForecast(forecastData.slice(0, 11));
});

const resetBtns = document.querySelectorAll(".reset-settings-btn");
resetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Reset internal settings to defaults
    settings = { ...defaultSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    // Sync UI switches
    if (unitToggle) unitToggle.checked = settings.tempUnit === "F";
    if (timeToggle) timeToggle.checked = settings.timeFormat === "24h";

    // Reset Dark Mode
    const darkToggleBtn = document.getElementById("darkToggle");
    if (darkToggleBtn) {
      darkToggleBtn.checked = true; // default is dark mode
      document.documentElement.setAttribute("data-theme-mode", "dark");
      localStorage.setItem("theme", "dark");
    }

    // Refresh data displays
    getCurrentCity();
    if (forecastData && forecastData.length > 0) {
      renderHourlyForecast(forecastData.slice(0, 11));
    }
  });
});
