<template>
  <div class="tendency card">
    <h2 class="tendency-title">Tendency</h2>
    <div v-if="props.data.length >= 2" class="flex items-center justify-center h-full w-full">
      <p class="text-2xl text-primary center" style="font-size: 2rem">{{ tendency.toFixed(2) }}%</p>
      <i
        v-if="tendency > 0"
        class="pl-4 pi pi-arrow-up-right text-primary"
        style="font-size: 2rem"
      ></i>
      <i
        v-if="tendency < 0"
        class="pl-4 pi pi-arrow-down-right text-primary"
        style="font-size: 2rem"
      ></i>
    </div>

    <p v-else>
      More data is needed to determine a tendency. Please add more entries in the selected time span
      to see your progress.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { EntryData } from '../charts.types'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  data: EntryData[]
}>()

const tendency = ref(0.0)

onMounted(() => {
  if (props.data.length >= 2) {
    // Calculate tendency based on the data
    tendency.value = calculateTendency(props.data)
  }
})

watch(
  () => props.data,
  () => {
    console.log('wad', props.data)
    tendency.value = calculateTendency(props.data)
  },
  { deep: true },
)

const calculateTendency = (data: EntryData[]) => {
  if (data.length < 2) return 0.0

  const first = data[0]
  const last = data[data.length - 1]

  if (!first || !last) return 0.0

  return last.value - first.value
}
</script>
