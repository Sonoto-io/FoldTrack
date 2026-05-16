<template>
  <div class="flex flex-col items-center justify-center">
    <div
      class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-3xl dark:bg-primary-900/40"
    >
      📏
    </div>

    <h2 class="mb-2 text-2xl font-bold text-surface-900 dark:text-surface-0">
      No body fat entries yet for this period
    </h2>

    <p class="max-w-2xl text-sm leading-7 text-surface-600 dark:text-surface-300">
      The <span class="font-semibold">Jackson-Pollock method</span>
      estimates body fat percentage using skinfold measurements taken at specific points on the body
      with calipers.
    </p>

    <div class="mt-5 rounded-2xl bg-surface-100 px-5 py-4 text-left text-sm card">
      <p class="font-semibold">How to take skinfold measurements:</p>

      <ul class="mt-2 list-decimal space-y-1 pl-5">
        <li>Use a skinfold caliper to measure the thickness of the skinfold.</li>
        <li>Locate the correct measurement site before taking the reading.</li>
        <li>Always measure on the same side of the body for consistency.</li>
        <li>Take the measurements carefully and enter them into the form.</li>
        <li>Submit the form to estimate your body fat percentage and body composition.</li>
      </ul>
    </div>

    <p class="mt-5 max-w-2xl text-sm leading-7 text-surface-600 dark:text-surface-300">
      Add your first skinfold entry to calculate your estimated body fat percentage and track your
      progress over time.
    </p>
  </div>
</template>

<script setup lang="ts"></script>
