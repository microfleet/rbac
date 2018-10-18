import findMyWay = require('find-my-way')
import Hyperid = require('hyperid')
import { PermissionModel, RoleModel } from '../interfaces'

const noop = () => {/* do nothing */}
const instance = Hyperid({ fixedLength: true, urlSafe: true })

interface PermissionLike {
  id: PermissionModel['id']
  actionType: PermissionModel['actionType'][]
}

export class Role {
  private opts: RoleModel
  private router: any

  constructor(opts: RoleModel) {
    opts.id = opts.id || instance()
    this.opts = opts
    this.router = findMyWay()

    for (const [id, actionType] of Object.entries(this.opts.permissions)) {
      this.addPermission({ id, actionType })
    }
  }

  public id(): string {
    return this.opts.id as string
  }

  public addPermission(permission: PermissionLike) {
    this.router.on(permission.actionType, permission.id, noop)
  }

  public removePermission(permission: PermissionLike) {
    this.router.off(permission.actionType, permission.id)
  }

  public matchesPermission(id: PermissionModel['id'], method: string = 'GET'): boolean {
    return this.router.find(method, id.replace(/\./g, '/')) !== null
  }

  public addMeta(key: string, value: string | boolean | number) {
    this.opts.meta[key] = value
  }

  public removeMeta(key: string) {
    delete this.opts.meta[key]
  }

  public toJSON(): RoleModel {
    return Object.assign({}, this.opts)
  }
}

export default Role
