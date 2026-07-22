// ============================================================
//  forecast.js  –  HB Weather Dashboard
// ============================================================

import { settings } from "./settings.js";
import { weatherApi, API_KEY, getTemperatureUints } from "./weather.js";

const next24hours = document.querySelector("#next24hours");
const dailyForecast = document.querySelector("#dailyForecast");
const hourlyPrevBtn = document.querySelector("#hourlyPrev");
const hourlyNextBtn = document.querySelector("#hourlyNext");
const dailyPrevBtn = document.querySelector("#dailyPrev");
const dailyNextBtn = document.querySelector("#dailyNext");

export let forecastData = [];

export async function getForecast(city) {
  try {
    const { data } = await weatherApi.get("/data/2.5/forecast", {
      params: {
        q: city.trim(),
        appid: API_KEY,
        units: getTemperatureUints(),
      },
    });
    forecastData = data.list;
    renderHourlyForecast(forecastData.slice(0, 11));
    renderDailyForecast(forecastData);
  } catch (error) {
    console.error(error);
  }
}

export function formatTime(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: settings.timeFormat === "12h",
  });
}

export function formatHourlyLabel(timestamp, index) {
  if (index === 0) return "Now";

  const date = new Date(timestamp * 1000);
  const today = new Date();

  const isToday = date.toDateString() === today.toDateString();

  const time = formatTime(timestamp);

  return isToday ? time : `Tomorrow<br>${time}`;
}

export function renderHourlyForecast(hourlyData) {
  next24hours.innerHTML = "";

  hourlyData.forEach((hour, index) => {
    const time = formatHourlyLabel(hour.dt, index);
    const temp = Math.round(hour.main.temp);

    const icon = hour.weather[0].icon;

    next24hours.innerHTML += `
            <div class="card hourly-card">
                <div class="card-body d-flex flex-column align-items-center p-3 gap-2">

                    <span class="small text-muted">${time}</span>

                    <img
                        src="https://openweathermap.org/img/wn/${icon}@2x.png"
                        width="50"
                        height="50"
                         alt="${hour.weather[0].description}"
                    >

                    <span class="fw-semibold">${temp}°</span>

                  
                </div>
            </div>
        `;
  });

  hourlyCarousel.reset(hourlyData.length);
}

export function renderDailyForecast(forecastList) {
  dailyForecast.innerHTML = "";

  const dailyData = {};

  forecastList.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];

    if (!dailyData[date]) {
      dailyData[date] = {
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        icon: item.weather[0].icon,
        pop: item.pop,
      };
    } else {
      dailyData[date].tempMin = Math.min(
        dailyData[date].tempMin,
        item.main.temp_min,
      );

      dailyData[date].tempMax = Math.max(
        dailyData[date].tempMax,
        item.main.temp_max,
      );

      if (item.pop > dailyData[date].pop) {
        dailyData[date].pop = item.pop;
        dailyData[date].icon = item.weather[0].icon;
      }
    }
  });

  Object.entries(dailyData)
    .slice(0, 10)
    .forEach(([date, day], index) => {
      const dayName =
        index === 0
          ? "Today"
          : new Date(date).toLocaleDateString("en-US", {
              weekday: "short",
            });

      dailyForecast.innerHTML += `
            <div class="card hourly-card">
                <div class="card-body d-flex flex-column align-items-center p-3 gap-2">

                    <span class="small text-muted">${dayName}</span>

                    <img
                        src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
                        width="50"
                        height="50"
                        alt=""
                    >

                    <span class="fw-semibold">${Math.round(day.tempMax)}°</span>


                </div>
            </div>
        `;
    });

  dailyCarousel.reset(Object.keys(dailyData).slice(0, 10).length);
}

// ── Carousel helpers ───────────────────────────────────────
const CARDS_PER_PAGE = 4;
const CARD_WIDTH = 88 + 12; // min-width + gap (0.75rem ≈ 12px)

function makeCarousel(strip, prevBtn, nextBtn) {
  let page = 0;
  let total = 0;

  function update() {
    const maxPage = Math.max(0, Math.ceil(total / CARDS_PER_PAGE) - 1);
    strip.style.transform = `translateX(-${page * CARDS_PER_PAGE * CARD_WIDTH}px)`;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= maxPage;
  }

  prevBtn.addEventListener("click", () => {
    if (page > 0) {
      page--;
      update();
    }
  });
  nextBtn.addEventListener("click", () => {
    const maxPage = Math.max(0, Math.ceil(total / CARDS_PER_PAGE) - 1);
    if (page < maxPage) {
      page++;
      update();
    }
  });

  return {
    reset(count) {
      page = 0;
      total = count;
      update();
    },
  };
}

const hourlyCarousel = makeCarousel(next24hours, hourlyPrevBtn, hourlyNextBtn);
const dailyCarousel = makeCarousel(dailyForecast, dailyPrevBtn, dailyNextBtn);
