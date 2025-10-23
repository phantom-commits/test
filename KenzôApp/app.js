const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  menu.classList.toggle('active');
});

const objectifInput = document.getElementById('objectif');
const nbVerresSpan = document.getElementById('nbVerres');
const objectifAffiche = document.getElementById('objectifAffiche');
const progressBar = document.getElementById('progressBar');
const boireBtn = document.getElementById('boireBtn');
const ajouterBtn = document.getElementById('ajouterBtn');
const plusBtn = document.getElementById('plus');
const moinsBtn = document.getElementById('moins');

let nbVerres = 0;
let objectif = parseInt(objectifInput.value);

const minObjectif = parseInt(objectifInput.min, 10) || 1;
const maxObjectif = parseInt(objectifInput.max, 10) || 20;


const jours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
let dataVerres = JSON.parse(localStorage.getItem('dataVerres')) || Array(7).fill(0);

function majAffichage() {
  objectifAffiche.textContent = objectif;
  nbVerresSpan.textContent = nbVerres;

  const pourcentage = objectif > 0 ? Math.min((nbVerres / objectif) * 100, 100) : 0;
  progressBar.style.width = `${pourcentage}%`;
}


const ctx = document.getElementById('graphique').getContext('2d');


const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, '#30818fff');
gradient.addColorStop(1, '#0c485fff');

const chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: jours,
    datasets: [{
      label: '💧 Verres bus par jour',
      data: dataVerres,
      backgroundColor: gradient,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: '#009eff'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    layout: {
      padding: 10
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 14, family: 'Poppins, Arial, sans-serif' },
          color: '#333'
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          stepSize: 1,
          font: { size: 13 },
          color: '#444'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 15, weight: 'bold' },
          color: '#222'
        }
      },
      tooltip: {
        backgroundColor: '#1a73e8',
        titleFont: { size: 15, weight: 'bold' },
        bodyFont: { size: 14 },
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} verres`
        }
      },
      title: {
        display: true,
        text: 'Suivi hebdomadaire de ton hydratation 💦',
        color: '#111',
        font: {
          size: 18,
          weight: 'bold',
          family: 'Poppins, Arial, sans-serif'
        },
        padding: { bottom: 15 }
      }
    },
    animation: {
      duration: 1200,
      easing: 'easeOutQuart'
    }
  }
});


boireBtn.addEventListener('click', () => {
  if (nbVerres < objectif) {
    nbVerres++;
    majAffichage();
  } else {
    alert("🎉 Objectif atteint !");
  }
});


plusBtn.addEventListener('click', () => {
  if (objectif < maxObjectif) {
    objectif++;
    objectifInput.value = objectif;
    majAffichage();
  }
});

moinsBtn.addEventListener('click', () => {
  if (objectif > minObjectif) {
    objectif--;
    objectifInput.value = objectif;
    nbVerres = Math.min(nbVerres, objectif);
    majAffichage();
  }
});


ajouterBtn.addEventListener('click', () => {
  const today = new Date().getDay(); // 0 = dimanche
  const indexJour = (today + 6) % 7; // 0 = lundi

  dataVerres[indexJour] = nbVerres;
  localStorage.setItem('dataVerres', JSON.stringify(dataVerres));

  chart.data.datasets[0].data = dataVerres;
  chart.update();

  alert("✅ Données enregistrées pour aujourd’hui !");
});


const resetBtn = document.createElement('button');
resetBtn.textContent = "🔄 Réinitialiser la semaine";
resetBtn.style.background = "#8AAAE5";
resetBtn.style.marginTop = "10px";
resetBtn.style.display = "block";
resetBtn.style.marginInline = "auto";
resetBtn.style.fontWeight = "bold";
document.querySelector(".carte").appendChild(resetBtn);

resetBtn.addEventListener('click', () => {
  if (confirm("Voulez-vous vraiment effacer toutes les données de la semaine ?")) {
    dataVerres = Array(7).fill(0);
    localStorage.setItem('dataVerres', JSON.stringify(dataVerres));
    chart.data.datasets[0].data = dataVerres;
    chart.update();
    alert("🧼 Données hebdomadaires réinitialisées !");
  }
});

window.addEventListener('load', () => {
  majAffichage();
  chart.data.datasets[0].data = dataVerres;
  chart.update();
});

const sleepBtn = document.getElementById("sleepBtn");
const wakeBtn = document.getElementById("wakeBtn");
const infoText = document.getElementById("infoText");
const weekAvgEl = document.getElementById("weekAvg");
const monthAvgEl = document.getElementById("monthAvg");
const ctxWeek = document.getElementById("sleepChart").getContext("2d");
const ctxMonth = document.getElementById("monthChart").getContext("2d");

let sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];
let sleepTime = null;

const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function saveData() {
  localStorage.setItem("sleepData", JSON.stringify(sleepData));
}

function average(arr) {
  if (arr.length === 0) return 0;
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
}

function updateAverages() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setMonth(now.getMonth() - 1);

  const weekData = sleepData.filter((d) => new Date(d.timestamp) >= weekAgo);
  const monthData = sleepData.filter((d) => new Date(d.timestamp) >= monthAgo);

  weekAvgEl.textContent = `Moyenne semaine : ${average(
    weekData.map((d) => d.hours)
  )} h`;
  monthAvgEl.textContent = `Moyenne mois : ${average(
    monthData.map((d) => d.hours)
  )} h`;
}

function getCurrentWeekData() {
  const now = new Date();
  const monday = new Date(now);
  const day = now.getDay() === 0 ? 7 : now.getDay();
  monday.setDate(now.getDate() - (day - 1));

  const weekMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dayKey = daysOfWeek[i];
    const found = sleepData.find((sd) => {
      const sdDate = new Date(sd.timestamp);
      return sdDate.toDateString() === d.toDateString();
    });
    weekMap[dayKey] = found ? found.hours : 0;
  }
  return weekMap;
}

function updateWeekChart() {
  const weekMap = getCurrentWeekData();
  weekChart.data.labels = daysOfWeek;
  weekChart.data.datasets[0].data = Object.values(weekMap);
  weekChart.update();
}

function getWeeklyAveragesForMonth() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const weeklyAverages = [];

  for (let i = 0; i < 5; i++) {
    const start = new Date(startOfMonth);
    start.setDate(startOfMonth.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const weekData = sleepData.filter(
      (d) => new Date(d.timestamp) >= start && new Date(d.timestamp) < end
    );
    weeklyAverages.push(average(weekData.map((d) => d.hours)));
  }

  return weeklyAverages.filter((v) => v > 0);
}

function updateMonthChart() {
  const weeklyAverages = getWeeklyAveragesForMonth();
  monthChart.data.labels = weeklyAverages.map((_, i) => `Semaine ${i + 1}`);
  monthChart.data.datasets[0].data = weeklyAverages;
  monthChart.update();
}

// --- Graphique de la semaine ---
const weekChart = new Chart(ctxWeek, {
  type: "line",
  data: {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Heures de sommeil (semaine)",
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2.5,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointRadius: 5,
        tension: 0.3,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280", stepSize: 1 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
    plugins: {
      legend: { labels: { color: "#374151" } },
    },
  },
});

// --- Graphique du mois ---
const monthChart = new Chart(ctxMonth, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Moyenne des semaines (mois en cours)",
        data: [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.1)",
        borderWidth: 2.5,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#10b981",
        pointRadius: 5,
        tension: 0.3,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280", stepSize: 1 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
    plugins: {
      legend: { labels: { color: "#374151" } },
    },
  },
});

// --- Boutons ---
sleepBtn.addEventListener("click", () => {
  sleepTime = new Date();
  infoText.textContent = `Heure de coucher enregistrée à ${sleepTime.toLocaleTimeString(
    "fr-FR"
  )}`;
});

wakeBtn.addEventListener("click", () => {
  if (!sleepTime) {
    alert("Tu dois d'abord enregistrer ton heure de coucher !");
    return;
  }

  const wakeTime = new Date();
  const diffMs = wakeTime - sleepTime;
  const diffHours = (diffMs / 1000 / 60 / 60).toFixed(2);

  sleepData.push({
    timestamp: sleepTime.getTime(),
    hours: parseFloat(diffHours),
  });

  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  sleepData = sleepData.filter((d) => new Date(d.timestamp) >= monthAgo);

  saveData();
  updateWeekChart();
  updateMonthChart();
  updateAverages();

  infoText.textContent = `Tu as dormi ${diffHours} heures cette nuit 😴`;
  sleepTime = null;
});

updateWeekChart();
updateMonthChart();
updateAverages();