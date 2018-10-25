import { TRole } from '@microfleet/rbac-core'

export interface RBACScaffolding {
  [id: string]: TRole
}

/**
 * Defines core roles that would be created
 * upon service start
 */
export const rbac: RBACScaffolding = {
  'system.viewer': {
    name: 'System Viewer',
    description: 'Grants Read Access on All Resources in the system',
    permissions: {
      '*': ['GET'],
    },
    meta: {
      reserved: true,
    },
  },
  'system.editor': {
    name: 'System Editor',
    description: 'Grants Write/Update Access on All Resources in the system',
    permissions: {
      '*': ['PATCH', 'POST'],
    },
    meta: {
      reserved: true,
    },
  },
  'system.janitor': {
    name: 'System Janitor',
    description: 'Grants Delete Access on All Resources in the system',
    permissions: {
      '*': ['DELETE'],
    },
    meta: {
      reserved: true,
    },
  },
  'system.admin': {
    name: 'System Editor',
    description: 'Grants Write/Update Access on All Resources in the system',
    permissions: {
      '*': ['GET', 'PATCH', 'POST', 'DELETE'],
    },
    meta: {
      reserved: true,
    },
  },
}

/**
 * These roles are assigned via authentication/internal strategy to
 * all incoming requests
 */
export const defaultInternalRoles = [
  'system.viewer',
  'system.editor',
]
