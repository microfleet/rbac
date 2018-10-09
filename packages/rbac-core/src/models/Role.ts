import toRadixTree from 'generate-radix-tree';
import Hyperid from 'hyperid';

const instance = Hyperid({ fixedLength: true, urlSafe: true });

export class Role {
  private opts: RBAC.IRole;
  private tree: any;

  constructor(opts: RBAC.IRole) {
    opts.id = opts.id || instance();
    opts.meta = opts.meta || Object.create(null);

    this.opts = opts;
    this.tree = toRadixTree(opts.permission);
  }

  public addPermission(id: RBAC.IPermission['id']) {
    this.opts.permission.push(id);
  }

  public removePermission(id: RBAC.IPermission['id']) {

  }

  public addMeta(key: string, value: string | boolean | number) {

  }

  public removeMeta(key: string) {

  }
}

export default Role;
