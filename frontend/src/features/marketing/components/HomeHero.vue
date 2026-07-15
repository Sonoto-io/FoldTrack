<template>
  <section class="hero-panel grid p-4 gap-2 min-h-screen items-center snap-start">
    <div class="hero-copy">
      <p class="hero-eyebrow">TAKE CONTROL OF YOUR BODY COMPOSITION</p>

      <h1>
        Track your <span class="text-primary">real</span> progress with
        <span class="text-secondary">FoldTrack</span>, not noisy weight scales.
      </h1>

      <p class="hero-text">
        Tired of expensive smart scales or inconsistent measurements? FoldTrack uses a simple
        Jackson-Pollock-inspired method to help you track body composition manually, reliably, and
        without noise.
      </p>

      <div class="hero-actions">
        <button type="button" @click="handleStartMeasures" class="primary-cta py-4 px-6">
          Start measuring
        </button>
        <button
          type="button"
          @click="scrollToElement('explanation')"
          class="secondary-cta py-4 px-6"
        >
          See how it works
        </button>
      </div>
    </div>

    <aside class="hero-panel-right card">
      <div class="hero-highlights grid grid-rows-3">
        <div class="highlight-block">
          <span class="highlight-number">You stay in control</span>
          <span class="highlight-label"
            >You decide what and when to measure with your calipers</span
          >
        </div>

        <div class="highlight-block">
          <span class="highlight-number">No scale obsession</span>
          <span class="highlight-label">
            Focus on trends: fat, muscle, and real body evolution - not daily weight noise
          </span>
        </div>
        <div class="hero-note">
          No smart scale required. Just consistent tracking with calipers and clear progression.
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { scrollToElement } from '@/features/shared/navigation.services'
import { useFoldEntriesStore } from '@/stores/foldEntries'

const foldEntriesStore = useFoldEntriesStore()

const handleStartMeasures = () => {
  foldEntriesStore.clearEntries()
  scrollToElement('calculator')
}
</script>

<style scoped>
@media (min-width: 768px) {
  .hero-panel {
    grid-template-columns: 1.5fr 1fr;
  }
}

.hero-eyebrow {
  font-size: 0.85rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  margin-bottom: 1rem;
  color: var(--color-primary);
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 0.95;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.04em;
  color: var(--color-text-primary);
}

.hero-text {
  margin-top: 1.5rem;
  font-size: 1.05rem;
  line-height: 1.75;
  max-width: 46rem;
  color: var(--color-text-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
}

.hero-panel-right {
  display: grid;
  gap: 1.5rem;
  border: 8px solid var(--color-border);
  padding: 1.5rem;
  background: var(--color-background);
  color: var(--color-text-primary);
}

.hero-highlights {
  display: grid;
  gap: 1rem;
}

.highlight-block {
  border: 4px solid var(--color-text-primary);
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-brutal);
}

.highlight-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.hero-note {
  padding: 1rem;
  border: 4px solid var(--color-text-primary);
  background: var(--color-primary);
  color: black;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-brutal);
}
</style>
