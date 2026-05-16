<template>
  <div class="body-composition-result bg-black/50 p-6 rounded-lg mt-6">
    <p>
      Body fat percentage : <span class="font-bold text-secondary">{{ bodyFatPercentage }}</span>
    </p>
    <p>
      Fat mass : <span class="font-bold text-secondary">{{ fatMass }}</span>
    </p>
    <p v-tooltip.bottom="'Includes muscles, water, bones and organs'">
      Lean mass : <span class="font-bold text-secondary">{{ leanMass }}</span>
    </p>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { InputDataNotNull } from '../calculator.types'
import { calculateBodyComposition } from '../calculator.service'

const props = defineProps<{
  inputData: InputDataNotNull
}>()

const bodyFatPercentage = computed(() => calculateBodyComposition(props.inputData).toFixed(2) + '%')
const fatMass = computed(
  () =>
    ((props.inputData.weight * calculateBodyComposition(props.inputData)) / 100).toFixed(2) + ' kg',
)
const leanMass = computed(
  () =>
    (props.inputData.weight * (1 - calculateBodyComposition(props.inputData) / 100)).toFixed(2) +
    ' kg',
)
</script>
