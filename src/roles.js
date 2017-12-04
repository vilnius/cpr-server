const ADMIN = 'admin';
const READONLY = 'readonly';

export const ROLES = [ADMIN, READONLY]

export default [
  {
    roles: [ADMIN],
    allows: [
      { resources: '/api/users', permissions: '*' },
      { resources: '/api/roles', permissions: '*' },
      { resources: '/api/lanemaps', permissions: '*' },
      { resources: '/api/shots', permissions: '*' },
      { resources: '/api/whitelist', permissions: '*' },
      { resources: '/api/images', permissions: '*' },
      { resources: '/api/violations', permissions: '*' },
    ]
  },
  {
    roles: [READONLY],
    allows: [
      { resources: '/api/lanemaps', permissions: ['get'] },
      { resources: '/api/shots', permissions: ['get'] },
      { resources: '/api/whitelist', permissions: ['get'] },
      { resources: '/api/images', permissions: ['get'] },
      { resources: '/api/violations', permissions: ['get'] },
    ]
  }
]
