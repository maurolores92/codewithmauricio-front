import { PermissionType } from 'src/context/types'

/**
 * Set Home URL based on user permissions.
 */
const getHomeRoute = (permissions?: PermissionType[]) => {
  const fallback = '/dashboards'

  if (!permissions || permissions.length === 0) {
    return fallback
  }

  const preferredOrder = [
    '/dashboards',
    '/post-generator',
    '/cv-analyzer',
    '/pdf-summarizer',
    '/settings',
    '/settings/roles',
    '/settings/users',
    '/settings/permissions'
  ]

  const pageRoutes = permissions
    .filter(permission => permission.type === 'page')
    .map(permission => permission.resource)

  for (const route of preferredOrder) {
    if (pageRoutes.includes(route)) {
      return route
    }
  }

  return pageRoutes[0] || fallback
}

export default getHomeRoute
