/**
 * Specifies configuration for AMQP / RabbitMQ lib
 * @type {Object} amqp
 */
exports.amqp = {
  router: {
    enabled: true,
  },
  transport: {
    queue: 'rbac',
  },
};
