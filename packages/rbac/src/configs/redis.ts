/**
 * Contains Redis Sentinel Configuration
 */
export const redis = {
  sentinels: [{
    host: 'redis-sentinel',
    port: 26379,
  }],
  name: 'mservice',
  options: {
    keyPrefix: '{rbac}',
    dropBufferSupport: true,
  },
}
