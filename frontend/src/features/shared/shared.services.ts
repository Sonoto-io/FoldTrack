import { AppError } from './shared.errors'

export const formatLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

export const printError = (err: unknown) => {
  if (err instanceof AppError) {
    console.error('❌', err.message)
    console.error('📦 context:', err.context)
    console.error('🔗 cause:', err.cause)
  } else {
    console.error(err)
  }
}

export const wrapError = (
  message: string,
  err: unknown,
  context?: Record<string, unknown>,
): never => {
  throw new AppError(message, { cause: err, context })
}

export const camelToSnake = (str: string) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}
export const snakeToCamel = (str: string) => {
  return str.replace(/([-_][a-z])/gi, (c) => {
    return c.toUpperCase().replace('-', '').replace('_', '')
  })
}

export const transformToSnake = <T extends Record<string, any>>(obj: T) => {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [camelToSnake(k), v]))
}

export const transformToCamel = <T extends Record<string, any>>(obj: T) => {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [snakeToCamel(k), v]))
}
