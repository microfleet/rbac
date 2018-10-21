import path = require('path')
import { Microfleet, ActionTransport } from '@microfleet/core'
import { RBACMemoryStorage, PermissionModel } from '@microfleet/rbac-core'
import { RBACAgent } from '../src'
import { version } from '../package.json'

const serviceName = 'rbac-agent-tets'

let agent: RBACAgent
let service: Microfleet
let permissions: PermissionModel[]

test('init service', () => {
  service = new Microfleet({
    name: serviceName,
    plugins: ['logger', 'validator', 'router', 'http'],
    router: {
      routes: {
        directory: path.resolve(__dirname, './routes'),
        prefix: 'agent',
        transports: [ActionTransport.http],
      },
    },
  })
})

test('creates agent instance', async () => {
  agent = new RBACAgent(service, {
    adapter: RBACMemoryStorage,
    storage: {
      role: '{r}',
      permission: '{p}',
    },
    database: null, /* not required for memory storage */
  })
})

test('initializes service', async () => {
  await service.connect()
})

test('sample action is registered', async () => {
  expect.assertions(5)

  const list = await agent.rbac.permission.list()
  expect(list).toMatchObject({
    cursor: '',
    data: expect.arrayContaining([expect.any(PermissionModel)]),
  })

  permissions = list.data
  expect(permissions).toHaveLength(1)

  const [permission] = permissions
  expect(permission.id()).toBe(`${serviceName}/sample`)
  expect(permission.verbs()).toEqual(['GET'])
  expect(permission.version()).toBe(version)
})
