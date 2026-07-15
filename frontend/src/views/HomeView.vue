<template>
  <header class="sticky top-0 bg-background z-5">
    <HeaderBar />
  </header>
  <Toast />
  <main class="h-screen bg-background p-4 md:p-8 overflow-y-scroll snap-y snap-mandatory">
    <HomeHero />

    <section
      id="calculator"
      class="grid gap-6 md:grid-cols-[2fr_3fr] min-h-screen py-6 snap-start pt-16"
    >
      <HomeCalculator />
      <DataVisualization />
    </section>
    <HomeExplanation />
  </main>
</template>

<script setup lang="ts">
import HomeCalculator from '@/features/calculator/components/HomeCalculator.vue'
import HomeHero from '@/features/marketing/components/HomeHero.vue'
import DataVisualization from '@/features/dataResults/components/DataVizualization.vue'
import { onMounted, ref } from 'vue'
import { useFoldEntriesStore } from '@/stores/foldEntries'
import HomeExplanation from '@/features/marketing/components/HomeExplanation.vue'
import { scrollToElement } from '@/features/shared/navigation.services'
import HeaderBar from '@/features/marketing/components/HeaderBar.vue'
import Toast from 'primevue/toast'

const foldEntriesStore = useFoldEntriesStore()

onMounted(() => {
  if (foldEntriesStore.entries.length === 0) {
    foldEntriesStore.exampleSetup()
  } else {
    scrollToElement('calculator')
  }
})
</script>
