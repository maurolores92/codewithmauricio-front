// ** Type import
import { NavGroup, NavLink, NavSectionTitle, VerticalNavItemsType } from 'src/@core/layouts/types'
import { PermissionType } from 'src/context/types'

export type NavItemWithPermission =
  | (NavLink & { requiredPermission?: string })
  | (NavSectionTitle & { requiredPermission?: string })
  | (Omit<NavGroup, 'children'> & {
      requiredPermission?: string
      children?: NavItemWithPermission[]
    })

const navigationData = (): NavItemWithPermission[] => {
  return [
    {
      title: 'AI Tools',
      icon: 'eos-icons:ai',
      children: [
        {
          title: 'Dashboards',
          icon: 'tabler:smart-home',
          path: '/dashboards',
          requiredPermission: 'view-dashboard'
        },
        {
          title: 'Post Generator',
          icon: 'iconoir:post',
          path: '/post-generator',
          requiredPermission: 'view-post-generator'
        },
        {
          title: 'CV Analyzer',
          icon: 'streamline:business-user-curriculum',
          path: '/cv-analyzer',
          requiredPermission: 'view-cv-analyzer'
        },
        {
          title: 'PDF Summarizer',
          icon: 'mdi:file-document-edit-outline',
          path: '/pdf-summarizer',
          requiredPermission: 'view-pdf-summarizer'
        }
      ]
    },
    {
      title: 'Configuración',
      icon: 'tabler:settings',
      requiredPermission: 'view-settings',
      children: [
        {
          title: 'Roles',
          icon: 'tabler:shield-lock',
          path: '/settings/roles',
          requiredPermission: 'view-roles'
        },
        {
          title: 'Usuarios',
          icon: 'tabler:users',
          path: '/settings/users',
          requiredPermission: 'view-users'
        },
        {
          title: 'Permisos',
          icon: 'fluent-mdl2:permissions',
          path: '/settings/permissions',
          requiredPermission: 'view-permissions'
        }
      ]
    }
  ]
}

/**
 * Filter navigation items based on user permissions
 * @param permissions User permissions array
 * @returns Filtered navigation items
 */
export const filterNavigationByPermissions = (permissions?: PermissionType[]): VerticalNavItemsType => {
  if (!permissions || permissions.length === 0) {
    return []
  }

  const permissionSlugs = permissions.map(p => p.slug)
  const data = navigationData()

  const filterItems = (items: NavItemWithPermission[]): VerticalNavItemsType => {
    return items
      .filter(item => {
        // If item has a required permission and user doesn't have it, filter it out
        if (item.requiredPermission && !permissionSlugs.includes(item.requiredPermission)) {
          return false
        }
        
        return true
      })
      .map(item => {
        // If item has children, recursively filter them
        if ('children' in item && Array.isArray(item.children)) {
          return {
            ...item,
            children: filterItems(item.children as NavItemWithPermission[])
          }
        }

        return item
      })
  }

  return filterItems(data)
}

const navigation = (): VerticalNavItemsType => {
  return navigationData()
}

export default navigation
