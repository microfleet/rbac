
export const amqp = {
  transport: {
    connection: {
      host: 'rabbitmq',
      port: 5672,
    },
  },
}

export const redis = {
  sentinels: [{
    host: 'redis-sentinel',
    port: 26379,
  }],
  name: 'mservice',
  options: {},
}
