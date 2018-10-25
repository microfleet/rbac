import { ActionTransport, ServiceRequest } from '@microfleet/core'
import { RBACService } from '../..'
import { RBACServiceAction } from '@microfleet/rbac-agent'

const register: RBACServiceAction =
async function (this: RBACService, request: ServiceRequest) {
  const Permission = await this.rbac.permission.register({
    ...request.params,
    reserved: false,
  })

  return Permission.toJSON()
}

register.auth = 'internal'
register.schema = 'input.permissions.register'
register.transports = [ActionTransport.amqp, ActionTransport.internal]
register.rbac = {
  actionName: 'permissions.register',
  name: 'RBAC Permission Registration',
  actionType: ['POST'],
}

export default register
