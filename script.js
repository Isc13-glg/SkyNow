const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const uvValue = document.getElementById("uvValue");
const message = document.getElementById("message");
const result = document.getElementById("result");

// ☀️ messages
function getMessage(uv) {
  if (uv <= 2) return "🧊 Safe UV level.";
  if (uv <= 5) return "😎 Moderate exposure.";
  if (uv <= 7) return "☀️ High UV warning.";
  if (uv <= 10) return "🔥 EXTREME UV — stay inside.";
  return "☠️ CRITICAL DANGER LEVEL.";
}

// 🎤 voice system
function speakUV(uv) {

  let text = "";

  if (uv <= 2) text = `UV index is ${uv}. Low risk detected.`;
  else if (uv <= 5) text = `UV index is ${uv}. Moderate exposure.`;
  else if (uv <= 7) text = `UV index is ${uv}. High UV warning.`;
  else if (uv <= 10) text = `UV index is ${uv}. Extreme UV detected.`;
  else text = `UV index is ${uv}. Critical danger level.`;

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;

  window.speechSynthesis.speak(speech);
}

// 🚀 START SCAN
startBtn.addEventListener("click", () => {

  statusText.textContent = "Locating user...";

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

    speakUV(uv);

  }, () => {
    statusText.textContent = "Location permission denied.";
  });

});
