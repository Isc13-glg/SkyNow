const startBtn = document.getElementById("startBtn");
const manualBtn = document.getElementById("manualBtn");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");
const loadCountry = document.getElementById("loadCountry");

const status = document.getElementById("status");
const loader = document.getElementById("loader");
const card = document.getElementById("card");

const tempBox = document.getElementById("temp");
const feelsBox = document.getElementById("feels");
const uvBox = document.getElementById("uv");
const windBox = document.getElementById("wind");
const humBox = document.getElementById("hum");
const visBox = document.getElementById("vis");
const sunBox = document.getElementById("sun");
const condBox = document.getElementById("cond");
const msg = document.getElementById("msg");

const alarm = document.getElementById("alarm");

let map;
let unlocked = false;

// 🌍 sample country list (you can expand later)
const countries = [
  {name:"Cyprus - Nicosia", lat:35.1856, lon:33.3823},
  {name:"Greece - Athens", lat:37.9838, lon:23.7275},
  {name:"UK - London", lat:51.5072, lon:-0.1276},
  {name:"USA - New York", lat:40.7128, lon:-74.0060},
  {name:"France - Paris", lat:48.8566, lon:2.3522},
  {name:"Germany - Berlin", lat:52.52, lon:13.4050},
  {name:"Japan - Tokyo", lat:35.6762, lon:139.6503}
];

// fill dropdown
countries.forEach(c=>{
  const opt = document.createElement("option");
  opt.value = JSON.stringify(c);
  opt.textContent = c.name;
  countrySelect.appendChild(opt);
});

// 🌡 weather condition
function condition(code){
  if(code===0) return "Clear sky ☀️";
  if(code<=3) return "Cloudy ⛅";
  if(code<=48) return "Fog 🌫️";
  if(code<=67) return "Rain 🌧️";
  if(code<=82) return "Showers 🌦️";
  return "Storm ⛈️";
}

// 💨 wind dir
function windDir(d){
  const dirs=["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(d/45)%8];
}

// 🔊 voice
function speak(t){
  const u = new SpeechSynthesisUtterance(t);
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// 🔊 alarm
function playAlarm(uv){
  if(uv >= 6.5 && unlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

// 🗺 map
function loadMap(lat,lon){
  if(map) map.remove();
  map = L.map("map").setView([lat,lon], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:"© OpenStreetMap"
  }).addTo(map);

  L.marker([lat,lon]).addTo(map);
}

// 🌍 API
async function getWeather(lat,lon){

  const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}
  &hourly=temperature_2m,uv_index,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility,apparent_temperature,weather_code
  &daily=sunrise,sunset
  &timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const now = new Date();
  const times = data.hourly.time;

  let i=0, best=999999;

  for(let x=0;x<times.length;x++){
    const d = Math.abs(new Date(times[x]) - now);
    if(d<best){ best=d; i=x; }
  }

  return {
    temp: data.hourly.temperature_2m[i],
    feels: data.hourly.apparent_temperature[i],
    uv: data.hourly.uv_index[i],
    wind: data.hourly.wind_speed_10m[i],
    windDir: data.hourly.wind_direction_10m[i],
    hum: data.hourly.relative_humidity_2m[i],
    vis: data.hourly.visibility[i],
    code: data.hourly.weather_code[i],
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0]
  };
}

// 🚀 GPS MODE
startBtn.onclick = () => {

  manualBox.classList.add("hidden");
  unlocked = true;

  status.textContent = "Getting location...";
  loader.classList.remove("hidden");

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    loadMap(lat,lon);

    const w = await getWeather(lat,lon);

    loader.classList.add("hidden");
    status.style.display = "none";
    card.classList.remove("hidden");

    tempBox.textContent = `🌡️ Temp: ${w.temp}°C`;
    feelsBox.textContent = `🤗 Feels: ${w.feels}°C`;
    uvBox.textContent = `☀️ UV: ${w.uv}`;
    windBox.textContent = `💨 Wind: ${w.wind} km/h (${windDir(w.windDir)})`;
    humBox.textContent = `💧 Humidity: ${w.hum}%`;
    visBox.textContent = `👁️ Visibility: ${w.vis} m`;

    sunBox.innerHTML =
      `🌅 Sunrise: ${w.sunrise.split("T")[1]}<br>🌇 Sunset: ${w.sunset.split("T")[1]}`;

    condBox.textContent = `☁️ ${condition(w.code)}`;

    msg.textContent = condition(w.code);

    speak(`Weather is ${condition(w.code)}. Temperature ${w.temp} degrees.`);

    playAlarm(w.uv);

  });

};

// 🌍 MANUAL MODE
manualBtn.onclick = () => {
  manualBox.classList.toggle("hidden");
  status.textContent = "Select a country";
};

loadCountry.onclick = async () => {

  const c = JSON.parse(countrySelect.value);

  unlocked = true;

  loader.classList.remove("hidden");
  status.textContent = "Loading...";

  loadMap(c.lat,c.lon);

  const w = await getWeather(c.lat,c.lon);

  loader.classList.add("hidden");
  status.style.display = "none";
  card.classList.remove("hidden");

  tempBox.textContent = `🌡️ Temp: ${w.temp}°C`;
  feelsBox.textContent = `🤗 Feels: ${w.feels}°C`;
  uvBox.textContent = `☀️ UV: ${w.uv}`;
  windBox.textContent = `💨 Wind: ${w.wind} km/h (${windDir(w.windDir)})`;
  humBox.textContent = `💧 Humidity: ${w.hum}%`;
  visBox.textContent = `👁️ Visibility: ${w.vis} m`;

  sunBox.innerHTML =
    `🌅 Sunrise: ${w.sunrise.split("T")[1]}<br>🌇 Sunset: ${w.sunset.split("T")[1]}`;

  condBox.textContent = `☁️ ${condition(w.code)}`;

  msg.textContent = condition(w.code);

  speak(`Weather in ${c.name} is ${condition(w.code)}`);

  playAlarm(w.uv);
};
