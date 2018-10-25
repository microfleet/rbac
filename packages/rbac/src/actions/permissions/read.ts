import { ActionTransport, ServiceRequest } from '@microfleet/core'
import { RBACService } from '../..'
import { RBACServiceAction } from '@microfleet/rbac-agent'
import { TPermission } from '@microfleet/rbac-core'

const read: RBACServiceAction =
async function (this: RBACService, request: ServiceRequest): Promise<TPermission> {
  const Permission = await this.rbac.permission.read(request.params.id)
  return Permission.toJSON()
}

read.auth = 'internal'
read.schema = 'input.permissions.read'
read.transports = [ActionTransport.amqp, ActionTransport.internal]
read.rbac = {
  actionName: 'permissions.read',
  name: 'RBAC Permission Read',
  actionType: ['GET'],
}

export default read
