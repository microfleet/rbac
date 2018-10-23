import { ServiceRequest } from '@microfleet/core'
import { RBACServiceAction } from '../../src'

const action: RBACServiceAction = async function (request: ServiceRequest) {
  return request.params
}

action.rbac = {
  name: 'Echo Request',
  actionType: ['GET'],
}

export = action
