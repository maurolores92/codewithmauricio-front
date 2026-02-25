import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormGroup
} from '@mui/material'
import toast from 'react-hot-toast'
import Api from 'src/services/api.service'
import Icon from 'src/@core/components/icon'

type Permission = {
  id: number
  name: string
  slug: string
  description: string
  type: 'page' | 'component' | 'action'
  resource: string
}

type Role = {
  id: number
  name: string
  slug: string
  color?: string
  userId?: number | null
}

export const PermissionsView = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [rolePermissions, setRolePermissions] = useState<{ [key: number]: number[] }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogPermissions, setDialogPermissions] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [permissionsRes, rolesRes] = await Promise.all([
        Api.get<Permission[]>('/permissions'),
        Api.get<Role[]>('/role?includeSuperAdmin=true')
      ])

      setPermissions(permissionsRes || [])
      setRoles(rolesRes || [])

      // Cargar permisos para cada rol
      const rolePermsMap: { [key: number]: number[] } = {}
      for (const role of rolesRes) {
        try {
          const rolePerms = await Api.get<Permission[]>(`/permissions/role/${role.id}`)
          rolePermsMap[role.id] = rolePerms.map(p => p.id)
        } catch (err) {
          console.warn(`No permissions found for role ${role.id}:`, err)
          rolePermsMap[role.id] = []
        }
      }
      setRolePermissions(rolePermsMap)
    } catch (error: any) {
      console.error('Error loading data:', error)
      const message = error?.response?.data?.message || error?.message || 'Error al cargar los datos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (roleId: number, currentPermissions: number[]) => {
    setSelectedRole(roleId)
    setDialogPermissions([...currentPermissions])
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setSelectedRole(null)
    setDialogPermissions([])
  }

  const handlePermissionToggle = (permissionId: number) => {
    setDialogPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSavePermissions = async () => {
    if (!selectedRole) return

    try {
      setSaving(true)
      await Api.post('/permissions/assign-to-role', {
        roleId: selectedRole,
        permissionIds: dialogPermissions
      })

      setRolePermissions(prev => ({
        ...prev,
        [selectedRole]: dialogPermissions
      }))

      handleCloseDialog()
      toast.success('Permisos guardados exitosamente')
    } catch (error: any) {
      console.error('Error saving permissions:', error)
      const message = error?.response?.data?.message || 'Error al guardar permisos'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const getPermissionTypeColor = (type: string) => {
    switch (type) {
      case 'page':
        return { color: 'primary', label: '📄 Página' }
      case 'component':
        return { color: 'info', label: '🧩 Componente' }
      case 'action':
        return { color: 'success', label: '⚡ Acción' }
      default:
        return { color: 'default', label: 'Otro' }
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 4, md: 6 } }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
            ❌ Error al cargar los datos
          </Typography>
          <Typography variant='body2'>{error}</Typography>
          <Button variant='contained' size='small' onClick={loadData} sx={{ mt: 2 }}>
            Reintentar
          </Button>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant='h4' sx={{ mb: 1 }}>
            🔐 Gestión de Permisos
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Configura los permisos disponibles para cada rol del sistema
          </Typography>
        </Box>

        {/* Info Alert */}
        <Alert severity='info' icon={<Icon icon='mdi:information-outline' />}>
          Los roles <strong>SuperAdmin</strong> y <strong>Admin</strong> tienen todos los permisos asignados por defecto y no pueden ser modificados.
        </Alert>

        {/* Roles Tabs */}
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
          {roles.map(role => (
            <Chip
              key={role.id}
              label={role.name}
              color='primary'
              variant='outlined'
              sx={{ cursor: 'pointer' }}
              onClick={() => handleOpenDialog(role.id, rolePermissions[role.id] || [])}
            />
          ))}
        </Stack>

        {/* Permissions Grid */}
        <Grid container spacing={2}>
          {permissions.map(permission => {
            const typeConfig = getPermissionTypeColor(permission.type)

            return (
              <Grid item xs={12} key={permission.id}>
                <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={3}>
                      {/* Left: Name & Description */}
                      <Box sx={{ flex: 1 }}>
                        <Stack direction='row' spacing={2} alignItems='flex-start'>
                          <Chip
                            label={typeConfig.label}
                            color={typeConfig.color as any}
                            size='small'
                            variant='outlined'
                          />
                          <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                            {permission.name}
                          </Typography>
                        </Stack>
                        <Typography variant='body2' color='text.secondary'>
                          {permission.description}
                        </Typography>
                      </Box>

                      {/* Right: Roles with this permission */}
                      <Box sx={{ minWidth: '250px' }}>
                        <Typography variant='caption' sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          ASIGNADO A:
                        </Typography>
                        <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap'}}>
                          {roles.length > 0 ? (
                            roles.map(role => {
                              const hasPermission = rolePermissions[role.id]?.includes(permission.id)

                              return (
                                <Chip
                                  key={role.id}
                                  label={role.name}
                                  size='small'
                                  icon={<Icon icon={hasPermission ? 'mdi:check-circle' : 'mdi:circle-outline'} />}
                                  color={hasPermission ? 'success' : 'default'}
                                  variant={hasPermission ? 'filled' : 'outlined'}
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => handleOpenDialog(role.id, rolePermissions[role.id] || [])}
                                />
                              )
                            })
                          ) : (
                            <Typography variant='caption' color='text.secondary'>
                              No hay roles disponibles
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>

        {permissions.length === 0 && (
          <Alert severity='info'>No hay permisos disponibles en el sistema</Alert>
        )}
      </Stack>

      {/* Dialog for editing role permissions */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          {selectedRole && roles.find(r => r.id === selectedRole)
            ? `Permisos para "${roles.find(r => r.id === selectedRole)?.name}"`
            : 'Permisos del Rol'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl component='fieldset' fullWidth>
            <FormGroup>
              {permissions.map(permission => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Checkbox
                      checked={dialogPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='body2'>{permission.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {permission.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1, alignItems: 'flex-start' }}
                />
              ))}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSavePermissions} variant='contained' disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
