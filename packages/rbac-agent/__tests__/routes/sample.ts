import { ServiceRequest, ActionTransport } from '@microfleet/core'
import { RBACServiceAction } from '../../src'

const action: Partial<RBACServiceAction> = async function (request: ServiceRequest) {
  return request.params
}

action.transports = [ActionTransport.http]

export default action
