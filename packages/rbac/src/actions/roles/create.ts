import { ActionTransport, ServiceRequest } from '@microfleet/core'
import { RBACService } from '../..'
import { RBACServiceAction } from '@microfleet/rbac-agent'

const create: RBACServiceAction =
async function (this: RBACService, request: ServiceRequest) {
  const Role = await this.rbac.role.create(request.params)
  return Role.toJSON()
}

create.auth = 'internal'
create.schema = 'input.roles.create'
create.transports = [ActionTransport.amqp, ActionTransport.internal]
create.rbac = {
  actionName: 'roles.create',
  name: 'RBAC Roles Creation',
  actionType: ['POST'],
}

export default create
