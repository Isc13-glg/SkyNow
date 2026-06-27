console.log("SkyNow loaded");

/* =========================
   ELEMENTS (SAFE)
========================= */

const intro = document.getElementById("intro");
const modeScreen = document.getElementById("modeScreen");

const useLocation = document.getElementById("useLocation");
const manualSelect = document.getElementById("manualSelect");
const mapPick = document.getElementById("mapPick");

const viewingText = document.getElementById("viewingText");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");

let map;

/* =========================
   🚀 INTRO FLOW (FIXED)
========================= */

document.addEventListener("DOMContentLoaded", () => {

  if (!intro || !modeScreen) {
    console.error("Missing intro or modeScreen");
    return;
  }

  setTimeout(() => {
    intro.style.display = "none";
    modeScreen.style.display = "flex";
  }, 1200);
});

/* =========================
   🗺️ MAP INIT
========================= */

function initMap(lat, lon) {

  if (map) map.remove();

  map = L.map("map").setView([lat, lon], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  map.on("click", (e) => {
    loadWeather(e.latlng.lat, e.latlng.lng, "Map Selection");
  });
}

/* =========================
   🌦️ WEATHER (SAFE)
========================= */

async function getWeather(lat, lon) {
  try {

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&hourly=temperature_2m,uv_index,wind_speed_10m,relative_humidity_2m,visibility,apparent_temperature" +
      "&timezone=auto";

    const res = await fetch(url);
    const data = await res.json();

    let i = 0;
    let best = Infinity;
    const now = new Date();

    for (let x = 0; x < data.hourly.time.length; x++) {
      const d = Math.abs(new Date(data.hourly.time[x]) - now);
      if (d < best) {
        best = d;
        i = x;
      }
    }

    return {
      temp: data.hourly.temperature_2m[i],
      feels: data.hourly.apparent_temperature[i],
      uv: data.hourly.uv_index[i],
      wind: data.hourly.wind_speed_10m[i],
      hum: data.hourly.relative_humidity_2m[i],
      vis: data.hourly.visibility[i]
    };

  } catch (e) {
    console.error(e);
    return {
      temp: "--",
      feels: "--",
      uv: "--",
      wind: "--",
      hum: "--",
      vis: "--"
    };
  }
}

/* =========================
   🌍 LOAD WEATHER
========================= */

async function loadWeather(lat, lon, name) {

  modeScreen.style.display = "none";

  viewingText.textContent = "🌍 Viewing: " + name;

  if (!map) initMap(lat, lon);
  else map.setView([lat, lon], 6);

  const w = await getWeather(lat, lon);

  temp.textContent = w.temp;
  feels.textContent = w.feels;
  uv.textContent = w.uv;
  wind.textContent = w.wind;
  hum.textContent = w.hum;
  vis.textContent = w.vis;
}

/* =========================
   📍 BUTTONS (FIXED PROPERLY)
========================= */

useLocation.addEventListener("click", () => {

  console.log("Location clicked");

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      loadWeather(
        pos.coords.latitude,
        pos.coords.longitude,
        "Your Location"
      );
    },
    (err) => {
      alert("Location blocked. Enable permissions in browser settings.");
      console.error(err);
    }
  );
});

/* 🌍 MANUAL (NOW WORKS — NOT BROKEN ANYMORE) */
manualSelect.addEventListener("click", () => {

  console.log("Manual clicked");

  const lat = prompt("Enter latitude (e.g. 35.1856)");
  const lon = prompt("Enter longitude (e.g. 33.3823)");
  const name = prompt("Enter name (e.g. Cyprus)");

  if (!lat || !lon) return;

  loadWeather(parseFloat(lat), parseFloat(lon), name || "Manual Location");
});

/* 🗺️ MAP MODE */
mapPick.addEventListener("click", () => {

  console.log("Map clicked");

  modeScreen.style.display = "none";

  const defaultLat = 35.1856;
  const defaultLon = 33.3823;

  loadWeather(defaultLat, defaultLon, "Map Mode");
});
