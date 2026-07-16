<template>
  <div class="card grid grid-cols-1 grid-rows-[50px_1fr] gap-6">
    <Select
      fluid
      v-model="timeSpan"
      :options="timeSpanOptions"
      optionLabel="label"
      optionValue="value"
    />
    <div v-if="chartData.length > 0" class="grid grid-cols-1 grid-rows-[2fr_1fr_50px] gap-6 w-full">
      <DataChart :data="chartData" title="Body fat percentage" />
      <Trend :data="chartData" />
      <Button
        label="Remove all entries"
        severity="danger"
        @click="confirmDeleteAll"
        class="w-full"
      />
      <ConfirmDialog group="clearEntries"></ConfirmDialog>
    </div>
    <div v-else class="flex justify-center items-center text-muted-foreground card">
      <JPExplanation />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFoldEntriesStore } from '@/stores/foldEntries'
import { clearEntriesService } from '@/features/sync/sync.service'
import DataChart from './DataChart.vue'
import Trend from './Trend.vue'
import { onMounted, ref, watch } from 'vue'
import JPExplanation from '@/features/shared/components/JPExplanation.vue'
import Select from 'primevue/select'
import ConfirmDialog from 'primevue/confirmdialog'

import Button from 'primevue/button'
import type { BodyCompositionEntry } from '@/features/shared/shared.types'
import type { EntryData } from '../charts.types'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
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

onMounted(() => {
  chartData.value = foldEntriesToEntryData(foldEntriesStore.entries)
})

watch(
  () => foldEntriesStore.entries,
  (entries) => {
    chartData.value = entries.map((entry) => {
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
      chartData.value = foldEntriesToEntryData(foldEntriesStore.getSinceNDays(numberOfDays))
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

const confirmDeleteAll = () => {
  confirm.require({
    group: 'clearEntries',
    message: 'You will delete all data forever.',
    header: 'Are you sure ?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: async () => {
      await clearEntriesService()
    },
  })
}
</script>

<style>
.p-button-outlined.p-button-secondary {
  background: transparent;
  border-color: var(--color-text-muted) !important;
  color: var(--color-white) !important;
}
</style>
