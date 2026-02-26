// ** Type import
import { HorizontalNavItemsType, NavGroup, NavLink } from 'src/@core/layouts/types'
import { PermissionType } from 'src/context/types'

export type HNavItemWithPermission =
  | (NavLink & { requiredPermission?: string })
  | (Omit<NavGroup, 'children'> & {
      requiredPermission?: string
      children?: HNavItemWithPermission[]
    })

const navigationData = (): HNavItemWithPermission[] => {
  return [
    {
      title: 'Dashboards',
      icon: 'tabler:smart-home',
      path: '/dashboards',
      requiredPermission: 'view-dashboard'
    },
    {
      title: 'Kanban',
      icon: 'mdi:view-kanban-outline',
      path: '/kanban',
      requiredPermission: 'view-boards'
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
 * Filter horizontal navigation items based on user permissions
 * @param permissions User permissions array
 * @returns Filtered navigation items
 */
export const filterHorizontalNavigationByPermissions = (permissions?: PermissionType[]): HorizontalNavItemsType => {
  if (!permissions || permissions.length === 0) {
    return []
  }

  const permissionSlugs = permissions.map(p => p.slug)
  const data = navigationData()

  const filterItems = (items: HNavItemWithPermission[]): HorizontalNavItemsType => {
    return items
      .filter(item => {
        if (item.requiredPermission && !permissionSlugs.includes(item.requiredPermission)) {
          return false
        }
        
        return true
      })
      .map(item => {
        if ('children' in item && Array.isArray(item.children)) {
          return {
            ...item,
            children: filterItems(item.children as HNavItemWithPermission[])
          }
        }

        return item
      })
  }

  return filterItems(data)
}

const navigation = (): HorizontalNavItemsType => {
  return navigationData()
}

export default navigation
