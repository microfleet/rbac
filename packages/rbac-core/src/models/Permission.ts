import assert = require('assert');
import semver from 'semver';
import { kNotSemver } from '../Errors';

export class Permission {
  public static prepare(opts: RBAC.IPermissionRegister, reserved: boolean = false) {
    const params = {
      actionType: opts.actionType || [...Permission.ActionTypes],
      deprecated: opts.deprecated,
      id: `${opts.serviceName}/${opts.value.replace(/\./g, '/')}`,
      name: opts.name,
      reserved,
      version: opts.version,
    };

    return new Permission(params);
  }

  private static ActionTypes: RBAC.ActionType[] = ['GET', 'POST', 'PATCH', 'DELETE'];
  private opts: RBAC.IPermission;

  constructor(opts: RBAC.IPermission) {
    assert(semver.valid(opts.version), kNotSemver);
    this.opts = opts;
  }

  public id(): string {
    return this.opts.id;
  }

  public version(): string {
    return this.opts.version;
  }

  public verbs(): RBAC.ActionType[] {
    return this.opts.actionType || [...Permission.ActionTypes];
  }

  public toJSON(): RBAC.IPermission {
    return Object.assign({}, this.opts);
  }
}

export default Permission;
