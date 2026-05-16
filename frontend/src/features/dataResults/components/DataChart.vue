<template>
  <div class="flex flex-col gap-4 p-4 items-center w-full card">
    <h3 class="self-">{{ props.title }}</h3>
    <Chart type="line" :data="chartData" :options="chartOptions" class="size-full" />
  </div>
</template>

<script setup lang="ts">
import Chart from 'primevue/chart'
import { ref, onMounted, watch } from 'vue'
import { type EntryData } from '../charts.types'

const props = defineProps<{
  data: EntryData[]
  title: string
}>()
;``
const maxValue = Math.max(...props.data.map((entry) => entry.value))
const chartData = ref()
const chartOptions = ref()

onMounted(() => {
  if (props.data) {
    chartData.value = setChartData()
    chartOptions.value = setChartOptions()
  }
})

watch(
  () => props.data,
  () => {
    if (props.data) {
      chartData.value = setChartData()
      chartOptions.value = setChartOptions()
    }
  },
  { deep: true },
)

const setChartData = () => {
  return {
    labels: props.data.map((entry) => {
      return entry.date
    }),
    datasets: [
      {
        label: 'Body fat %',
        data: Object.values(props.data).map((item) => item.value),
        backgroundColor: '#ffa42d',
        borderColor: '#ffa42d',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
    ],
  }
}
const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--p-text-color')
  const surfaceBorder = documentStyle.getPropertyValue('--color-black')

  return {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        beginAtZero: true,
        max: maxValue * 2,
        ticks: {
          color: textColor,
        },
        grid: {
          color: surfaceBorder,
        },
      },
    },

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.parsed.y.toFixed(2) + '%'
          },
        },
      },
    },
  }
}
</script>
