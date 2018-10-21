import path = require('path')
import { Microfleet, ActionTransport } from '@microfleet/core'
import { RBACMemoryStorage } from '@microfleet/rbac-core'
import { RBACAgent } from '../src'

let agent: RBACAgent
let service: Microfleet

test('init service', () => {
  service = new Microfleet({
    name: 'rbac-agent-test',
    plugins: ['logger', 'validator', 'router', 'http'],
    router: {
      routes: {
        directory: path.resolve(__dirname, './routes'),
        prefix: 'agent',
        transports: [ActionTransport.http],
      },
    },
  })
})

test('creates agent instance', async () => {
  agent = new RBACAgent(service, {
    adapter: RBACMemoryStorage,
    storage: {
      role: '{r}',
      permission: '{p}',
    },
    database: null, /* not required for memory storage */
  })
})

test('initializes service', async () => {
  await service.connect()
})
