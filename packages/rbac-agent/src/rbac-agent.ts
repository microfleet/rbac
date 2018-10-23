import * as Bluebird from 'bluebird'
import assert = require('assert')
import { NotSupportedError, HttpStatusError } from 'common-errors'
import * as M from '@microfleet/core'
import * as R from '@microfleet/rbac-core'
import { RemoteStorage } from '@microfleet/rbac-storage-remote'
import { DeepPartial } from 'ts-essentials'
import readPkgUp = require('read-pkg-up')
import * as get from 'get-value'

export interface RBACActionConfig {
  id?: string
  actionName?: string
  deprecated?: boolean
  name: string
  actionType: R.RBACActionType[]
}

export type RBACServiceAction = DeepPartial<M.ServiceAction> & {
  rbac?: RBACActionConfig
}

export type RBACServiceRequest = M.ServiceRequest & {
  action: M.ServiceAction & {
    rbac?: RBACActionConfig
  }
}

export type MService = M.Microfleet
  & M.RouterPlugin
  & M.LoggerPlugin

export interface RBACPollingOptions {
  /**
   * Syncronization interval timer
   */
  interval: number

  /**
   * Randomization factor
   */
  random: number
}

export interface RBACPluggableAdapter {
  /**
   * Default Storage Adapter to use
   */
  adapter: R.StorageConstructor
}

export interface RBACDatabaseOptions {
  /**
   * Storage
   * @desc Required name of storage databases
   */
  storage: {
    /**
     * Role
     * @desc Service routes for role storage
     */
    role: string

    /**
     * Permission
     * @desc Service routes for permission storage
     */
    permission: string
  }

  /**
   * Database
   * @desc Database adapter for remote storage
   */
  database: any
}

export type RBACAgentRequiredConfig = Partial<RBACPollingOptions> &
  Partial<RBACPluggableAdapter> &
  RBACDatabaseOptions

export type Options = RBACPollingOptions &
  RBACPluggableAdapter &
  RBACDatabaseOptions

export class RBACAgent {
  /**
   * Error when rbac can't match action and passed role
   */
  public static readonly kRBACDenied = new HttpStatusError(403, '[rbac] access denied')

  /**
   * Contains default configuration based on RBACAgentOptions
   */
  private static readonly defaultProps: RBACPollingOptions & RBACPluggableAdapter = {
    interval: 60000,
    random: 1.5,
    adapter: RemoteStorage,
  }

  /**
   * RBAC service adapter
   */
  public readonly rbac: R.RBACCore

  /**
   * Actions are pulled from the router to
   * be registered in the above mentioned rbac service
   */
  private readonly router: M.Router

  /**
   * Attaches bunyan-compatible logger instance
   */
  private readonly log: any

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
  private rolesByName: { [id: string]: R.RoleModel } = Object.create(null)

  /**
   * Configuration options
   */
  private readonly opts: Options

  /**
   * initialized AMQP client must be passed
   */
  constructor(service: MService, opts: RBACAgentRequiredConfig) {
    assert(service.hasPlugin('router'), new NotSupportedError('router must be enabled'))

    this.opts = Object.assign(RBACAgent.defaultProps, opts)
    this.router = service.router
    this.log = service.log
    this.name = service.config.name

    const StorageAdapter = this.opts.adapter
    const SNamespace = this.opts.database
    const SService = this.opts.storage

    this.rbac = new R.RBACCore({
      storage: {
        permission: new StorageAdapter(SNamespace, SService.permission) as R.Storage<R.TPermission>,
        role: new StorageAdapter(SNamespace, SService.role) as R.Storage<R.TRole>,
      },
    })

    service.router.extensions.register('postAuth', this.verifyRequest)
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

    const nextTime = getRandomInt(interval, interval * random)
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
      let role = this.rolesByName[roleId]

      // no role -> next
      if (role === undefined) {
        try {
          role = this.rolesByName[roleId] = await this.rbac.role.read(roleId)
        } catch (e) {
          this.log.debug({ err: e }, 'failed to get role %s', roleId)
          continue
        }
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
      value: rbac.actionName || action.actionName as string,
      deprecated: rbac.deprecated,
      actionType: rbac.actionType,
      reserved: false,
    })

    rbac.id = id
  }

  private verifyRequest = async (error: any, request: RBACServiceRequest) => {
    if (error) {
      throw error
    }

    if (request.action.rbac === undefined) {
      return [error, request]
    }

    const roles = get(request, 'auth.roles')
    if (!Array.isArray(roles) || !await this.match(roles, request.action)) {
      throw RBACAgent.kRBACDenied
    }

    return [error, request]
  }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
