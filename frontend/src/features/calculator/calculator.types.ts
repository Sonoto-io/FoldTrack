import { Gender } from './calculator.enum'

export interface MainInputData {
  date: string | null
  age: number | null
  gender: Gender | null
  weight: number | null
  skinfolds: FoldsMeasurements
  foldsCount: number | null
}

export interface InputDataNotNull {
  date: string
  age: number
  gender: Gender
  weight: number
  skinfolds: FoldsMeasurements
  foldsCount: number
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
