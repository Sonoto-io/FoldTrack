import type { FoldsMeasurements } from '@/features/shared/shared.types'
import { Gender } from '@/features/shared/shared.enum'

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
