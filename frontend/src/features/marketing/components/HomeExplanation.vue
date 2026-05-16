<template>
  <section id="explanation" class="grid gap-12 mt-24 snap-start">
    <div class="grid gap-4">
      <p class="text-primary text-sm font-black uppercase tracking-[0.2em]">
        UNDERSTAND THE METHOD
      </p>

      <h2 class="m-0 text-4xl md:text-6xl leading-none font-black uppercase tracking-[-0.04em]">
        Better measurements start with
        <span class="text-primary">better context</span>
      </h2>
    </div>

    <!-- MOBILE: horizontal scroll -->
    <!-- DESKTOP: 3 columns -->
    <div
      class="gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:overflow-visible"
    >
      <article
        v-for="(section, index) in sections"
        :key="section.title"
        class="shrink-0 w-[90vw] snap-start md:w-auto gap-6 p-8 card border-8 flex! flex-col justify-between h-fit min-h-[90vh]"
      >
        <div class="flex items-center gap-6">
          <div
            class="w-fit px-4 py-2 border-4 border-border bg-primary text-black text-2xl font-black"
          >
            {{ index + 1 }}
          </div>
          <i v-if="index != 2" class="pi pi-arrow-right text-primary" style="font-size: 2rem" />
        </div>

        <h3 class="m-0 text-2xl leading-tight font-black uppercase">
          {{ section.title }}
        </h3>

        <Panel toggleable collapsed class="bg-transparent border-none shadow-none">
          <template #header>
            <span class="text-primary font-black uppercase text-sm tracking-wide cursor-pointer">
              Read more
            </span>
          </template>
          <template #toggleicon="{ collapsed }">
            <i :class="collapsed ? 'pi pi-plus text-text-muted' : 'pi pi-minus text-text-muted'" />
          </template>
          <p class="leading-8 text-text-secondary whitespace-pre-line">
            {{ section.description }}
          </p>
        </Panel>

        <ul class="grid gap-3 pl-5 font-bold">
          <li v-for="point in section.points" :key="point" class="leading-6">
            {{ point }}
          </li>
        </ul>

        <!-- SVG placeholder -->
        <div
          class="flex items-center justify-center min-h-[180px] border-4 border-dashed border-border bg-surface font-black uppercase tracking-[0.08em]"
        >
          Illustration placeholder
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Panel } from 'primevue'

const sections = [
  {
    title: 'Why consumer smart scales can feel inconsistent',
    description: `
Most non-medical smart scales use bioelectrical impedance analysis (BIA).
They estimate body composition by sending a very small electrical signal
through your body.

The problem is that hydration, meals, sleep, stress, training, skin temperature,
and even the time of day can influence the result.

Your body fat percentage can appear to change even when your actual
progression has not.
    `,
    points: [
      'Hydration levels heavily affect measurements',
      'Daily fluctuations can create misleading trends',
      'Weight alone does not reflect body composition evolution',
    ],
  },
  {
    title: 'Jackson-Pollock method for body composition',
    description: `
The Jackson-Pollock method estimates body fat using skinfold measurements.
Instead of relying on electrical signals, it uses the thickness of specific
skinfold areas to estimate body density and body fat percentage.

While no method is perfect outside medical environments, consistent
measurements taken under similar conditions can provide reliable trends
over time.
    `,
    points: [
      'Uses manual skinfold measurements',
      'Based on well-known body composition formulas',
      'Excellent for tracking long-term progression consistency',
    ],
  },
  {
    title: 'Correct skinfold placement matters with calipers',
    description: `
Measurement consistency is more important than perfection.
Taking measurements from the same anatomical locations each time helps
reduce variability and improves trend accuracy.

FoldTrack helps you identify and remember the correct pinch locations
used in the Jackson-Pollock protocol.
    `,
    points: [
      'Use the same side of the body every time',
      'Measure under similar conditions when possible',
      'Consistent placement improves progression tracking',
    ],
  },
]
</script>
