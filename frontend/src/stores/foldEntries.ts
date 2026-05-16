// Example: Options Store
import { calculateBodyComposition } from '@/features/calculator/calculator.service'
import type { FoldsMeasurements, InputDataNotNull } from '@/features/calculator/calculator.types'
import type { BodyCompositionEntry } from '@/features/shared/shared.types'
import { defineStore } from 'pinia'
import { exampleEntries } from '@/mocks/homepage.fixtures'

export const useFoldEntriesStore = defineStore('foldEntries', {
  state: () => ({
    entries: [] as BodyCompositionEntry[],
  }),
  getters: {
    count: (state) => state.entries.length,
    getLast: (state) => state.entries[state.entries.length - 1] ?? null,
    getSinceNDays: (state) => (days: number) => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      return state.entries.filter((entry) => new Date(entry.date) >= cutoffDate)
    },
  },
  actions: {
    exampleSetup() {
      this.entries = exampleEntries
    },
    insertEntry(entry: InputDataNotNull) {
      this.removeEntry(entry.date) // Ensure no duplicate dates
      const bodyFatPercentage = calculateBodyComposition(entry)
      const newEntry: BodyCompositionEntry = {
        ...entry,
        bodyFatPercentage: bodyFatPercentage ?? 0,
      }
      this.entries.push(newEntry)
      this.entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
      console.log('Inserted entry:', this.entries)
    },
    removeEntry(date: string) {
      const index = this.entries.findIndex((entry) => entry.date === date)
      if (index !== -1) {
        this.entries.splice(index, 1)
      }
    },
    getEntriesByTimeSpan(days: number) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      return this.entries.filter((entry) => new Date(entry.date) >= cutoffDate)
    },
    clearEntries() {
      this.entries = []
    },
  },
})
