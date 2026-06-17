const statusText = document.getElementById("status");
const uvValue = document.getElementById("uvValue");
const message = document.getElementById("message");
const result = document.getElementById("result");

function getGreekMessage(uv) {
  if (uv <= 2) return "🧊 Chill ρε, είσαι safe.";
  if (uv <= 5) return "😎 Λίγο αντηλιακό δεν βλάπτει.";
  if (uv <= 7) return "☀️ Καίει λίγο, πρόσεχε.";
  if (uv <= 10) return "🔥 ΜΗΝ ΠΑΣ ΕΞΩ. Θα καείς.";
  return "☠️ ΤΕΛΟΣ. Μείνε μέσα.";
}

navigator.geolocation.getCurrentPosition(async (pos) => {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const uv = data.daily.uv_index_max[0];

  statusText.style.display = "none";
  result.classList.remove("hidden");

  uvValue.textContent = `UV Index: ${uv}`;
  message.textContent = getGreekMessage(uv);

}, () => {
  statusText.textContent = "Enable location to continue 😢";
});
