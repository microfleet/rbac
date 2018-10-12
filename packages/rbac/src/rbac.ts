import Microfleet = require('@microfleet/core');
import RBACCore, { IPermission, IRole } from '@microfleet/rbac-core';
import RBACStorageRedis from '@microfleet/rbac-storage-redis';
import merge from 'lodash/merge';
import conf from './config';

const { ConnectorsTypes } = Microfleet;

export default class RBACService extends Microfleet {
  private static readonly defaultOpts = conf.get('/', {
    env: process.env.NODE_ENV,
  });

  constructor(options: any = {}) {
    super(merge({}, RBACService.defaultOpts, options));

    this.addConnector(ConnectorsTypes.migration, () => {
      this.rbac = new RBACCore({
        storage: {
          permission: new RBACStorageRedis<IPermission>(this.redis, 'perm'),
          role: new RBACStorageRedis<IRole>(this.redis, 'role'),
        },
      });
    });
  }
}
