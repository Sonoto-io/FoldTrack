export class AppError extends Error {
  public readonly cause?: unknown
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    options?: {
      cause?: unknown
      context?: Record<string, unknown>
    },
  ) {
    super(message)

    this.name = 'AppError'
    this.cause = options?.cause
    this.context = options?.context
    this.stack = new Error().stack
  }
}
