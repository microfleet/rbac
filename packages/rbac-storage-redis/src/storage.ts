import { Errors, IStorage, IStorageFilter, IStorageList } from '@microfleet/rbac-core';
import assert = require('assert');
import { Redis } from 'ioredis';
import semver = require('semver');

interface IKV {
  [key: string]: string;
}

export class RedisStorage<T> implements IStorage<T> {
  private storage: Redis;
  private db: string;
  private readonly index: string;

  constructor(redis: Redis, db: string) {
    this.storage = redis;
    this.db = db;
    this.index = this.key('s');
  }

  public async exists(id: string) {
    return await this.storage.sismember(this.index, id) === 1;
  }

  public async read(id: string) {
    const [exists, datum] = await Promise.all([
      this.exists(id),
      this.storage.hgetall(this.hash(id)).then(this.deserialize),
    ]);

    if (exists === false) {
      throw Errors.kNotFound;
    }

    return datum;
  }

  public async create(id: string, datum: T) {
    if (await this.exists(id) === true) {
      throw Errors.kConflict;
    }

    await Promise.all([
      this.storage.sadd(this.index, id),
      this.storage.hmset(this.hash(id), this.serialize(datum)),
    ]);

    return datum;
  }

  public async update(id: string, datum: any) {
    assert(datum && typeof datum === 'object', Errors.kInvalidFormat);
    const key = this.hash(id);

    // updated datum
    const [, [err, response]] = await this.storage.pipeline()
      .hmset(key, this.serialize(datum))
      .hgetall(key)
      .exec();

    if (err) {
      throw err;
    }

    return this.deserialize(response);
  }

  // TODO: rework with lua, so that on update we verify
  // that previous version in the database is still relevant
  public async patch(id: string, datum: any): Promise<T> {
    assert(datum && typeof datum === 'object', Errors.kInvalidFormat);
    assert(semver.valid(datum.version), Errors.kInvalidFormat);

    let original;
    try {
      original = await this.read(id);
      if (semver.gte(datum.version, (original as any).version) === false) {
        throw Errors.kVersionLow;
      }
    } catch (e) {
      if (e !== Errors.kNotFound) {
        throw e;
      }
    }

    await this.storage.hmset(this.hash(id), this.serialize(datum));

    return Object.assign({}, original, datum);
  }

  public async remove(id: string) {
    await Promise.all([
      this.storage.del(this.hash(id)),
      this.storage.srem(this.index, id),
    ]);
  }

  public async list(filter: IStorageFilter): Promise<IStorageList<T>> {
    const { prefix } = filter;

    const response: IStorageList<T> = {
      cursor: '0',
      data: [],
    };

    const stream = this.storage.sscanStream(this.index, {
      count: 10,
      match: prefix,
    }) as any as NodeJS.ReadStream;

    const workers = [];
    for await (const id of stream) {
      workers.push((
        this.storage
          .hgetall(this.hash(id as string))
          .then(this.deserialize)
      ));
    }

    response.data = await Promise.all(workers);

    return response;
  }

  private key(id: string) {
    return `${this.db}!${id}`;
  }

  private hash(id: string) {
    return `${this.hash}:${id}`;
  }

  private serialize(datum: T): IKV {
    const serialized = Object.create(null);
    for (const [key, value] of Object.entries(datum)) {
      serialized[key] = JSON.stringify(value);
    }
    return serialized;
  }

  private deserialize(datum: IKV): T {
    const deserialized = Object.create(null);
    for (const [key, value] of Object.entries(datum)) {
      deserialized[key] = JSON.parse(value);
    }
    return deserialized;
  }
}
