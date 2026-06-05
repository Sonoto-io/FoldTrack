<template>
  <Tabs v-model:value="selectedTab" class="folds-form col-span-full">
    <TabList>
      <Tab :value="3">3 Folds (Standard)</Tab>
      <Tab :value="4">4 Folds (Quick estimate)</Tab>
      <Tab :value="7">7 Folds (Most accurate)</Tab>
    </TabList>

    <TabPanels>
      <TabPanel v-for="n in [3, 4, 7] as const" :key="n" :value="n">
        <div class="grid grid-cols-2 gap-3">
          <template v-for="field in getFields(n, props.gender)" :key="field">
            <FormField
              :name="`skinfolds.${field}`"
              v-slot="{ value, error, errors, props: fieldProps }"
            >
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium">{{ formatLabel(field) }} in mm</label>
                <InputNumber
                  v-bind="fieldProps"
                  :modelValue="value"
                  @update:modelValue="(val) => fieldProps.onInput({ value: val })"
                  placeholder="mm"
                  v-tooltip.bottom="tooltipTexts[field]"
                />
                <Message v-if="errors?.length" severity="error" size="small" variant="simple">
                  {{ error.message || errors[0].message }}
                </Message>
              </div>
            </FormField>
          </template>
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import { FormField } from '@primevue/forms'

import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { Gender } from '../calculator.enum'
import { formatLabel } from '@/features/shared/format.services'

const props = defineProps<{
  gender: Gender | null
  foldCount: number
}>()

const selectedTab = computed({
  get: () => props.foldCount,
  set: (val) => emit('update:foldCount', val),
})

const emit = defineEmits<{
  (e: 'update:foldCount', value: number): void
}>()

// Generate inputs
type FoldConfig = { female: string[]; male: string[] } | string[]

const foldConfig = {
  3: {
    male: ['pectoral', 'abdominal', 'thigh'],
    female: ['triceps', 'suprailiac', 'thigh'],
  },
  4: ['triceps', 'suprailiac', 'thigh', 'abdominal'],
  7: ['triceps', 'suprailiac', 'thigh', 'abdominal', 'pectoral', 'midaxillary', 'subscapular'],
} as const

const getFields = (tab: 3 | 4 | 7, gender: Gender | null) => {
  if (tab === 3) {
    return gender === Gender.Male ? foldConfig[tab].male : foldConfig[tab].female
  } else {
    return foldConfig[tab]
  }
}

// Short tooltip guidance for each skinfold site (concise, user-facing)
const tooltipTexts: Record<string, string> = {
  pectoral: 'Pectoral: diagonal pinch on the chest, midway between nipple and armpit.',
  abdominal: 'Abdominal: vertical pinch about 2 cm to the right of the navel.',
  thigh: 'Thigh: vertical pinch at the midpoint of the anterior thigh.',
  triceps: 'Triceps: vertical pinch at the midpoint of the posterior upper arm.',
  suprailiac: 'Suprailiac: diagonal pinch just above the iliac crest, slightly forward.',
  midaxillary: 'Midaxillary: vertical pinch on the midaxillary line at the level of the xiphoid.',
  subscapular: 'Subscapular: diagonal pinch below the shoulder blade (about 2 cm).',
}
</script>

<style>
.folds-form .p-inputtext {
  max-width: 100%;
}
</style>
