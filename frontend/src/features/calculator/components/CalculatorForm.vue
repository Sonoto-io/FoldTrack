<template>
  <div class="calculator-form card">
    <h2 class="text-lg">Body Composition Calculator</h2>
    <p class="text-sm text-text-muted mb-4">
      Calculate your body composition based on your skinfold measurements.
    </p>
    <Form
      ref="formRef"
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="grid col-span-full grid-cols-1 md:grid-cols-2 gap-2"
    >
      <!-- Basic fields -->
      <div class="flex flex-col gap-2 mb-4">
        <label>Date</label>
        <DatePicker
          name="date"
          dateFormat="yy-mm-dd"
          showIcon
          iconDisplay="input"
          :placeholder="initialValues.date"
        />

        <Message v-if="$form.date?.error" severity="error" size="small" variant="simple">
          {{ $form.date?.error.message }}
        </Message>
      </div>
      <div class="flex flex-col gap-2 mb-4">
        <label>Age</label>
        <InputText type="number" name="age" />
        <Message v-if="$form.age?.error" severity="error" size="small" variant="simple">
          {{ $form.age?.error.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-2 mb-4">
        <label>Bio gender</label>
        <Select name="gender" :options="genderOptions" optionLabel="label" optionValue="value" />
      </div>

      <div class="flex flex-col gap-2 mb-4">
        <label>Weight (kg)</label>
        <InputText type="number" name="weight" />
      </div>

      <!-- for form values to receive foldsCount when submitting -->
      <InputText type="hidden" name="foldsCount" />

      <!-- Skinfolds section -->
      <CalculatorFormFolds
        :gender="gender"
        :fold-count="foldsCount ?? 3"
        @update:foldCount="updateFoldsCount($event)"
      />

      <Button type="submit" label="Submit" class="mt-4 w-full col-span-full" />
    </Form>
    <BodyCompositionResult :input-data="submittedValues" />
  </div>
</template>

<script setup lang="ts">
import CalculatorFormFolds from './CalculatorFormFolds.vue'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import Message from 'primevue/message'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { computed, ref, type Ref } from 'vue'
import { z } from 'zod'
import { type InputDataNotNull, type MainInputData } from '../calculator.types'
import { Gender } from '@/features/shared/shared.enum'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import { formatLabel } from '@/features/shared/shared.services.ts'
import BodyCompositionResult from './BodyCompositionResult.vue'
import { useFoldEntriesStore } from '@/stores/foldEntries'

const foldEntriesStore = useFoldEntriesStore()

const formRef = ref()
const gender = computed(() => formRef.value?.getFieldState('gender')?.value ?? Gender.Female)
const foldsCount = computed(() => formRef.value?.getFieldState('foldsCount')?.value ?? 3)

const lastEntry = foldEntriesStore.getLast
const initialValues: Ref<InputDataNotNull> = ref({
  date: lastEntry?.date ?? new Date().toISOString().split('T')[0] ?? new Date().toISOString(), // default to today's date in YYYY-MM-DD format
  age: lastEntry?.age ?? 30,
  gender: lastEntry?.gender ?? Gender.Female,
  weight: lastEntry?.weight ?? 70,
  skinfolds: {
    triceps: lastEntry?.skinfolds?.triceps ?? 10,
    suprailiac: lastEntry?.skinfolds?.suprailiac ?? 10,
    thigh: lastEntry?.skinfolds?.thigh ?? 10,
    abdominal: lastEntry?.skinfolds?.abdominal ?? 10,
    pectoral: lastEntry?.skinfolds?.pectoral ?? 10,
    midaxillary: lastEntry?.skinfolds?.midaxillary ?? 10,
    subscapular: lastEntry?.skinfolds?.subscapular ?? 10,
  },
  foldsCount: lastEntry?.foldsCount ?? 3,
})

const submittedValues = ref<InputDataNotNull>(initialValues.value)

const resolver = zodResolver(
  z.object({
    date: z.coerce.string(),
    age: z.coerce
      .number()
      .min(0, 'Age must be a positive number')
      .max(150, 'Age must be less than 150'),
    gender: z.enum([Gender.Male, Gender.Female], 'Invalid gender'),
    weight: z.coerce.number().min(0, 'Weight must be a positive number'),
    foldsCount: z
      .number()
      .int()
      .refine((value) => [3, 4, 7].includes(value), 'Number of folds must be 3, 4, or 7'),
    skinfolds: z.object({
      triceps: z.number().min(0).optional().nullable(),
      suprailiac: z.number().min(0).optional().nullable(),
      thigh: z.number().min(0).optional().nullable(),
      abdominal: z.number().min(0).optional().nullable(),
      pectoral: z.number().min(0).optional().nullable(),
      midaxillary: z.number().min(0).optional().nullable(),
      subscapular: z.number().min(0).optional().nullable(),
    }),
  }),
)

const onFormSubmit = (event: FormSubmitEvent) => {
  if (Object.keys(event.errors).length === 0) {
    submittedValues.value = event.values as InputDataNotNull

    const formattedDate =
      new Date(submittedValues.value.date).toISOString().split('T')[0] ??
      new Date(submittedValues.value.date).toISOString()
    submittedValues.value.date = formattedDate
    // add to store
    foldEntriesStore.insertEntry(submittedValues.value)
  }
}

// Update manually from sub component
const updateFoldsCount = (newVal: number) => {
  formRef.value?.setFieldValue('foldsCount', newVal)
}

const genderOptions = Object.values(Gender).map((g) => ({
  label: formatLabel(g),
  value: g,
}))
</script>

<style>
.p-button-text.p-button-secondary {
  color: var(--color-primary) !important;
}
</style>
