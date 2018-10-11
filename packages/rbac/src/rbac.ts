import Microfleet = require('@microfleet/core');
import RBACCore from '@microfleet/rbac-core';
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
      this.rbac = new RBACCore({} as any);
    });
  }
}
