import assert = require('assert');
import semver from 'semver';
import { kNotSemver } from '../Errors';
import { IPermission, IPermissionRegister, RBACActionType } from '../interfaces';

export class Permission {
  public static prepare(opts: IPermissionRegister, reserved: boolean = false) {
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

  private static ActionTypes: RBACActionType[] = ['GET', 'POST', 'PATCH', 'DELETE'];
  private opts: IPermission;

  constructor(opts: IPermission) {
    assert(semver.valid(opts.version), kNotSemver);
    this.opts = opts;
  }

  public id(): string {
    return this.opts.id;
  }

  public version(): string {
    return this.opts.version;
  }

  public verbs(): RBACActionType[] {
    return this.opts.actionType || [...Permission.ActionTypes];
  }

  public toJSON(): IPermission {
    return Object.assign({}, this.opts);
  }
}

export default Permission;
