/**
 * This file contains memory storage for development of rbac
 * It also defines abstract interface, all other storages must conform to it
 */
import assert = require('assert');
import mem = require('level-mem');
import { LevelUp } from 'levelup';
import merge = require('lodash.merge');
import semver = require('semver');
import { kConflict, kInvalidFormat, kNotFound, kVersionLow } from '../Errors';
import { IStorage, IStorageFilter, IStorageList } from '../interfaces';

interface IStorageChunk {
  key: string;
  value: any;
}

class RBACMemoryStorage<T> implements IStorage<T> {
  private storage: LevelUp;

  constructor() {
    this.storage = mem(`rbac:memory:${Date.now()}`, { valueEncoding: 'json' });
  }

  public async close() {
    await this.storage.close();
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

  public async create(id: string, datum: T) {
    if (await this.exists(id) === true) {
      throw kConflict;
    }

    return this.storage.put(id, datum);
  }

  public async update(id: string, datum: any) {
    assert(datum && typeof datum === 'object', kInvalidFormat);

    const original = await this.read(id);
    const update = merge(original, datum);
    await this.storage.put(id, update);

    return update;
  }

  public async patch(id: string, datum: any) {
    assert(datum && typeof datum === 'object', kInvalidFormat);
    assert(semver.valid(datum.version), kInvalidFormat);
    let update = datum;

    try {
      const original = await this.read(id);
      if (semver.gte(datum.version, original.version) === false) {
        throw kVersionLow;
      }
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

  public async list(filter: IStorageFilter): Promise<IStorageList<T>> {
    const {
      limit = 20,
    } = filter;

    const response: IStorageList<T> = {
      cursor: '',
      data: [],
    };

    const stream = this.storage.createReadStream({ limit });

    for await (const chunk of stream) {
      const { key, value } = chunk as any as IStorageChunk;
      response.cursor = key;
      response.data.push(value);
    }

    if (response.data.length < limit) {
      response.cursor = '';
    }

    return response;
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
