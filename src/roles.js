export default [
  {
    roles: ['admin'],
    allows: [
      { resources: '/api/users', permissions: '*' },
    ]
  }
]
