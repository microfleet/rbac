import { ActionTransport, routerExtension } from '@microfleet/core'
import { resolve } from 'path'
import { internalAuthStrategy } from '../auth/internal'

/**
 * This extension defaults schemas to the name of the action
 */
const autoSchema = routerExtension('validate/schemaLessAction')

/**
 * Provides audit log for every performed action
 */
const auditLog = routerExtension('audit/log')

/**
 * Specifies configuration for the router of the microservice
 */
export const router = {
  extensions: {
    enabled: ['preRequest', 'postRequest', 'postAuth', 'preResponse'],
    register: [autoSchema, auditLog],
  },
  routes: {
    directory: resolve(__dirname, '../actions'),
    prefix: 'rbac',
    transports: [ActionTransport.amqp, ActionTransport.internal],
  },
  auth: {
    strategies: {
      internal: internalAuthStrategy,
    },
  },
}
