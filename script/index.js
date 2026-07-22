// ============================================================
//  index.js  –  HB Weather Dashboard
// ============================================================

import { loadSettings } from "./settings.js";
import { searchWeather } from "./weather.js";

const searchInput = document.querySelector("#search-weather");

window.addEventListener("DOMContentLoaded", () => {
  loadSettings();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchWeather(searchInput.value);
  }
});