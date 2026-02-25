import { useState, useEffect } from 'react'
import {  Box,  Button,  Card,  CardContent,  CardHeader,  Chip,  Dialog,  DialogActions,  DialogContent,  DialogTitle,  Grid,  IconButton,  Paper,  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  TextField,  Typography,  CircularProgress} from '@mui/material'
import Icon from 'src/@core/components/icon'
import apiConnector from 'src/services/api.service'

interface Role {
  id: number
  name: string
  slug: string
  color: string
  userId: number | null
  createdAt: string
  updatedAt: string
}

const RolesView = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [myRoles, setMyRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', color: '#2196F3'  })

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const globalRoles = await apiConnector.get<Role[]>('/users/roles/available')
      const customRoles = await apiConnector.get<Role[]>('/users/roles/my-roles')
      setRoles(globalRoles)
      setMyRoles(customRoles)
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData({ name: '', slug: '', color: '#2196F3' })
  }

  const handleCreateRole = async () => {
    try {
      await apiConnector.post('/users/roles/create', formData)
      await fetchRoles()
      handleCloseDialog()
    } catch (error) {
      console.error('Error creating role:', error)
    }
  }

  const handleOpenEditDialog = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      slug: role.slug,
      color: role.color
    })
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setSelectedRole(null)
    setFormData({ name: '', slug: '', color: '#2196F3' })
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return
    
    try {
      await apiConnector.put(`/users/roles/${selectedRole.id}`, formData)
      await fetchRoles()
      handleCloseEditDialog()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleOpenDeleteDialog = (role: Role) => {
    setSelectedRole(role)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedRole(null)
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return
    
    try {
      await apiConnector.remove(`/users/roles/${selectedRole.id}`)
      await fetchRoles()
      handleCloseDeleteDialog()
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Roles Globales'
            subheader='Roles disponibles para todos los usuarios'
            action={
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:plus' />}
                onClick={handleOpenDialog}
              >
                Crear Rol
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Tipo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map(role => (
                    <TableRow key={role.id}>
                      <TableCell>{role.name}</TableCell>
                      <TableCell>
                        <Chip label={role.slug} size='small' />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: 1,
                              backgroundColor: role.color,
                              border: '1px solid #ddd'
                            }}
                          />
                          <Typography variant='body2'>{role.color}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label='Global' color='primary' size='small' variant='outlined' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Mis Roles Personalizados'
            subheader='Roles creados por mí para mis usuarios'
          />
          <CardContent>
            {myRoles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant='body2' color='text.secondary'>
                  No tienes roles personalizados aún. ¡Crea uno!
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Slug</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myRoles.map(role => (
                      <TableRow key={role.id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>
                          <Chip label={role.slug} size='small' />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                backgroundColor: role.color,
                                border: '1px solid #ddd'
                              }}
                            />
                            <Typography variant='body2'>{role.color}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label='Personal' color='secondary' size='small' variant='outlined' />
                        </TableCell>
                        <TableCell>
                          <IconButton size='small' color='primary' onClick={() => handleOpenEditDialog(role)}>
                            <Icon icon='tabler:edit' />
                          </IconButton>
                          <IconButton size='small' color='error' onClick={() => handleOpenDeleteDialog(role)}>
                            <Icon icon='tabler:trash' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Create Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='tabler:shield-plus' fontSize={24} />
            Crear Nuevo Rol
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
            <TextField
              fullWidth
              label='Nombre del Rol'
              placeholder='ej: Desarrollador'
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            <TextField
              fullWidth
              label='Slug'
              placeholder='ej: developer'
              value={formData.slug}
              onChange={(e) => handleFormChange('slug', e.target.value)}
              helperText='Se genera automáticamente desde el nombre'
            />
            <Box>
              <Typography variant='body2' sx={{ mb: 2 }}>
                Color del Rol
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                  type='color'
                  value={formData.color}
                  onChange={(e) => handleFormChange('color', e.target.value)}
                  style={{ width: 60, height: 40, cursor: 'pointer', border: 'none' }}
                />
                <TextField
                  size='small'
                  value={formData.color}
                  onChange={(e) => handleFormChange('color', e.target.value)}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateRole}
            variant='contained'
            disabled={!formData.name || !formData.slug}
          >
            Crear Rol
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='tabler:edit' fontSize={24} />
            Editar Rol
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
            <TextField
              fullWidth
              label='Nombre del Rol'
              placeholder='ej: Desarrollador'
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            <TextField
              fullWidth
              label='Slug'
              placeholder='ej: developer'
              value={formData.slug}
              onChange={(e) => handleFormChange('slug', e.target.value)}
              helperText='Se genera automáticamente desde el nombre'
            />
            <Box>
              <Typography variant='body2' sx={{ mb: 2 }}>
                Color del Rol
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                  type='color'
                  value={formData.color}
                  onChange={(e) => handleFormChange('color', e.target.value)}
                  style={{ width: 60, height: 40, cursor: 'pointer', border: 'none' }}
                />
                <TextField
                  size='small'
                  value={formData.color}
                  onChange={(e) => handleFormChange('color', e.target.value)}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateRole}
            variant='contained'
            disabled={!formData.name || !formData.slug}
          >
            Actualizar Rol
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth='xs' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='tabler:alert-triangle' fontSize={24} color='error' />
            Confirmar Eliminación
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas eliminar el rol <strong>{selectedRole?.name}</strong>?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color='secondary'>
            Cancelar
          </Button>
          <Button onClick={handleDeleteRole} variant='contained' color='error'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default RolesView
