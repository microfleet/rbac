/**
 * This file contains memory storage for development of rbac
 * It also defines abstract interface, all other storages must conform to it
 */
import assert = require('assert');
import encode from 'encoding-down';
import levelup from 'levelup';
import { LevelUp } from 'levelup';
import merge = require('lodash.merge');
import memdown from 'memdown';
import semver from 'semver';
import { kConflict, kNotFound, kVersionLow } from '../Errors';

type RBACData = RBAC.IPermission;

class RBACMemoryStorage implements RBAC.IStorage<RBACData> {
  private storage: LevelUp;

  constructor() {
    this.storage = levelup(encode(memdown(), { valueEncoding: 'json' }));
  }

  public async read(id: string) {
    try {
      return await this.storage.get(id);
    } catch (e) {
      if (e.notFound) {
        throw kNotFound;
      }

      return Promise.reject(e);
    }
  }

  public async create(id: string, datum: RBACData) {
    assert.equal(await this.exists(id), false, kConflict);
    return this.storage.put(id, datum);
  }

  public async update(id: string, datum: RBACData) {
    const original = await this.read(id);
    const update = merge(original, datum);

    await this.storage.put(id, update);

    return update;
  }

  public async patch(id: string, version: string, datum: RBACData) {
    let update = datum;

    try {
      const original = await this.read(id);
      assert(semver.gte(version, original), kVersionLow);
      update = merge(original, datum);
    } catch (e) {
      if (e !== kNotFound) {
        throw e;
      }
    }

    await this.storage.put(id, update);

    return update;
  }

  public async remove(id: string) {
    return this.storage.del(id);
  }

  public async list(filter: RBAC.IStorageFilter, cursor?: string) {
    throw new Error('not implemented');
  }

  public async exists(id: string) {
    try {
      await this.storage.get(id);
      return true;
    } catch (e) {
      if (e.notFound) {
        return false;
      }

      throw e;
    }
  }
}

export default RBACMemoryStorage;
