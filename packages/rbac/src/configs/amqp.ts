/**
 * Specifies configuration for AMQP / RabbitMQ lib
 */
export const amqp = {
  router: {
    enabled: true,
  },
  transport: {
    queue: 'rbac',
  },
}
