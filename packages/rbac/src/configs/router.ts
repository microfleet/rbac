import { ActionTransport, routerExtension } from '@microfleet/core';
import path from 'path';

/**
 * This extension defaults schemas to the name of the action
 * @type {Function}
 */
const autoSchema = routerExtension('validate/schemaLessAction');

/**
 * Provides audit log for every performed action
 * @type {Function}
 */
const auditLog = routerExtension('audit/log');

/**
 * Specifies configuration for the router of the microservice
 * @type {Object}
 */
exports.router = {
  extensions: {
    enabled: ['preRequest', 'postRequest', 'preResponse'],
    register: [autoSchema, auditLog],
  },
  routes: {
    directory: path.resolve(__dirname, '../actions'),
    prefix: 'rbac',
    transports: [ActionTransport.amqp, ActionTransport.http, ActionTransport.internal],
  },
};
