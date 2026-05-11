import PermissionGuard from 'src/components/PermissionGuard'
import NotificationsView from 'src/views/notifications/NotificationsView'

const NotificationsPage = () => {
  return (
    <PermissionGuard permission='view-boards'>
      <NotificationsView />
    </PermissionGuard>
  )
}

export default NotificationsPage
