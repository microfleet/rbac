/**
 * Contains Redis Sentinel Configuration
 */
export const redis = {
  sentinels: {
    $filter: 'env',
    $default: [{
      host: 'redis-sentinel',
      port: 26379,
    }],
    production: [],
  },
  name: {
    $filter: 'env',
    $default: 'mservice',
    production: '',
  },
  options: {
    keyPrefix: '{rbac}',
    dropBufferSupport: true,
  },
}
