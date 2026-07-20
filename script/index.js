const API_KEY = "a0864cf21f7cb1d0b83c66198182a4f5";

const weatherContainer = document.querySelector(".weather-container");
const locationError = document.querySelector(".location-error");

const searchInput = document.querySelector("#search-weather");
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

const next24hours = document.querySelector("#next24hours");
const dailyForecast = document.querySelector("#dailyForecast");
const hourlyPrevBtn = document.querySelector("#hourlyPrev");
const hourlyNextBtn = document.querySelector("#hourlyNext");
const dailyPrevBtn  = document.querySelector("#dailyPrev");
const dailyNextBtn  = document.querySelector("#dailyNext");

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

  prevBtn.addEventListener("click", () => { if (page > 0) { page--; update(); } });
  nextBtn.addEventListener("click", () => {
    const maxPage = Math.max(0, Math.ceil(total / CARDS_PER_PAGE) - 1);
    if (page < maxPage) { page++; update(); }
  });

  return {
    reset(count) { page = 0; total = count; update(); },
  };
}

const hourlyCarousel = makeCarousel(next24hours, hourlyPrevBtn, hourlyNextBtn);
const dailyCarousel  = makeCarousel(dailyForecast, dailyPrevBtn, dailyNextBtn);
const tempChart = document.querySelector("#tempChart");
const precipitationChartEl = document.querySelector("#precipitationChart");


/// AXIOS CREATING A WEATHER CLIENT 
const weatherApi = axios.create({
  baseURL: "https://api.openweathermap.org",
  timeout: 20000,
});


//FETCHING CURRENT CITY  WHEN INTAIL LOAD
async function getCurrentCity() {
  try {
    const response = await fetch("https://ipinfo.io/json");
    const data = await response.json();

    searchWeather(data.city);
  } catch (error) {
    console.error(error);
  }
}
window.addEventListener("DOMContentLoaded", () => {
  getCurrentCity();
});

///SEARCHING WEAHTE BASE ON CITY
async function searchWeather(city) {
  if (!city.trim()) return;
  try {
    const { data } = await weatherApi.get("/data/2.5/weather", {
      params: {
        q: city.trim(),
        appid: API_KEY,
        units: "metric",
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

/// UPDATING UI 
function updateWeatherUI(data) {
  const city = data.name;
  const country = regionNames.of(data.sys.country);
  countryEl.textContent = `${city}, ${country}`;

  tempEl.textContent = `${Math.round(data.main.temp)}°c`;

  const description = data.weather[0].description;
  weatherStatus.textContent =
    description.charAt(0).toUpperCase() + description.slice(1);
  weatherStatus.textContent = data.weather[0].description;
  feelslike.textContent = `Feels like ${Math.round(data.main.feels_like)}`;
  tempMax.textContent = `${Math.round(data.main.temp_max)}°`;
  tempMin.textContent = `${Math.round(data.main.temp_min)}°`;
  humidity.textContent = `${data.main.humidity}%`;
  const windSpeed = (data.wind.speed * 3.6).toFixed(1);

  wind.textContent = `${windSpeed} km/h`;

  const visibilityKm = (data.visibility / 1000).toFixed(1);
  visibility.textContent = `${visibilityKm} km`;

  pressure.textContent = `${data.main.pressure} hPa`;
  const dew = calculateDewPoint(data.main.temp, data.main.humidity);

  dewPoint.textContent = `${Math.round(dew)}°`;
  const lat = data.coord.lat;
  const lon = data.coord.lon;
  getUVIndex(lat, lon);
  getForecast(city);
}

async function getUVIndex(lat, lon) {
  try {
    const { data } = await weatherApi.get("/data/2.5/uvi", {
      params: { lat, lon, appid: API_KEY },
    });

    uvindex.textContent = data.value;
  } catch (error) {
    console.error(error);
  }
}

function calculateDewPoint(temp, humidity) {
  const a = 17.27;
  const b = 237.7;

  const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);

  return (b * alpha) / (a - alpha);
}

async function getForecast(city) {
  try {
    const { data } = await weatherApi.get("/data/2.5/forecast", {
      params: {
        q: city.trim(),
        appid: API_KEY,
        units: "metric",
      },
    });
    renderHourlyForecast(data.list.slice(0, 11));
        renderDailyForecast(data.list);

  } catch (error) {
    console.error(error);
  }
}

function renderHourlyForecast(hourlyData) {
  next24hours.innerHTML = "";

  hourlyData.forEach((hour, index) => {
    const time =
      index === 0
        ? "Now"
        : new Date(hour.dt * 1000).toLocaleTimeString([], {
            hour: "numeric",
            hour12: true,
          });

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



function renderDailyForecast(forecastList) {
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


searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchWeather(searchInput.value);
  }
});