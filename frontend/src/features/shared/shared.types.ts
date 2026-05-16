import type { Gender } from '../calculator/calculator.enum'
import type { FoldsMeasurements } from '../calculator/calculator.types'

export interface BodyCompositionEntry {
  date: string
  age: number
  gender: Gender
  weight: number
  skinfolds: FoldsMeasurements
  foldsCount: number
  bodyFatPercentage: number
}
