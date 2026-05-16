import { Gender } from '@/features/calculator/calculator.enum'
import type { FoldsMeasurements } from '@/features/calculator/calculator.types'
import type { BodyCompositionEntry } from '@/features/shared/shared.types'

export const skinfoldsExample: FoldsMeasurements = {
  triceps: 10,
  suprailiac: 12,
  thigh: 8,
  abdominal: null,
  pectoral: null,
  midaxillary: null,
  subscapular: null,
}

export const exampleEntries: BodyCompositionEntry[] = [
  {
    date: '2026-01-01',
    weight: 70,
    skinfolds: skinfoldsExample,
    bodyFatPercentage: 15,
    age: 0,
    gender: Gender.Male,
    foldsCount: 0,
  },
  {
    date: '2026-01-15',
    weight: 69,
    skinfolds: skinfoldsExample,
    bodyFatPercentage: 14,
    age: 0,
    gender: Gender.Male,
    foldsCount: 0,
  },
  {
    date: '2026-02-01',
    weight: 68,
    skinfolds: skinfoldsExample,
    bodyFatPercentage: 13,
    age: 0,
    gender: Gender.Male,
    foldsCount: 0,
  },
]
