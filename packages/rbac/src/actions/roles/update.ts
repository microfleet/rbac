import { ActionTransport, ServiceRequest } from '@microfleet/core'
import { RBACService } from '../..'
import { RBACServiceAction } from '@microfleet/rbac-agent'
import { TRole } from '@microfleet/rbac-core'

const update: RBACServiceAction =
async function (this: RBACService, request: ServiceRequest): Promise<TRole> {
  const Role = await this.rbac.role.update(request.params.id, request.params)
  return Role.toJSON()
}

update.auth = 'internal'
update.schema = 'input.roles.update'
update.transports = [ActionTransport.amqp, ActionTransport.internal]
update.rbac = {
  actionName: 'roles.update',
  name: 'RBAC Roles Update',
  actionType: ['PATCH'],
}

export default update
