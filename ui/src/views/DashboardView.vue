<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { Line, Pie, Bar } from "vue-chartjs"
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
} from "chart.js"

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement
)

interface NormalizedTx {
  date: string
  amount: number
  category: string
}

// state
const loading = ref(true)
const error = ref<string | null>(null)
const transactions = ref<NormalizedTx[]>([])

// Normalize raw transaction from backend into a consistent shape
function normalizeTx(tx: any): NormalizedTx {
  // Prefer backend transaction_date, fallback to other keys
  const rawDate =
    tx.transaction_date ||
    tx.transactionDate ||
    tx.date ||
    tx.created_at ||
    tx.createdAt ||
    tx.timestamp ||
    tx.time ||
    tx.tx_date

  const date =
    typeof rawDate === "string" && rawDate.length >= 10
      ? rawDate.slice(0, 10) // keep as plain YYYY-MM-DD, no timezone magic
      : "Unknown"

  // Amount
  const rawAmount =
    tx.amount ?? tx.value ?? tx.total ?? tx.amount_cents ?? 0
  const amount = Number(rawAmount) || 0

  // Category: always fall back to a readable string, never undefined
  const category =
    tx.category || tx.tag || tx.label || tx.type || "Uncategorized"

  return { date, amount, category }
}

// Fetch all transactions from backend
const fetchTransactions = async () => {
  loading.value = true
  error.value = null

  try {
    const res = await fetch("/api/transactions")
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    console.log("Dashboard /api/transactions data:", data)

    let items: any[] = []

    if (Array.isArray(data)) {
      items = data
    } else if (Array.isArray((data as any).transactions)) {
      items = (data as any).transactions
    } else if (Array.isArray((data as any).data)) {
      items = (data as any).data
    } else {
      items = []
    }

    transactions.value = items.map((tx) => normalizeTx(tx))
  } catch (e) {
    console.error(e)
    error.value = "Failed to load transactions."
    transactions.value = []
  } finally {
    loading.value = false
  }
}

// Line chart: spending over time (sum per date)
const lineChartData = computed(() => {
  if (!transactions.value.length) {
    return { labels: [], datasets: [] }
  }

  const dateTotals: Record<string, number> = {}
  for (const tx of transactions.value) {
    const d = tx.date || "Unknown"
    dateTotals[d] = (dateTotals[d] || 0) + (tx.amount || 0)
  }

  const labels = Object.keys(dateTotals).sort()
  const values = labels.map((d) => dateTotals[d])

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
        borderColor: "rgba(59, 130, 246, 1)", // blue-500
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#ffffff",
        pointHoverRadius: 5,
      },
    ],
  }
})

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" as const },
    title: { display: true, text: "Spending over time" },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

// Pie chart: spending by category
const pieChartData = computed(() => {
  if (!transactions.value.length) {
    return { labels: [], datasets: [] }
  }

  const catTotals: Record<string, number> = {}
  for (const tx of transactions.value) {
    const cat = tx.category || "Uncategorized"
    catTotals[cat] = (catTotals[cat] || 0) + (tx.amount || 0)
  }

  const labels = Object.keys(catTotals)
  const values = labels.map((c) => catTotals[c])

  const baseColors = [
    "rgba(59, 130, 246, 0.8)",   // blue
    "rgba(16, 185, 129, 0.8)",   // emerald
    "rgba(249, 115, 22, 0.8)",   // orange
    "rgba(244, 63, 94, 0.8)",    // rose
    "rgba(139, 92, 246, 0.8)",   // violet
    "rgba(234, 179, 8, 0.8)",    // yellow
  ]

  const backgroundColors = labels.map(
    (_label, idx) => baseColors[idx % baseColors.length]
  )
  const borderColors = backgroundColors.map((c) => c.replace("0.8", "1"))

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
  }
})

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
    title: { display: true, text: "Spending by category" },
  },
}

// Top 5 highest individual expenses (bar chart)
const top5ChartData = computed(() => {
  if (!transactions.value.length) {
    return { labels: [], datasets: [] }
  }

  // Sort by amount descending, take top 5
  const sorted = [...transactions.value].sort(
    (a, b) => b.amount - a.amount
  )
  const top5 = sorted.slice(0, 5)

  // IMPORTANT: category is always defined via normalizeTx
  const labels = top5.map((tx) => tx.category || "Uncategorized")
  const values = top5.map((tx) => tx.amount)

  const baseColors = [
    "rgba(239, 68, 68, 0.8)",   // red
    "rgba(59, 130, 246, 0.8)",  // blue
    "rgba(16, 185, 129, 0.8)",  // green
    "rgba(234, 179, 8, 0.8)",   // yellow
    "rgba(139, 92, 246, 0.8)",  // violet
  ]
  const backgroundColors = top5.map(
    (_tx, idx) => baseColors[idx % baseColors.length]
  )
  const borderColors = backgroundColors.map((c) => c.replace("0.8", "1"))

  return {
    labels,
    datasets: [
      {
        label: "Amount",
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  }
})

const top5ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: "y" as const,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Top 5 highest expenses (by category)" },
  },
  scales: {
    x: { beginAtZero: true },
  },
}

// Simple monthly summary: total this month vs previous month
const monthlySummaryData = computed(() => {
  if (!transactions.value.length) {
    return { labels: [], datasets: [] }
  }

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthKey = `${currentYear}-${String(
    currentMonth + 1
  ).padStart(2, "0")}`
  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(
    lastMonthDate.getMonth() + 1
  ).padStart(2, "0")}`

  const buckets: Record<string, number> = {
    [thisMonthKey]: 0,
    [lastMonthKey]: 0,
  }

  for (const tx of transactions.value) {
    if (!tx.date || tx.date === "Unknown") continue
    const monthKey = tx.date.slice(0, 7) // YYYY-MM
    if (buckets[monthKey] !== undefined) {
      buckets[monthKey] += tx.amount || 0
    }
  }

  const labels = ["Last Month", "This Month"]
  const values = [buckets[lastMonthKey] || 0, buckets[thisMonthKey] || 0]

  return {
    labels,
    datasets: [
      {
        label: "Total spending",
        data: values,
        backgroundColor: [
          "rgba(148, 163, 184, 0.8)", // slate
          "rgba(59, 130, 246, 0.8)",  // blue
        ],
        borderColor: [
          "rgba(148, 163, 184, 1)",
          "rgba(59, 130, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }
})

const monthlySummaryOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Monthly spending summary" },
  },
  scales: {
    y: { beginAtZero: true },
  },
}

onMounted(fetchTransactions)
</script>

<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-semibold mb-2">Dashboard</h1>
    <p class="text-sm text-gray-500 mb-4">
      Overview of your spending patterns across time, categories, and top expenses.
    </p>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else-if="!transactions.length" class="text-gray-500">
      No transactions yet. Add a few and come back to see your dashboard.
    </div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Line chart -->
      <div class="h-72 border rounded-lg p-4 shadow-sm bg-base-100">
        <Line :data="lineChartData" :options="lineChartOptions" />
      </div>

      <!-- Pie chart -->
      <div class="h-72 border rounded-lg p-4 shadow-sm bg-base-100">
        <Pie :data="pieChartData" :options="pieChartOptions" />
      </div>

      <!-- Top 5 highest expenses -->
      <div class="h-72 border rounded-lg p-4 shadow-sm bg-base-100">
        <Bar :data="top5ChartData" :options="top5ChartOptions" />
      </div>

      <!-- Monthly summary -->
      <div class="h-72 border rounded-lg p-4 shadow-sm bg-base-100">
        <Bar :data="monthlySummaryData" :options="monthlySummaryOptions" />
      </div>
    </div>
  </div>
</template>
