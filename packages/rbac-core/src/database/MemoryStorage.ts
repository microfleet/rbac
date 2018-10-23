/**
 * This file contains memory storage for development of rbac
 * It also defines abstract interface, all other storages must conform to it
 */

import assert = require('assert')
import semver = require('semver')
import { kConflict, kInvalidFormat, kNotFound, kVersionLow } from '../Errors'
import { Storage, StorageFilter, StorageList } from '../interfaces'
import { LevelUp } from 'levelup'
import mergeWith = require('lodash.mergewith')
import S2A from './stream-to-async'

export interface StorageChunk {
  key: string
  value: any
}

export class RBACMemoryStorage<T> implements Storage<T> {
  private readonly storage: LevelUp
  private readonly merge: typeof mergeWith

  constructor() {
    const mem = require('level-mem')

    this.merge = require('lodash.mergewith')
    this.storage = mem(`rbac:memory:${Date.now()}`, { valueEncoding: 'json' })
  }

  public async close() {
    await this.storage.close()
  }

  public async read(id: string) {
    try {
      return await this.storage.get(id)
    } catch (e) {
      if (e.notFound) {
        throw kNotFound
      }

      return Promise.reject(e)
    }
  }

  public async create(id: string, datum: T) {
    if (await this.exists(id)) {
      throw kConflict
    }

    await this.storage.put(id, datum)
    return datum
  }

  public async update(id: string, datum: Partial<T>) {
    assert(datum && typeof datum === 'object', kInvalidFormat)

    const original = await this.read(id)
    const update = this.merge(original, datum, (_, srcValue) => {
      if (Array.isArray(srcValue)) {
        return srcValue
      }

      return undefined
    })
    await this.storage.put(id, update)

    return update
  }

  public async patch(id: string, datum: any) {
    assert(datum && typeof datum === 'object', kInvalidFormat)
    assert(semver.valid(datum.version), kInvalidFormat)
    let update = datum

    try {
      const original = await this.read(id)
      if (!semver.gte(datum.version, original.version)) {
        throw kVersionLow
      }
      update = this.merge(original, datum)
    } catch (e) {
      if (e !== kNotFound) {
        throw e
      }
    }

    await this.storage.put(id, update)

    return update
  }

  public async remove(id: string) {
    return this.storage.del(id)
  }

  public async list(filter: StorageFilter = {}): Promise<StorageList<T>> {
    const {
      limit = 20,
    } = filter

    const response: StorageList<T> = {
      cursor: '',
      data: [],
    }

    const stream = this.storage.createReadStream({ limit })

    for await (const chunk of new S2A(stream)) {
      const { key, value } = chunk as any as StorageChunk
      response.cursor = key
      response.data.push(value)
    }

    if (response.data.length < limit) {
      response.cursor = ''
    }

    return response
  }

  public async exists(id: string) {
    try {
      await this.storage.get(id)
      return true
    } catch (e) {
      if (e.notFound) {
        return false
      }

      throw e
    }
  }
}

export default RBACMemoryStorage
