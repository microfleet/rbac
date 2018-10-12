import path from 'path';

/**
 * Default name of the service
 * @type {String}
 */
exports.name = 'sl-grpc-proxy';

/**
 * Enables plugins. This is a minimum list
 * @type {Array}
 */
// prettier-ignore
exports.plugins = [
  'validator',
  'logger',
  'router',
  'amqp',
  'redisSentinel',
];

/**
 * Bunyan logger configuration
 * by default only ringBuffer logger is enabled in prod
 * @type {Boolean}
 */
exports.logger = {
  debug: process.env.NODE_ENV === 'development',
  defaultLogger: process.env.NODE_ENV === 'development',
};

/**
 * Local schemas for validation
 * @type {Array}
 */
exports.validator = {
  ajv: {
    $meta: 'ms-validation AJV schema validator options',
    useDefaults: true,
    validateSchema: 'log',
  },
  schemas: [path.resolve(__dirname, '../../schemas')],
};
