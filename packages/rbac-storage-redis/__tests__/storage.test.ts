import Redis = require('ioredis')
import { RedisStorage } from '../src'
import { TPermission, Errors } from '@microfleet/rbac-core'

const { kConflict, kInvalidFormat, kNotFound, kVersionLow } = Errors
let storage: RedisStorage<TPermission>

const permissionSample: TPermission = {
  actionType: ['GET', 'POST', 'PATCH', 'DELETE'],
  deprecated: false,
  id: 'sample',
  name: 'Sample Permission',
  reserved: false,
  version: '1.0.0',
}

const redis = new Redis({
  sentinels: [{
    host: 'redis-sentinel',
    port: 26379,
  }],
  keyPrefix: 'rbr!',
  name: 'mservice',
  lazyConnect: true,
})

beforeAll(async () => {
  await redis.connect()
})

beforeEach(async () => {
  storage = new RedisStorage(redis, 'perm')
  await storage.create(permissionSample.id, permissionSample)
})

afterEach(async () => {
  await redis.flushdb()
})

afterAll(async () => {
  await redis.quit()
})

describe('exists+read+create', () => {
  test('exists returns false for non-existent value', async () => {
    expect.assertions(1)
    await expect(storage.exists('oops')).resolves.toEqual(false)
  })

  test('exists returns true for non-existent value', async () => {
    expect.assertions(1)
    await expect(storage.exists(permissionSample.id)).resolves.toEqual(true)
  })

  test('reading non-existent value returns 404', async () => {
    expect.assertions(1)
    await expect(storage.read('oops')).rejects.toThrow(kNotFound)
  })

  test('reading stored value returns it', async () => {
    expect.assertions(1)
    await expect(storage.read(permissionSample.id))
      .resolves.toEqual(permissionSample)
  })

  test('creating over existing value throws 409', async () => {
    expect.assertions(1)
    await expect(storage.create(permissionSample.id, permissionSample))
      .rejects.toThrow(kConflict)
  })

  test('creating new value succeeds', async () => {
    expect.assertions(1)
    await expect(storage.create('new-id', permissionSample))
      .resolves.toEqual(permissionSample)
  })
})

describe('update', () => {
  test('updating non-existing entity fails', async () => {
    expect.assertions(1)
    await expect(storage.update('yadayada', permissionSample))
      .rejects.toThrow(kNotFound)
  })

  test('updating to invalid format fails', async () => {
    expect.assertions(1)
    await expect(storage.update(permissionSample.id, 'nope'))
      .rejects.toThrow(kInvalidFormat.message)
  })

  test('updating existing entity succeeds and returns new value', async () => {
    expect.assertions(1)
    await expect(storage.update(permissionSample.id, { deprecated: true }))
      .resolves.toEqual({
        ...permissionSample,
        deprecated: true,
      })
  })
})

describe('patch', () => {
  test('updating non-existing entity makes upsert', async () => {
    expect.assertions(1)
    await expect(storage.patch('yadayada', permissionSample))
      .resolves.toEqual(permissionSample)
  })

  test('updating to invalid format fails', async () => {
    expect.assertions(1)
    await expect(storage.patch(permissionSample.id, 'nope'))
      .rejects.toThrow(kInvalidFormat.message)
  })

  test('updating existing data to lower version fails with soft error', async () => {
    expect.assertions(1)
    await expect(storage.patch(permissionSample.id, { version: '0.9.9', deprecated: true }))
      .rejects.toThrow(kVersionLow)
  })

  test('updating existing data to new version succeeds', async () => {
    expect.assertions(1)
    await expect(storage.patch(permissionSample.id, { version: '1.0.1' }))
      .resolves.toEqual({
        ...permissionSample,
        version: '1.0.1',
      })
  })
})

describe('remove', () => {
  test('removing non-existing entity doesnt throw', async () => {
    expect.assertions(1)
    await expect(storage.remove('yadayada')).resolves.toBeUndefined()
  })

  test('removing existing entity doesnt throw', async () => {
    expect.assertions(2)
    await expect(storage.remove(permissionSample.id)).resolves.toBeUndefined()
    await expect(storage.exists(permissionSample.id)).resolves.toBe(false)
  })
})

describe('list', () => {
  test('returns 1 item thats in the storage', async () => {
    expect.assertions(1)
    await expect(storage.list({})).resolves.toEqual({
      cursor: '0',
      data: [permissionSample],
    })
  })
})
