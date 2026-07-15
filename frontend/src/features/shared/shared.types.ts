import type { Gender } from './shared.enum'
export interface BodyCompositionEntry {
  date: string
  age: number
  gender: Gender
  weight: number
  skinfolds: FoldsMeasurements
  foldsCount: number
  bodyFatPercentage: number
}

export interface ErrorConstructor {
  captureStackTrace(thisArg: any, func: any): void
}

export interface BodyCompositionEntrySelect extends BodyCompositionEntry {
  user_id: string
  id: string
}

export interface BodyCompositionEntryInsert extends BodyCompositionEntry {
  user_id: string
}

export interface FoldsMeasurements {
  triceps: number | null
  suprailiac: number | null
  thigh: number | null
  abdominal: number | null
  pectoral: number | null
  midaxillary: number | null
  subscapular: number | null
}
