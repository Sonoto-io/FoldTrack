<template>
  <div class="card grid grid-cols-1 grid-rows-[50px_1fr] gap-6 snap-start">
    <Select
      fluid
      v-model="timeSpan"
      :options="timeSpanOptions"
      optionLabel="label"
      optionValue="value"
    />
    <div v-if="chartData.length > 0" class="grid grid-cols-1 grid-rows-[2fr_1fr_50px] gap-6 w-full">
      <DataChart :data="chartData" title="Body fat percentage" />
      <Tendency :data="chartData" />
      <Button
        label="Remove all entries"
        severity="danger"
        @click="foldEntriesStore.clearEntries"
        class="w-full"
      />
    </div>
    <div v-else class="flex justify-center items-center text-muted-foreground card">
      <JPExplanation />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFoldEntriesStore } from '@/stores/foldEntries'
import DataChart from './DataChart.vue'
import Tendency from './Tendency.vue'
import { ref, watch } from 'vue'
import JPExplanation from '@/features/shared/components/JPExplanation.vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { BodyCompositionEntry } from '@/features/shared/shared.types'
import type { EntryData } from '../charts.types'

const foldEntriesStore = useFoldEntriesStore()
const chartData = ref<EntryData[]>([])
const timeSpanOptions = [
  { label: 'All time', value: 'all' },
  { label: 'Last year', value: 'year' },
  { label: 'Last month', value: 'month' },
  { label: 'Last week', value: 'week' },
  { label: 'Since last entry', value: 'last' },
]
const timeSpan = ref('all')

watch(
  () => foldEntriesStore.entries,
  () => {
    console.log('entries', foldEntriesStore.entries)
    chartData.value = foldEntriesStore.entries.map((entry) => {
      return {
        date: entry.date,
        value: entry.bodyFatPercentage,
      }
    })
  },
  { deep: true },
)

watch(timeSpan, () => {
  if (timeSpan.value === 'all') {
    chartData.value = foldEntriesToEntryData(foldEntriesStore.entries)
  } else if (timeSpan.value === 'last') {
    const lastEntries = foldEntriesStore.entries.slice(-2)
    chartData.value = foldEntriesToEntryData(lastEntries)
    return
  } else {
    const numberOfDays =
      timeSpan.value === 'week'
        ? 7
        : timeSpan.value === 'month'
          ? 30
          : timeSpan.value === 'year'
            ? 365
            : null
    if (numberOfDays) {
      chartData.value = foldEntriesToEntryData(foldEntriesStore.getEntriesByTimeSpan(numberOfDays))
    }
  }
})

const foldEntriesToEntryData = (entries: BodyCompositionEntry[]) => {
  return entries.map((entry) => {
    return {
      date: entry.date,
      value: entry.bodyFatPercentage,
    }
  })
}
</script>
