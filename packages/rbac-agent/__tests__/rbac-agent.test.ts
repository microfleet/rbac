import path = require('path')
import * as M from '@microfleet/core'
import { RBACMemoryStorage, PermissionModel, RoleModel, TRole } from '@microfleet/rbac-core'
import { RBACAgent } from '../src'
import { version } from '../package.json'

const serviceName = 'rbac-agent-tets'

let agent: RBACAgent
let service: M.Microfleet & M.RouterPlugin & M.LoggerPlugin & M.ValidatorPlugin
let permissions: PermissionModel[]
let viewerRoleId: string

beforeAll(async () => {
  service = new M.Microfleet({
    name: serviceName,
    plugins: ['logger', 'validator', 'router'],
    router: {
      routes: {
        directory: path.resolve(__dirname, './routes'),
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

  agent = new RBACAgent(service, {
    adapter: RBACMemoryStorage,
    storage: {
      role: '{r}',
      permission: '{p}',
    },
    database: null, /* not required for memory storage */
  })

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

test('initializes default read anything role', async () => {
  expect.assertions(3)
  const role: TRole = {
    name: 'Viewer',
    permissions: {
      '*': ['GET'],
    },
    meta: {},
  }

  const model = await agent.rbac.role.create(role)
  await expect(model).toBeInstanceOf(RoleModel)

  expect(model.id()).toBeTruthy()
  expect(model.matchesPermission(permissions[0].id())).toBe(true)

  viewerRoleId = model.id()
})

test('expect viewer model to match sample action', async () => {
  expect.assertions(1)

  /* only 1 action, so works */
  const [action] = Object.values(service.router.routes[M.ActionTransport.internal])
  await expect(agent.match([viewerRoleId], action)).resolves.toEqual(true)
})

test('expect sample request to succeed', async () => {
  expect.assertions(1)
  const request: Partial<M.ServiceRequest> = {
    auth: {
      roles: [viewerRoleId],
    },
    params: {
      echo: true,
    },
  }

  await expect(service.dispatch('sample', request))
    .resolves.toEqual({ echo: true })
})

test('update viewer role and remove GET access', async () => {
  expect.assertions(1)

  await agent.rbac.role.update(viewerRoleId, {
    permissions: { '*': [] },
  })

  await agent.syncRoles()

  /* only 1 action, so works */
  const [action] = Object.values(service.router.routes[M.ActionTransport.internal])
  await expect(agent.match([viewerRoleId], action)).resolves.toEqual(false)
})

test('expect sample request to fail', async () => {
  expect.assertions(1)
  const request: Partial<M.ServiceRequest> = {
    auth: {
      roles: [viewerRoleId],
    },
    params: {
      echo: true,
    },
  }

  await expect(service.dispatch('sample', request))
    .rejects.toThrow('[rbac] access denied')
})

test('remove viewer role', async () => {
  expect.assertions(1)

  await agent.rbac.role.remove(viewerRoleId)
  await agent.syncRoles()

  /* only 1 action, so works */
  const [action] = Object.values(service.router.routes[M.ActionTransport.internal])
  await expect(agent.match([viewerRoleId], action)).resolves.toEqual(false)
})

afterAll(async () => {
  if (service) await service.close()
})
