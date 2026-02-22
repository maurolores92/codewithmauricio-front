/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = (role: string) => {
  if (role === 'superadmin') return '/dashboards'
  else if (role === 'usuario') return '/dashboards'
  else return '/dashboards'
}

export default getHomeRoute
