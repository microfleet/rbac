/**
 * Contains implementation of a `permission` primitive
 */

import assert = require('assert');
import semver from 'semver';

class Permission {
  public static async register(opts: IMicrofleetPermission, storage: RBAC.IStorage) {

  }

  public id: string;
  public reserved: boolean;
  public name: string;
  public deprecated: boolean;
  public version: string;

  constructor(opts: IMicrofleetPermission) {
    this.id = opts.id;
    this.reserved = opts.reserved;
    this.name = opts.name;
    this.deprecated = opts.deprecated;
    this.version = opts.version;
  }
}

export default Permission;
