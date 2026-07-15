import type { InputDataNotNull } from './calculator.types'
import type { FoldsMeasurements } from '@/features/shared/shared.types'

export const skinfoldsSum = (
  skinfolds: FoldsMeasurements,
  foldsList: Array<keyof FoldsMeasurements>,
) => {
  return foldsList.reduce((sum, fold) => {
    return sum + (skinfolds[fold] ?? 0)
  }, 0)
}

const femaleCalculate3Folds = (inputData: InputDataNotNull) => {
  const sum = skinfoldsSum(inputData.skinfolds, ['triceps', 'suprailiac', 'thigh'])
  return 1.0994921 - 0.0009929 * sum + 0.0000023 * sum ** 2 - 0.0001392 * inputData.age
}

const femaleCalculate4Folds = (inputData: InputDataNotNull) => {
  const sum = skinfoldsSum(inputData.skinfolds, ['triceps', 'suprailiac', 'thigh', 'abdominal'])
  return 0.29669 * sum - 0.00043 * sum + 0.02963 * inputData.age + 1.4072
}

const femaleCalculate7Folds = (inputData: InputDataNotNull) => {
  const sum = skinfoldsSum(inputData.skinfolds, [
    'triceps',
    'suprailiac',
    'thigh',
    'abdominal',
    'midaxillary',
    'pectoral',
    'subscapular',
  ])
  return 1.097 - 0.00046971 * sum + 0.00000056 * sum ** 2 - 0.00012828 * inputData.age
}

const maleCalculate3Folds = (inputData: InputDataNotNull) => {
  const sum = skinfoldsSum(inputData.skinfolds, ['pectoral', 'thigh', 'abdominal'])
  return 1.10938 - 0.0008267 * sum + 0.0000016 * sum ** 2 - 0.0002574 * inputData.age
}

const maleCalculate4Folds = (inputData: InputDataNotNull) => {
  const sum = skinfoldsSum(inputData.skinfolds, ['triceps', 'suprailiac', 'thigh', 'abdominal'])
  return 0.29288 * sum - 0.0005 * sum ** 2 + 0.15845 * inputData.age - 5.76377
}

const maleCalculate7Folds = (inputData: InputDataNotNull) => {
  const sum = skinfoldsSum(inputData.skinfolds, [
    'triceps',
    'suprailiac',
    'thigh',
    'abdominal',
    'midaxillary',
    'pectoral',
    'subscapular',
  ])
  return 1.112 - 0.00043499 * sum + 0.00000055 * sum ** 2 - 0.00028826 * inputData.age
}

const calculateBodyDensity: (inputData: InputDataNotNull) => number | undefined = (
  inputData: InputDataNotNull,
) => {
  if (inputData.gender === 'female') {
    switch (inputData.foldsCount) {
      case 3:
        return femaleCalculate3Folds(inputData)
      case 7:
        return femaleCalculate7Folds(inputData)
      default:
        throw new Error('Invalid number of folds')
    }
  } else if (inputData.gender === 'male') {
    switch (inputData.foldsCount) {
      case 3:
        return maleCalculate3Folds(inputData)
      case 7:
        return maleCalculate7Folds(inputData)
      default:
        throw new Error('Invalid number of folds')
    }
  }
}

export const calculateBodyComposition = (inputData: InputDataNotNull) => {
  if (inputData.foldsCount === 4) {
    switch (inputData.gender) {
      case 'male':
        return maleCalculate4Folds(inputData)
      case 'female':
        return femaleCalculate4Folds(inputData)
      default:
        throw new Error('Invalid gender')
    }
  }
  const bodyDensity = calculateBodyDensity(inputData)
  if (bodyDensity === undefined || bodyDensity === 0) {
    return 0
  }

  // Body density formula doesn't exist for 4 folds, only body composition, so we need to calculate it separately

  return 495 / bodyDensity - 450
}
