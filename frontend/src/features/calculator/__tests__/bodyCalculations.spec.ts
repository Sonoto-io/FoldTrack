import type { FoldsMeasurements, InputDataNotNull } from './calculator.types'
import { expect, test } from 'vitest'
import { skinfoldsSum, calculateBodyComposition } from '../calculator.service'
import { Gender } from '../calculator.enum'
describe('skinfoldsSum', () => {
  test('should return the sum of 2 folds values', () => {
    expect(skinfoldsSum({ triceps: 1, suprailiac: 2 }, ['triceps', 'suprailiac'])).toBe(3)
  })

  test('should return the sum of 7 folds values', () => {
    expect(
      skinfoldsSum(
        {
          triceps: 1,
          suprailiac: 2,
          thigh: 3,
          abdominal: 4,
          midaxillary: 5,
          pectoral: 6,
          subscapular: 7,
        },
        ['triceps', 'suprailiac', 'thigh', 'abdominal', 'midaxillary', 'pectoral', 'subscapular'],
      ),
    ).toBe(28)
  })

  test('should return 0 for an empty folds list', () => {
    expect(skinfoldsSum({ triceps: 1, suprailiac: 2 }, [])).toBe(0)
  })

  test('should return 0 if the fold list in incorrect', () => {
    expect(skinfoldsSum({ triceps: 1 }, ['test'])).toBe(0)
  })
})

describe('calculateBodyComposition', () => {
  const testValues: InputDataNotNull = {
    age: 30,
    gender: Gender.Female,
    weight: 70,
    skinfolds: {
      triceps: 10,
      suprailiac: 10,
      thigh: 10,
      abdominal: 10,
      pectoral: 10,
      midaxillary: 10,
      subscapular: 10,
    },
    foldsCount: 3,
  }

  test('should calculate body composition for a female with 3 folds', () => {
    expect(calculateBodyComposition(testValues)).toBeCloseTo(13.66, 2)
  })

  // 4 folds is less precise
  test('should calculate body composition for a female with 4 folds', () => {
    testValues.foldsCount = 4
    expect(calculateBodyComposition(testValues)).toBeCloseTo(14.15, 1)
  })

  test('should calculate body composition for a female with 7 folds', () => {
    testValues.foldsCount = 7
    expect(calculateBodyComposition(testValues)).toBeCloseTo(15.66, 2)
  })

  test('should calculate body composition for a male with 3 folds', () => {
    testValues.gender = 'male'
    testValues.foldsCount = 3
    expect(calculateBodyComposition(testValues)).toBeCloseTo(9.06, 2)
  })

  // 4 folds is less precise
  test('should calculate body composition for a male with 4 folds', () => {
    testValues.foldsCount = 4
    testValues.gender = 'male'
    expect(calculateBodyComposition(testValues)).toBeCloseTo(9.88, 1)
  })

  test('should calculate body composition for a male with 7 folds', () => {
    testValues.foldsCount = 7
    testValues.gender = 'male'
    expect(calculateBodyComposition(testValues)).toBeCloseTo(10.21, 2)
  })
})
