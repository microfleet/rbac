import { RBACService } from '../src'
import { PermissionModel, RoleModel } from '@microfleet/rbac-core'

let service: RBACService

afterAll(async () => {
  if (service) {
    await service.redis.flushdb()
    await service.close()
  }
})

test('initializes service', () => {
  service = new RBACService()
})

test('starts service', async () => {
  expect.assertions(1)
  await expect(service.connect()).resolves.toBeTruthy()
})

test('correctly enumerates all routes', async () => {
  expect.assertions(2)

  const permissions = await service.rbac.permission.list()

  expect(permissions).toMatchObject({
    cursor: expect.stringMatching(/^[0-9]+$/),
    data: expect.arrayContaining([expect.any(PermissionModel)]),
  })

  expect(permissions.data).toHaveLength(7)
})

test('correctly returns scaffoled roles', async () => {
  expect.assertions(2)

  const roles = await service.rbac.role.list()

  expect(roles).toMatchObject({
    cursor: expect.stringMatching(/^[0-9]+$/),
    data: expect.arrayContaining([expect.any(RoleModel)]),
  })

  expect(roles.data).toHaveLength(4)
})
