import { Microfleet } from '@microfleet/core'
import { RBACCore, TPermission, TRole, Storage } from '@microfleet/rbac-core'
import { RBACAgent } from '@microfleet/rbac-agent'
import { NotImplementedError } from 'common-errors'
import { RedisStorage } from '@microfleet/rbac-storage-redis'
import merge from 'lodash/merge'
import conf from './config'
import { Redis } from 'ioredis'

export default class RBACService extends Microfleet {
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
    'redisSentinel',
    'router',
  ]

  private agent?: RBACAgent
  private storage?: {
    permission: Storage<TPermission>
    role: Storage<TRole>
  }

  constructor(options: any = {}) {
    super(merge({}, RBACService.defaultOpts, options))

    this.verifyRequiredPlugins()
    this.initStorageAndAgent()
  }

  /**
   * Once the database connection is up - initializes storage
   * adapters and then associated agent to self-bootstrap
   */
  private initStorageAndAgent() {
    this.on('plugin:connect:redisSentinel', (redis: Redis) => {
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
    })
  }

  private verifyRequiredPlugins() {
    for (const plugin of RBACService.requiredPlugins) {
      if (!this.hasPlugin(plugin)) {
        throw new NotImplementedError(`${plugin} must be included in plugins`)
      }
    }
  }
}
