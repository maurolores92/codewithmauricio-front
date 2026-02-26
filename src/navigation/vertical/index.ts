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
      title: 'Dashboards',
      icon: 'tabler:smart-home',
      path: '/dashboards',
      requiredPermission: 'view-dashboard'
    },
    {
      title: 'Kanban',
      icon: 'bi:kanban',
      path: '/kanban',
      requiredPermission: 'view-boards'
    },
    {
      title: 'AI Tools',
      icon: 'eos-icons:ai',
      children: [
               
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

export const filterNavigationByPermissions = (permissions?: PermissionType[]): VerticalNavItemsType => {
  if (!permissions || permissions.length === 0) {
    return []
  }

  const permissionSlugs = permissions.map(p => p.slug)
  const data = navigationData()

  const filterItems = (items: NavItemWithPermission[]): VerticalNavItemsType => {
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
