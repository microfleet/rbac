import findMyWay = require('find-my-way');
import Hyperid = require('hyperid');

const noop = () => {/* do nothing */};
const instance = Hyperid({ fixedLength: true, urlSafe: true });

interface IPermissionLike {
  id: RBAC.IPermission['id'];
  actionType: Array<RBAC.IPermission['actionType']>;
}

export class Role {
  private opts: RBAC.IRole;
  private router: any;

  constructor(opts: RBAC.IRole) {
    opts.id = opts.id || instance();
    this.opts = opts;
    this.router = findMyWay();

    for (const [id, actionType] of Object.entries(this.opts.permissions)) {
      this.addPermission({ id, actionType });
    }
  }

  public id(): string {
    return this.opts.id as string;
  }

  public addPermission(permission: IPermissionLike) {
    this.router.on(permission.actionType, permission.id, noop);
  }

  public removePermission(permission: IPermissionLike) {
    this.router.off(permission.actionType, permission.id);
  }

  public matchesPermission(id: RBAC.IPermission['id'], method: string = 'GET'): boolean {
    return this.router.find(method, id.replace(/\./g, '/')) !== null;
  }

  public addMeta(key: string, value: string | boolean | number) {
    this.opts.meta[key] = value;
  }

  public removeMeta(key: string) {
    delete this.opts.meta[key];
  }

  public toJSON(): RBAC.IRole {
    return Object.assign({}, this.opts);
  }
}

export default Role;
