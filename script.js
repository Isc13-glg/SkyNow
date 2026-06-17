const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const uvValue = document.getElementById("uvValue");
const message = document.getElementById("message");
const result = document.getElementById("result");
const alarm = document.getElementById("alarm");
const cityList = document.getElementById("cityList");
const search = document.getElementById("search");

let map;
let audioUnlocked = false;

// 🌍 Cities (alphabetical incl. Paphos)
const cities = [
  "Amsterdam","Athens","Berlin","Brussels","Bucharest",
  "Budapest","Copenhagen","Dublin","Helsinki","Kyiv",
  "Lisbon","London","Madrid","Nicosia","Oslo",
  "Paris","Paphos","Prague","Rome","Sofia","Vienna","Warsaw"
].sort();

function renderCities(list = cities) {
  cityList.innerHTML = "";
  list.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    cityList.appendChild(li);
  });
}

renderCities();

// 🔎 search filter
search?.addEventListener("input", (e) => {
  const filtered = cities.filter(c =>
    c.toLowerCase().includes(e.target.value.toLowerCase())
  );
  renderCities(filtered);
});

// ☀️ UV messages
function getMessage(uv) {
  if (uv <= 2) return "🧊 Safe UV level.";
  if (uv <= 5) return "😎 Moderate UV.";
  if (uv <= 7) return "☀️ High UV warning.";
  if (uv <= 10) return "🔥 EXTREME UV.";
  return "☠️ CRITICAL DANGER.";
}

// 🎤 VOICE SYSTEM
function speakUV(uv) {
  let text = `UV index is ${uv}.`;

  if (uv <= 2) text += " Low risk.";
  else if (uv <= 5) text += " Moderate exposure.";
  else if (uv <= 7) text += " High UV warning.";
  else if (uv <= 10) text += " Extreme UV detected.";
  else text += " Critical danger level.";

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;

  window.speechSynthesis.speak(speech);
}

// 🔊 ALARM (FIXED FOR MOBILE)
function playAlarm(uv) {
  if (uv >= 7 && audioUnlocked) {
    alarm.currentTime = 0;
    alarm.play().catch(() => {});
  }
}

// 🗺️ MAP (Chrome + Safari FIXED)
function initMap(lat, lon) {

  if (map) {
    map.remove();
  }

  map = L.map("map").setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

// 🚀 START SCAN BUTTON
startBtn.addEventListener("click", () => {

  statusText.textContent = "Unlocking sensors...";

  // 🔓 IMPORTANT: unlock audio for mobile
  audioUnlocked = true;

  // trick browsers into enabling sound
  alarm.play().then(() => {
    alarm.pause();
    alarm.currentTime = 0;
  }).catch(() => {});

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    const uv = data.daily.uv_index_max[0];

    statusText.style.display = "none";
    result.classList.remove("hidden");

    uvValue.textContent = `UV INDEX: ${uv}`;
    message.textContent = getMessage(uv);

    initMap(lat, lon);
    speakUV(uv);
    playAlarm(uv);

  }, () => {
    statusText.textContent = "Location permission denied.";
  });

});
