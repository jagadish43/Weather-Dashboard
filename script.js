const API_KEY = "15ab83f24236a0e96486ad0916a0c34d";
const cityInput = document.getElementById("cityInput");
const addCityBtn = document.getElementById("addCity");
const cityList = document.getElementById("cityList");
const currentWeather = document.getElementById("currentWeather");

let cities = JSON.parse(localStorage.getItem("cities")) || [];

async function getWeather(city) {
  const res = await fetch(`https://api.weatherstack.com/current?access_key=${API_KEY}&query=${encodeURIComponent(city)}`);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.info);
  }

  return {
    name: data.location.name,
    temperature: data.current.temperature,
    description: data.current.weather_descriptions[0],
    icon: data.current.weather_icons[0],
    humidity: data.current.humidity,
    wind: data.current.wind_speed,
  };
}

async function showWeather(city) {
  try {
    const data = await getWeather(city);
    currentWeather.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.icon}" alt="${data.description}" />
      <p>${data.description}</p>
      <p>🌡️ ${data.temperature}°C | 💧 ${data.humidity}%</p>
      <p>🌬️ ${data.wind} m/s</p>
    `;
    currentWeather.classList.add("active");
  } catch (err) {
    alert(err.message);
  }
}

async function renderCities() {
  cityList.innerHTML = "";
  for (const city of cities) {
    try {
      const data = await getWeather(city);
      const card = document.createElement("div");
      card.className = "city-card";
      card.innerHTML = `
        <div>
          <h4>${data.name}</h4>
          <small>${data.description}, ${data.temperature}°C</small>
        </div>
        <button onclick="removeCity('${city}')">✖</button>
      `;
      card.addEventListener("click", () => showWeather(city));
      cityList.appendChild(card);
    } catch (err) {
      console.error(err.message);
    }
  }
}

addCityBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return;

  if (cities.includes(city)) {
    alert("City already added!");
    return;
  }

  try {
    await getWeather(city); 
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
    renderCities();
    showWeather(city);
    cityInput.value = "";
  } catch (err) {
    alert(err.message);
  }
});

function removeCity(city) {
  cities = cities.filter(c => c !== city);
  localStorage.setItem("cities", JSON.stringify(cities));
  renderCities();
  if (cities.length === 0) currentWeather.classList.remove("active");
}

function loadCurrentLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    renderCities();
    if (cities.length > 0) showWeather(cities[0]);
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`https://api.weatherstack.com/current?access_key=${API_KEY}&query=${latitude},${longitude}`);
      const data = await res.json();
      if (!cities.includes(data.location.name)) {
        cities.unshift(data.location.name);
        localStorage.setItem("cities", JSON.stringify(cities));
      }
      renderCities();
      showWeather(data.location.name);
    } catch (err) {
      console.error(err.message);
      renderCities();
      if (cities.length > 0) showWeather(cities[0]);
    }
  }, () => {
    renderCities();
    if (cities.length > 0) showWeather(cities[0]);
  });
}

loadCurrentLocationWeather();
