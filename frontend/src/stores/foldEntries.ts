import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import { calculateBodyComposition } from '@/features/calculator/calculator.service'
import type { InputDataNotNull } from '@/features/calculator/calculator.types'
import type { BodyCompositionEntry } from '@/features/shared/shared.types'
import { exampleEntries } from '@/mocks/homepage.fixtures'

export const useFoldEntriesStore = defineStore('foldEntries', () => {
  // ─────────────────────────────
  // State
  // ─────────────────────────────
  const entries = useStorage<BodyCompositionEntry[]>('fold-entries', [], localStorage, {
    deep: true,
  })

  // ─────────────────────────────
  // Getters
  // ─────────────────────────────
  const count = computed(() => entries.value.length)

  const getLast = computed(() => entries.value[entries.value.length - 1] ?? null)

  const getSinceNDays = (days: number) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return entries.value.filter((entry) => new Date(entry.date) >= cutoffDate)
  }

  // ─────────────────────────────
  // Actions
  // ─────────────────────────────
  const exampleSetup = () => {
    entries.value = exampleEntries
  }

  const insertEntry = (entry: InputDataNotNull) => {
    removeEntry(entry.date)

    const bodyFatPercentage = calculateBodyComposition(entry)

    const newEntry: BodyCompositionEntry = {
      ...entry,
      bodyFatPercentage: bodyFatPercentage ?? 0,
    }

    entries.value.push(newEntry)

    entries.value.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const removeEntry = (date: string) => {
    const index = entries.value.findIndex((entry) => entry.date === date)

    if (index !== -1) {
      entries.value.splice(index, 1)
    }
  }

  const clearEntries = () => {
    entries.value = []
  }

  // ─────────────────────────────
  // Expose
  // ─────────────────────────────
  return {
    entries,

    count,
    getLast,
    getSinceNDays,

    exampleSetup,
    insertEntry,
    removeEntry,
    clearEntries,
  }
})
