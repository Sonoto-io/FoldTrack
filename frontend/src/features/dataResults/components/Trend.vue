<template>
  <div class="trend card">
    <h2 class="trend-title">Trend</h2>
    <div v-if="props.data.length >= 2" class="flex items-center justify-center h-full w-full">
      <p class="text-2xl text-primary center" style="font-size: 2rem">{{ trend.toFixed(2) }}%</p>
      <i
        v-if="trend > 0"
        class="pl-4 pi pi-arrow-up-right text-primary"
        style="font-size: 2rem"
      ></i>
      <i
        v-if="trend < 0"
        class="pl-4 pi pi-arrow-down-right text-primary"
        style="font-size: 2rem"
      ></i>
    </div>

    <p v-else>
      More data is needed to determine a trend. Please add more entries in the selected time span to
      see your progress.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { EntryData } from '../charts.types'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  data: EntryData[]
}>()

const trend = ref(0.0)

onMounted(() => {
  if (props.data.length >= 2) {
    // Calculate trend based on the data
    trend.value = calculateTrend(props.data)
  }
})

watch(
  () => props.data,
  () => {
    trend.value = calculateTrend(props.data)
  },
  { deep: true },
)

const calculateTrend = (data: EntryData[]) => {
  if (data.length < 2) return 0.0

  const first = data[0]
  const last = data[data.length - 1]

  if (!first || !last) return 0.0

  return last.value - first.value
}
</script>
