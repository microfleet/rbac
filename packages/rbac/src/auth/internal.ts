/**
 * Sets default roles to all requests
 * that are flowing from .internal or .amqp transport
 */

import { RBACService } from '..'
import { ServiceRequest, ActionTransport } from '@microfleet/core'

export function internalAuthStrategy(this: RBACService, request: ServiceRequest) {
  switch (request.transport) {
    case ActionTransport.amqp:
    case ActionTransport.internal:
      request.auth = {
        roles: [...this.config.defaultInternalRoles],
      }
      break

    default:
      request.auth = null
  }
}

export default internalAuthStrategy
