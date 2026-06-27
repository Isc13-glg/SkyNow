const startBtn = document.getElementById("startBtn");
const manualBtn = document.getElementById("manualBtn");
const loadManual = document.getElementById("loadManual");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");

const status = document.getElementById("status");
const loader = document.getElementById("loader");

const mainCard = document.getElementById("mainCard");
const cards = document.getElementById("cards");

const bigTemp = document.getElementById("bigTemp");
const conditionText = document.getElementById("conditionText");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");
const sun = document.getElementById("sun");

const bg = document.getElementById("bg");

let map;

/* 🌍 fallback locations */
const locations = [
  {name:"Cyprus", lat:35.1856, lon:33.3823},
  {name:"London", lat:51.5072, lon:-0.1276},
  {name:"Paris", lat:48.8566, lon:2.3522},
  {name:"Tokyo", lat:35.6762, lon:139.6503},
  {name:"New York", lat:40.7128, lon:-74.0060}
];

/* fill dropdown */
locations.forEach(l=>{
  const o = document.createElement("option");
  o.value = JSON.stringify(l);
  o.textContent = l.name;
  countrySelect.appendChild(o);
});

/* 🌤 weather text */
function weatherText(code){
  if(code === 0) return "Clear Sky";
  if(code <= 3) return "Partly Cloudy";
  if(code <= 48) return "Foggy";
  if(code <= 67) return "Rain";
  if(code <= 82) return "Showers";
  return "Storm";
}

/* 🌈 background changer */
function setBackground(code){

  let bgColor;

  if(code === 0){
    bgColor = "linear-gradient(180deg,#4facfe,#00f2fe)";
  }
  else if(code <= 3){
    bgColor = "linear-gradient(180deg,#8e9eab,#eef2f3)";
  }
  else if(code <= 48){
    bgColor = "linear-gradient(180deg,#3a3a3a,#1c1c1c)";
  }
  else if(code <= 67){
    bgColor = "linear-gradient(180deg,#314755,#26a0da)";
  }
  else{
    bgColor = "linear-gradient(180deg,#0f2027,#203a43,#2c5364)";
  }

  bg.style.background = bgColor;
}

/* 🗺 map */
function loadMap(lat,lon){

  if(map) map.remove();

  map = L.map("map").setView([lat,lon], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  L.marker([lat,lon]).addTo(map);
}

/* 🌍 API */
async function getWeather(lat,lon){

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    "&hourly=temperature_2m,uv_index,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility,apparent_temperature,weather_code" +
    "&daily=sunrise,sunset" +
    "&timezone=auto";

  const res = await fetch(url);
  if(!res.ok) throw new Error("API failed");

  const data = await res.json();

  const now = new Date();
  const times = data.hourly.time;

  let i = 0;
  let best = Infinity;

  for(let x=0;x<times.length;x++){
    const diff = Math.abs(new Date(times[x]) - now);
    if(diff < best){
      best = diff;
      i = x;
    }
  }

  return {
    temp: data.hourly.temperature_2m[i],
    feels: data.hourly.apparent_temperature[i],
    uv: data.hourly.uv_index[i],
    wind: data.hourly.wind_speed_10m[i],
    hum: data.hourly.relative_humidity_2m[i],
    vis: data.hourly.visibility[i],
    code: data.hourly.weather_code[i],
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0]
  };
}

/* 📍 GPS */
function getLocation(){
  return new Promise(r=>{
    navigator.geolocation.getCurrentPosition(
      p=>r(p),
      ()=>r(null),
      {timeout:8000}
    );
  });
}

/* 🚀 MAIN LOAD FUNCTION */
async function loadWeather(lat,lon){

  loader.classList.remove("hidden");
  status.textContent = "Loading...";

  loadMap(lat,lon);

  const w = await getWeather(lat,lon);

  loader.classList.add("hidden");
  status.style.display = "none";

  mainCard.classList.remove("hidden");
  cards.classList.remove("hidden");

  bigTemp.textContent = `${w.temp}°`;
  conditionText.textContent = weatherText(w.code);

  /* 🌟 CLEAN APPLE STYLE LABELS (NO EMOJIS IN VALUES) */
  temp.textContent = `Temperature: ${w.temp}°C`;
  feels.textContent = `Feels Like: ${w.feels}°C`;
  uv.textContent = `UV Index: ${w.uv}`;
  wind.textContent = `Wind Speed: ${w.wind} km/h`;
  hum.textContent = `Humidity: ${w.hum}%`;
  vis.textContent = `Visibility: ${w.vis} m`;

  sun.innerHTML =
    `Sunrise: ${w.sunrise.split("T")[1]}<br>` +
    `Sunset: ${w.sunset.split("T")[1]}`;

  setBackground(w.code);
}

/* 📍 GPS BUTTON */
startBtn.onclick = async ()=>{

  const pos = await getLocation();

  let lat,lon;

  if(pos){
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
  } else {
    lat = 35.1856;
    lon = 33.3823;
  }

  loadWeather(lat,lon);
};

/* 🌍 MANUAL MODE */
manualBtn.onclick = ()=>{
  manualBox.classList.toggle("hidden");
};

loadManual.onclick = ()=>{
  const l = JSON.parse(countrySelect.value);
  loadWeather(l.lat,l.lon);
};
