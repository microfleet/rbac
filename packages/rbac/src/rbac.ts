import { Microfleet, CoreOptions, ConnectorsTypes, RouterPlugin, LoggerPlugin, ValidatorPlugin } from '@microfleet/core'
import { RBACCore, TPermission, TRole, Storage, Errors } from '@microfleet/rbac-core'
import { RBACAgent } from '@microfleet/rbac-agent'
import { NotImplementedError } from 'common-errors'
import { RedisStorage } from '@microfleet/rbac-storage-redis'
import merge = require('lodash.merge')
import conf from './config'
import { Redis } from 'ioredis'

export interface RBACOptions extends CoreOptions {
  /**
   * Seed tree for roles
   */
  rbac: {
    [id: string]: TRole
  },

  /**
   * These roles are populated on all internal trusted requests
   */
  defaultInternalRoles: string[]
}

export interface RBACService extends Microfleet, RouterPlugin, LoggerPlugin, ValidatorPlugin {
  /**
   * RBACAgent - iterates over available routes and registers them,
   * also adds verification postAuth hook to determine whether current user
   * may access the action or not
   */
  agent: RBACAgent

  /**
   * Main Abstraction for working with RBAC
   */
  rbac: RBACCore

  /**
   * IORedis redis sentinel adapter
   */
  redis: Redis

  /**
   * RBAC Configuration Options
   */
  config: RBACOptions

  /**
   * Generic API for working with permission & role data
   */
  storage: {

    /**
     * Responsible for accessing permission related information
     */
    permission: Storage<TPermission>

    /**
     * Responsible for accessing role relation information
     */
    role: Storage<TRole>
  }
}

export class RBACService extends Microfleet {
  /**
   * Contains default configuration for service
   */
  private static readonly defaultOpts = conf.get('/', {
    env: process.env.NODE_ENV,
  })

  /**
   * Contains references for storage of roles
   * and permissions
   */
  private static readonly dbNames = {
    permissions: 'perm',
    roles: 'role',
  }

  /**
   * Contains required plugins, without which the service
   * wont be able to operate
   */
  private static readonly requiredPlugins = [
    'logger',
    'validator',
    'redis',
    'router',
  ]

  constructor(options: any = {}) {
    super(merge({}, RBACService.defaultOpts, options))

    this.verifyRequiredPlugins()
    this.on('plugin:connect:redisSentinel', this.initStorageAndAgent)
    this.addConnector(ConnectorsTypes.migration, this.initRoles)
  }

  /**
   * Once the database connection is up - initializes storage
   * adapters and then associated agent to self-bootstrap
   */
  private initStorageAndAgent = (redis: Redis) => {
    this.storage = {
      permission: new RedisStorage<TPermission>(redis, RBACService.dbNames.permissions),
      role: new RedisStorage<TRole>(redis, RBACService.dbNames.roles),
    }

    this.rbac = new RBACCore({ storage: this.storage })
    this.agent = new RBACAgent(this, {
      database: redis,
      adapter: RedisStorage,
      storage: {
        role: RBACService.dbNames.roles,
        permission: RBACService.dbNames.permissions,
      },
    })
  }

  /**
   * Used to initialize system roles
   */
  private initRoles = async () => {
    const work = []
    const ignoreConflicts = (e: Error) => {
      if (e === Errors.kConflict) {
        return null
      }

      throw e
    }

    for (const [roleId, roleScaffold] of Object.entries(this.config.rbac)) {
      work.push((
        this.rbac.role
          .create({ id: roleId, ...roleScaffold })
          .catch(ignoreConflicts)
      ))
    }

    await Promise.all(work)
  }

  private verifyRequiredPlugins() {
    for (const plugin of RBACService.requiredPlugins) {
      if (!this.hasPlugin(plugin)) {
        throw new NotImplementedError(`${plugin} must be included in plugins`)
      }
    }
  }
}

export default RBACService
