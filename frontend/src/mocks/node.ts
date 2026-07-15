import { setupServer } from 'msw/node'
import { authHandlers } from './auth.handlers'

export const server = setupServer(...authHandlers)
