import { RBACService } from '@microfleet/rbac'
import * as M from '@microfleet/core'
import { resolve } from 'path'
import { RBACAgent } from '@microfleet/rbac-agent'
import { RemoteStorage, defaultRolesRoutingTable, defaultPermissionsRoutingTable } from '../src'
import AMQPTransport = require('@microfleet/transport-amqp')
import { amqp as amqpConfig } from './configs/test'

const serviceName = 'rbac-agent-tets'

let rbac: RBACService
let service: M.Microfleet & M.RouterPlugin & M.LoggerPlugin & M.ValidatorPlugin
let agent: RBACAgent
let amqp: any

afterAll(async () => {
  if (service) {
    await service.redis.flushdb()
    await service.close()
  }

  if (rbac) {
    await rbac.close()
  }
})

beforeAll(async () => {
  rbac = new RBACService()
  await rbac.connect()
})

beforeAll(async () => {
  service = new M.Microfleet({
    name: serviceName,
    plugins: ['logger', 'validator', 'router'],
    router: {
      routes: {
        directory: resolve(__dirname, './routes'),
        prefix: 'agent',
        setTransportsAsDefault: true,
        transports: [M.ActionTransport.internal],
      },
      extensions: {
        enabled: [
          'preRequest', 'postRequest', 'postAuth', 'preResponse',
        ],
      },
    },
  }) as any

  amqp = await AMQPTransport.connect(amqpConfig.transport)
  agent = new RBACAgent(service, {
    adapter: RemoteStorage,
    storage: {
      role: 'rbac.roles',
      permission: 'rbac.permissions',
    },
    database: {
      role: {
        amqp,
        routingTable: defaultRolesRoutingTable,
      },
      permission: {
        amqp,
        routingTable: defaultPermissionsRoutingTable,
      },
    },
  })

  await service.connect()
})

test('remote storage returns list of roles', async () => {

})
