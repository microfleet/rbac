import { resolve } from 'path'

/**
 * Default name of the service
 */
export const name = 'rbac'

/**
 * Enables plugins. This is a minimum list
 */
// prettier-ignore
export const plugins = [
  'validator',
  'logger',
  'router',
  'amqp',
  'redisSentinel',
]

/**
 * Bunyan logger configuration
 * by default only ringBuffer logger is enabled in prod
 */
export const logger = {
  debug: process.env.NODE_ENV === 'development',
  defaultLogger: true,
}

/**
 * Local schemas for validation
 */
export const validator = {
  ajv: {
    $meta: 'ms-validation AJV schema validator options',
    useDefaults: true,
    validateSchema: 'log',
  },
  schemas: [resolve(__dirname, '../../schemas')],
}
