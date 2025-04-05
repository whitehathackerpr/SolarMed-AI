<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Energy Monitor</h2>
      
      <!-- Current Status -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Solar Power</h3>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="[
                energyStatus.solarPower > 50
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800',
              ]"
            >
              {{ energyStatus.solarPower }}%
            </span>
          </div>
          <div class="mt-4">
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span class="text-xs font-semibold inline-block text-green-600">
                    Current Output
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-semibold inline-block text-green-600">
                    {{ energyStatus.solarOutput }}W
                  </span>
                </div>
              </div>
              <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div
                  :style="{ width: energyStatus.solarPower + '%' }"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Battery Status</h3>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="[
                energyStatus.batteryLevel > 30
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{ energyStatus.batteryLevel }}%
            </span>
          </div>
          <div class="mt-4">
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span class="text-xs font-semibold inline-block text-blue-600">
                    Remaining Capacity
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xs font-semibold inline-block text-blue-600">
                    {{ energyStatus.batteryCapacity }}Ah
                  </span>
                </div>
              </div>
              <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  :style="{ width: energyStatus.batteryLevel + '%' }"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Power Consumption -->
      <div class="mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Power Consumption</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p class="text-sm text-gray-500">Current Usage</p>
              <p class="text-2xl font-semibold">{{ energyStatus.currentUsage }}W</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Daily Average</p>
              <p class="text-2xl font-semibold">{{ energyStatus.dailyAverage }}W</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Estimated Runtime</p>
              <p class="text-2xl font-semibold">{{ energyStatus.estimatedRuntime }}h</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Power History -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Power History</h3>
          <div class="flex space-x-2">
            <button
              v-for="range in timeRanges"
              :key="range.value"
              @click="selectedTimeRange = range.value"
              class="px-3 py-1 text-sm rounded-md"
              :class="[
                selectedTimeRange === range.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
            >
              {{ range.label }}
            </button>
          </div>
        </div>
        <div class="bg-white border rounded-lg p-4">
          <div class="h-64">
            <Line
              :data="chartData"
              :options="chartOptions"
            />
          </div>
        </div>
      </div>
      
      <!-- Alerts -->
      <div v-if="energyStatus.alerts.length > 0" class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Alerts</h3>
        <div class="space-y-4">
          <div
            v-for="(alert, index) in energyStatus.alerts"
            :key="index"
            class="flex items-start p-4 rounded-lg"
            :class="[
              alert.type === 'warning'
                ? 'bg-yellow-50'
                : alert.type === 'error'
                ? 'bg-red-50'
                : 'bg-blue-50',
            ]"
          >
            <div
              class="flex-shrink-0"
              :class="[
                alert.type === 'warning'
                  ? 'text-yellow-400'
                  : alert.type === 'error'
                  ? 'text-red-400'
                  : 'text-blue-400',
              ]"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p
                class="text-sm font-medium"
                :class="[
                  alert.type === 'warning'
                    ? 'text-yellow-800'
                    : alert.type === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800',
                ]"
              >
                {{ alert.message }}
              </p>
              <p
                class="text-sm"
                :class="[
                  alert.type === 'warning'
                    ? 'text-yellow-700'
                    : alert.type === 'error'
                    ? 'text-red-700'
                    : 'text-blue-700',
                ]"
              >
                {{ alert.timestamp }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const energyStatus = ref({
  solarPower: 75,
  solarOutput: 120,
  batteryLevel: 65,
  batteryCapacity: 100,
  currentUsage: 45,
  dailyAverage: 50,
  estimatedRuntime: 8,
  alerts: [
    {
      type: "warning",
      message: "Battery level below 70%",
      timestamp: "10:30 AM",
    },
    {
      type: "info",
      message: "Solar panel cleaning recommended",
      timestamp: "Yesterday",
    },
  ],
});

const timeRanges = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

const selectedTimeRange = ref('24h');

// Generate sample data for the chart
const generateChartData = () => {
  const labels = [];
  const solarData = [];
  const batteryData = [];
  const usageData = [];
  
  // Generate data based on selected time range
  const hours = selectedTimeRange.value === '24h' ? 24 : 
                selectedTimeRange.value === '7d' ? 168 : 720;
  const interval = selectedTimeRange.value === '24h' ? 1 : 
                  selectedTimeRange.value === '7d' ? 4 : 12;
  
  for (let i = 0; i < hours; i += interval) {
    const timeLabel = selectedTimeRange.value === '24h' 
      ? `${i.toString().padStart(2, '0')}:00`
      : selectedTimeRange.value === '7d'
      ? `${Math.floor(i / 24)}d ${(i % 24).toString().padStart(2, '0')}:00`
      : `${Math.floor(i / 24)}d ${(i % 24).toString().padStart(2, '0')}:00`;
    
    labels.push(timeLabel);
    
    // Solar power varies with time of day
    const hourOfDay = i % 24;
    const solarValue = Math.max(0, Math.min(100, 
      50 + 50 * Math.sin((hourOfDay - 6) * Math.PI / 12)
    ));
    solarData.push(solarValue);
    
    // Battery level decreases over time but recharges during high solar
    const batteryValue = Math.max(0, Math.min(100,
      70 - (i / 24) * 5 + (solarValue > 50 ? 5 : 0)
    ));
    batteryData.push(batteryValue);
    
    // Power usage varies throughout the day
    const usageValue = Math.max(20, Math.min(80,
      50 + 30 * Math.sin((hourOfDay - 12) * Math.PI / 12)
    ));
    usageData.push(usageValue);
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Solar Power (%)',
        data: solarData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: 'Battery Level (%)',
        data: batteryData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: 'Power Usage (W)',
        data: usageData,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };
};

const chartData = ref(generateChartData());

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#1F2937',
      bodyColor: '#1F2937',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      padding: 12,
      usePointStyle: true,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y;
          const unit = label.includes('Power') ? '%' : label.includes('Usage') ? 'W' : '%';
          return `${label}: ${value.toFixed(1)}${unit}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: 'rgba(229, 231, 235, 0.5)',
        drawBorder: false,
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 11,
        },
      },
      title: {
        display: true,
        text: 'Percentage / Watts',
        color: '#6B7280',
        font: {
          size: 12,
        },
      },
    },
    x: {
      grid: {
        color: 'rgba(229, 231, 235, 0.5)',
        drawBorder: false,
      },
      ticks: {
        color: '#6B7280',
        font: {
          size: 11,
        },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
      title: {
        display: true,
        text: 'Time',
        color: '#6B7280',
        font: {
          size: 12,
        },
      },
    },
  },
};

// Watch for time range changes
watch(selectedTimeRange, () => {
  chartData.value = generateChartData();
});

onMounted(() => {
  // TODO: Implement WebSocket connection for real-time updates
  // For now, simulate updates
  setInterval(() => {
    energyStatus.value.solarPower = Math.max(
      0,
      Math.min(100, energyStatus.value.solarPower + (Math.random() * 2 - 1))
    );
    energyStatus.value.batteryLevel = Math.max(
      0,
      Math.min(100, energyStatus.value.batteryLevel - 0.1)
    );
    
    // Update chart data
    chartData.value = generateChartData();
  }, 5000);
});
</script>
