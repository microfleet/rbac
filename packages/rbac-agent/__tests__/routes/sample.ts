import { ServiceRequest, ActionTransport } from '@microfleet/core'
import { RBACServiceAction } from '../../src'

const action: RBACServiceAction = async function (request: ServiceRequest) {
  return request.params
}

action.transports = [ActionTransport.http]
action.rbac = {
  name: 'Echo Request',
  actionType: ['GET'],
}

export default action
