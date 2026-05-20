import React from 'react'
import { PermissionsView } from 'src/views/settings/permissions/PermissionsView'
import PermissionGuard from 'src/components/PermissionGuard'

const PermissionsPage = () => {
  return (
    <PermissionGuard permission="view-permissions">
      <PermissionsView />
    </PermissionGuard>
  )
}

export default PermissionsPage
