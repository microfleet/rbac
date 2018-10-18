import Bluebird from 'bluebird'
import assert = require('assert')
import { NotSupportedError } from 'common-errors'
import * as M from '@microfleet/core'
import { RBACCore, TPermission, TRole, RBACActionType, RoleModel, Storage, StorageCtor } from '@microfleet/rbac-core'
import { RemoteStorage } from '@microfleet/rbac-storage-remote'
import readPkgUp = require('read-pkg-up')
import get = require('get-value')

export interface RBACActionConfig {
  id?: string
  actionName?: string
  name: string
  deprecated: boolean
  actionType: RBACActionType[]
}

export type RBACServiceAction = M.ServiceAction & {
  rbac?: RBACActionConfig
}

export interface RBACPollingOptions {
  /**
   * Syncronization interval timer
   */
  interval?: number

  /**
   * Randomization factor
   */
  random?: number
}

export interface RBACPluggableAdapter<T> {
  /**
   * Default Storage Adapter to use
   */
  adapter: StorageCtor<T>
}

export interface RBACAgentOptions<T> extends RBACPollingOptions, RBACPluggableAdapter<T> {
  /**
   * Required name of storage databases
   */
  storage: {
    /**
     * Service routes for role
     * storage
     */
    role: string

    /**
     * Service routes for permission
     * storage
     */
    permission: string
  }

  /**
   * Database adapter for remote storage
   */
  database: any
}

export class RBACAgent {
  /**
   * Contains default configuration based on RBACAgentOptions
   */
  private static readonly defaultProps: RBACPollingOptions & RBACPluggableAdapter<any> = {
    interval: 60000,
    random: 1.5,
    adapter: RemoteStorage,
  }

  /**
   * RBAC service adapter
   */
  private readonly rbac: RBACCore

  /**
   * Actions are pulled from the router to
   * be registered in the above mentioned rbac service
   */
  private readonly router: M.MicrofleetRouter

  /**
   * Used to uniquely identify service
   */
  private readonly name: string

  /**
   * ServiceAction version to pass on
   */
  private version: string = '0.0.0'

  /**
   * Every x seconds will fetch updates for roles list
   */
  private syncInterval?: NodeJS.Timer

  /**
   * Local Cache of roles
   */
  private rolesByName: { [id: string]: RoleModel } = Object.create(null)

  /**
   * Configuration options
   */
  private readonly opts: RBACAgentOptions<TPermission | TRole>

  /**
   * initialized AMQP client must be passed
   */
  constructor(service: M.Microfleet, opts: RBACAgentOptions<TPermission | TRole>) {
    assert(service.hasPlugin('router'), new NotSupportedError('router must be enabled'))

    this.opts = Object.assign(RBACAgent.defaultProps, opts)
    this.router = service.router
    this.name = service.config.name

    const StorageAdapter = this.opts.adapter
    const SNamespace = this.opts.database
    const SService = this.opts.storage

    this.rbac = new RBACCore({
      storage: {
        permission: new StorageAdapter(SNamespace, SService.permission) as Storage<TPermission>,
        role: new StorageAdapter(SNamespace, SService.role) as Storage<TRole>,
      },
    })

    service.addConnector(M.ConnectorsTypes.migration, this.init)
  }

  public init = async () => {
    // resolve version
    this.version = await readPkgUp().then(x => x.pkg.version)

    // extract all unique actions
    const serviceActions: Set<RBACServiceAction> = new Set()
    for (const actionsByTransport of Object.values(this.router.routes)) {
      for (const serviceAction of Object.values(actionsByTransport)) {
        serviceActions.add(serviceAction)
      }
    }

    // register all routes
    await Promise.all([
      Bluebird.map(serviceActions, this.register),
      this.syncRoles(),
    ])
  }

  public syncRoles = async () => {
    const { data } = await this.rbac.role.list({ prefix: '' })
    for (const role of data) {
      this.rolesByName[role.id()] = role
    }

    if (this.syncInterval) {
      clearTimeout(this.syncInterval)
    }

    const { interval, random } = this.opts

    const nextTime = getRandomInt((interval as number), (interval as number) * (random as number))
    this.syncInterval = setTimeout(this.syncRoles, nextTime)
    this.syncInterval.unref()
  }

  public async match(roles: string[], action: RBACServiceAction) {
    const id = get(action, 'rbac.id')

    // no id -> rbac not configured -> cant match role
    if (typeof id !== 'string') {
      return false
    }

    for (const roleId of roles) {
      const role = this.rolesByName[roleId]

      // no role -> next
      if (role === undefined) {
        continue
      }

      if (role.matchesPermission(id)) {
        return true
      }
    }

    return false
  }

  public register = async (action: RBACServiceAction) => {
    const { rbac } = action

    // verify that action is rbac compliant
    if (typeof rbac !== 'object' || rbac == null) {
      return
    }

    const { id } = await this.rbac.permission.register({
      serviceName: this.name,
      version: this.version,
      name: rbac.name,
      value: rbac.actionName || action.actionName,
      deprecated: rbac.deprecated,
      actionType: rbac.actionType,
      reserved: false,
    })

    rbac.id = id
  }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
