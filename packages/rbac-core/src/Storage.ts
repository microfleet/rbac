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
import { kConflict, kNotFound } from './Errors';

interface IStorageFilter {
  prefix?: string;
}

class RBACMemoryStorage implements IRBACStorage {
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

      throw e;
    }
  }

  public async create(id: string, datum: any) {
    assert.equal(await this.exists(id), false, kConflict);
    return this.storage.put(id, datum);
  }

  public async update(id: string, datum: any) {
    const original = await this.read(id);
    return this.storage.put(id, merge(original, datum));
  }

  public async remove(id: string) {
    return this.storage.del(id);
  }

  public async list(filter: IStorageFilter, cursor?: string) {
    throw new Error('not implemented');
  }

  private async exists(id: string) {
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
