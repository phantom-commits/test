const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    menu.classList.toggle('active');
});

const sleepBtn = document.getElementById("sleepBtn");
const wakeBtn = document.getElementById("wakeBtn");
const resetBtn = document.getElementById("resetBtn");
const infoText = document.getElementById("infoText");
const weekAvgEl = document.getElementById("weekAvg");
const monthAvgEl = document.getElementById("monthAvg");
const ctxWeek = document.getElementById("sleepChart").getContext("2d");
const ctxMonth = document.getElementById("monthChart").getContext("2d");

let sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];
let sleepTime = null;

const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// 🟢 Nouvelle fonction : convertit des heures décimales → format "7h04" ou "3min"
function formatHoursToHM(hours) {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h}h${m.toString().padStart(2, "0")}`;
}

function saveData() {
    localStorage.setItem("sleepData", JSON.stringify(sleepData));
}

function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function updateAverages() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    const weekData = sleepData.filter((d) => new Date(d.timestamp) >= weekAgo);
    const monthData = sleepData.filter((d) => new Date(d.timestamp) >= monthAgo);

    const weekAvg = average(weekData.map((d) => d.hours));
    const monthAvg = average(monthData.map((d) => d.hours));

    // 🟢 Affiche les moyennes formatées
    weekAvgEl.textContent = `Moyenne semaine : ${formatHoursToHM(weekAvg)}`;
    monthAvgEl.textContent = `Moyenne mois : ${formatHoursToHM(monthAvg)}`;
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
    infoText.textContent = `Heure de coucher enregistrée à ${sleepTime.toLocaleTimeString("fr-FR")}`;
});

wakeBtn.addEventListener("click", () => {
    if (!sleepTime) {
        alert("Tu dois d'abord enregistrer ton heure de coucher !");
        return;
    }

    const wakeTime = new Date();
    const diffMs = wakeTime - sleepTime;
    const diffHours = diffMs / 1000 / 60 / 60;

    sleepData.push({
        timestamp: sleepTime.getTime(),
        hours: parseFloat(diffHours.toFixed(3)),
    });

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    sleepData = sleepData.filter((d) => new Date(d.timestamp) >= monthAgo);

    saveData();
    updateWeekChart();
    updateMonthChart();
    updateAverages();

    // 🟢 Affiche en h/min au lieu de décimal
    infoText.textContent = `Tu as dormi ${formatHoursToHM(diffHours)} cette nuit 😴`;
    sleepTime = null;
});

// --- Bouton RESET ---
resetBtn.addEventListener("click", () => {
    const confirmReset = confirm("Voulez-vous vraiment réinitialiser toutes les données ?");
    if (!confirmReset) return;

    sleepData = [];
    localStorage.removeItem("sleepData");
    updateWeekChart();
    updateMonthChart();
    updateAverages();
    infoText.textContent = "Toutes les données ont été réinitialisées 🧹";
});

updateWeekChart();
updateMonthChart();
updateAverages();
