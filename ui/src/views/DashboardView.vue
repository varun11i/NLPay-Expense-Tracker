<!-- <script setup>
import { ref, onMounted, computed } from "vue";
import { Line, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
);

const loading = ref(true);
const error = ref("");
const transactions = ref([]);

// Normalize transaction object into { date, amount, category }
function normalizeTx(tx) {
  // Date: try several common keys
  const rawDate =
    tx.date ||
    tx.created_at ||
    tx.createdAt ||
    tx.timestamp ||
    tx.time ||
    tx.tx_date;

  const date =
    typeof rawDate === "string" ? rawDate.slice(0, 10) : "Unknown";

  // Amount: coerce to number if possible
  const rawAmount =
    tx.amount ?? tx.value ?? tx.total ?? tx.amount_cents ?? 0;

  const amount = Number(rawAmount) || 0;

  // Category / label
  const category =
    tx.category || tx.tag || tx.label || tx.type || "Uncategorized";

  return { date, amount, category };
}

// Fetch all transactions from backend
const fetchTransactions = async () => {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetch("/api/transactions");
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log("Dashboard /api/transactions data:", data);

    let items = [];

    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data.transactions)) {
      items = data.transactions;
    } else if (Array.isArray(data.data)) {
      items = data.data;
    } else {
      items = [];
    }

    transactions.value = items.map((tx) => normalizeTx(tx));
  } catch (e) {
    console.error(e);
    error.value = "Failed to load transactions.";
    transactions.value = [];
  } finally {
    loading.value = false;
  }
};

// Line chart: spending over time (sum per date)
const lineChartData = computed(() => {
  if (!transactions.value.length) {
    return { labels: [], datasets: [] };
  }

  const dateTotals = {};
  for (const tx of transactions.value) {
    const d = tx.date || "Unknown";
    dateTotals[d] = (dateTotals[d] || 0) + (tx.amount || 0);
  }

  const labels = Object.keys(dateTotals).sort();
  const values = labels.map((d) => dateTotals[d]);

  return {
    labels,
    datasets: [
      {
        label: "Spending over time",
        data: values,
        fill: false,
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 3,
        // Color styling
        borderColor: "rgba(59, 130, 246, 1)", // blue-500
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#ffffff",
        pointHoverRadius: 5,
      },
    ],
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Spending over time" },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// Pie chart: spending by category
const pieChartData = computed(() => {
  if (!transactions.value.length) {
    return { labels: [], datasets: [] };
  }

  const catTotals = {};
  for (const tx of transactions.value) {
    const cat = tx.category || "Uncategorized";
    catTotals[cat] = (catTotals[cat] || 0) + (tx.amount || 0);
  }

  const labels = Object.keys(catTotals);
  const values = labels.map((c) => catTotals[c]);

  // Simple fixed palette (loops if there are more categories)
  const baseColors = [
    "rgba(59, 130, 246, 0.8)",   // blue-500
    "rgba(16, 185, 129, 0.8)",   // emerald-500
    "rgba(249, 115, 22, 0.8)",   // orange-500
    "rgba(244, 63, 94, 0.8)",    // rose-500
    "rgba(139, 92, 246, 0.8)",   // violet-500
    "rgba(234, 179, 8, 0.8)",    // yellow-500
  ];

  const backgroundColors = labels.map(
    (_label, idx) => baseColors[idx % baseColors.length]
  );

  const borderColors = backgroundColors.map((c) =>
    c.replace("0.8", "1")
  );

  return {
    labels,
    datasets: [
      {
        label: "Spending by category",
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
});

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "Spending by category" },
  },
};
onMounted(fetchTransactions);
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-semibold mb-2">Dashboard</h1>
    <p class="text-sm text-gray-500 mb-4">
      Overview of your spending patterns across time and categories.
    </p>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="!transactions.length" class="text-gray-500">
      No transactions yet. Add a few and come back to see your dashboard.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="h-72 border rounded-lg p-4 shadow-sm bg-white">
        <Line :data="lineChartData" :options="lineChartOptions" />
      </div>

      <div class="h-72 border rounded-lg p-4 shadow-sm bg-white">
        <Pie :data="pieChartData" :options="pieChartOptions" />
      </div>
    </div>
  </div>
  
</template> -->

<script setup>
import { ref, onMounted, computed } from "vue";
import { Line, Pie, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Filler,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Filler
);

const loading = ref(true);
const error = ref("");
const transactions = ref([]);

function normalizeTx(tx) {
  const rawDate = tx.date || tx.created_at || tx.tx_date || tx.transaction_date;
  const date = typeof rawDate === "string" ? rawDate.slice(0, 10) : "Unknown";
  const amount = Number(tx.amount ?? tx.value ?? 0) || 0;
  const category = tx.category || "Uncategorized";
  const description = tx.description || tx.desc || "Expense";
  return { date, amount, category, description };
}

// --- FIXED FETCH: Hardcoded Strings to Force Data ---
const fetchTransactions = async () => {
  loading.value = true;
  error.value = "";

  try {
    const params = new URLSearchParams({
      start_date: "2020-01-01",
      end_date: "2030-01-01",
    });

    const res = await fetch(`/api/transactions?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    let items = Array.isArray(data) ? data : (data.data || []);
    
    transactions.value = items.map(normalizeTx);
  } catch (e) {
    console.error(e);
    error.value = "Failed to load transactions.";
  } finally {
    loading.value = false;
  }
};

// --- CHART DATA GENERATION ---
const lineChartData = computed(() => {
  const dateTotals = {};
  transactions.value.forEach(tx => dateTotals[tx.date] = (dateTotals[tx.date] || 0) + tx.amount);
  const labels = Object.keys(dateTotals).sort();
  return {
    labels,
    datasets: [{
      label: "Daily Spending",
      data: labels.map(d => dateTotals[d]),
      borderColor: "#3b82f6",
      tension: 0.2,
      pointRadius: 3
    }]
  };
});

const pieChartData = computed(() => {
  const catTotals = {};
  transactions.value.forEach(tx => catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount);
  const labels = Object.keys(catTotals);
  const colors = ["#3b82f6", "#10b981", "#f97316", "#f43f5e", "#8b5cf6"];
  return {
    labels,
    datasets: [{
      data: labels.map(c => catTotals[c]),
      backgroundColor: labels.map((_, i) => colors[i % colors.length])
    }]
  };
});

const topExpensesData = computed(() => {
  const sorted = [...transactions.value].sort((a, b) => b.amount - a.amount).slice(0, 5);
  return {
    labels: sorted.map(t => `${t.description} (${t.date})`),
    datasets: [{
      label: "Amount",
      data: sorted.map(t => t.amount),
      backgroundColor: "#ef4444",
      borderRadius: 4,
      barThickness: 20,
    }]
  };
});

const dayOfWeekData = computed(() => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayTotals = new Array(7).fill(0);

  transactions.value.forEach(tx => {
    if (tx.date === "Unknown") return;
    const dateObj = new Date(tx.date);
    const dayIndex = dateObj.getDay(); 
    if (!isNaN(dayIndex)) {
      dayTotals[dayIndex] += tx.amount;
    }
  });

  return {
    labels: days,
    datasets: [{
      label: "Total Spending",
      data: dayTotals,
      backgroundColor: "#8b5cf6",
      borderRadius: 4
    }]
  };
});

// --- CHART OPTIONS (Crucial for containment) ---
const commonOptions = { 
  responsive: true, 
  maintainAspectRatio: false, // Allows chart to fill the container height
  plugins: { legend: { position: 'bottom' } }
};

const horizontalOptions = {
  ...commonOptions,
  indexAxis: 'y',
  plugins: { legend: { display: false } }
};

onMounted(fetchTransactions);
</script>

<template>
  <div class="p-6 space-y-8 pb-20">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="text-sm text-gray-500">Overview of your spending habits</p>
      </div>
      <button @click="fetchTransactions" class="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm">
        Refresh Data
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading charts...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    
    <div v-else class="space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="h-80 border rounded bg-white p-4 shadow-sm flex flex-col">
           <h3 class="font-semibold text-gray-700 mb-2 shrink-0">Daily Trend</h3>
           <div class="flex-1 min-h-0 relative">
             <Line :data="lineChartData" :options="commonOptions" />
           </div>
        </div>
        
        <div class="h-80 border rounded bg-white p-4 shadow-sm flex flex-col">
           <h3 class="font-semibold text-gray-700 mb-2 shrink-0">Categories</h3>
           <div class="flex-1 min-h-0 relative">
             <Pie :data="pieChartData" :options="commonOptions" />
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="h-80 border rounded bg-white p-4 shadow-sm flex flex-col">
           <h3 class="font-semibold text-gray-700 mb-2 shrink-0">Top 5 Highest Expenses</h3>
           <div class="flex-1 min-h-0 relative">
             <Bar :data="topExpensesData" :options="horizontalOptions" />
           </div>
        </div>

        <div class="h-80 border rounded bg-white p-4 shadow-sm flex flex-col">
           <h3 class="font-semibold text-gray-700 mb-2 shrink-0">Spending by Day of Week</h3>
           <div class="flex-1 min-h-0 relative">
             <Bar :data="dayOfWeekData" :options="commonOptions" />
           </div>
        </div>

      </div>
    </div>
  </div>
</template>