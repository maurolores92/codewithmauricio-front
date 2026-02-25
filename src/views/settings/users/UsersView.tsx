
// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** API Service
import apiConnector from 'src/services/api.service'

// ** Types
interface Role {
  id: number
  name: string
  slug: string
  color: string
  userId: number | null
}

interface User {
  id: number
  name: string
  lastName: string
  email: string
  isAdmin: boolean
  isActive: boolean
  role: Role | null
  createdAt: string
  updatedAt: string
}

interface CreateUserFormData {
  name: string
  lastName: string
  email: string
  password: string
  roleId: number | null
}

const UsersView = () => {
  // ** States
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserFormData>({
    name: '',
    lastName: '',
    email: '',
    password: '',
    roleId: null
  })

  // ** Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiConnector.get<User[]>('/users/all')
      setUsers(response)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  // ** Fetch Available Roles (Global + Custom)
  const fetchRoles = async () => {
    try {
      const [globalRoles, customRoles] = await Promise.all([
        apiConnector.get<Role[]>('/users/roles/available'),
        apiConnector.get<Role[]>('/users/roles/my-roles')
      ])
      
      setRoles([...globalRoles, ...customRoles])
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  // ** Handle Create Dialog
  const handleOpenDialog = () => setOpenDialog(true)
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData({
      name: '',
      lastName: '',
      email: '',
      password: '',
      roleId: null
    })
  }

  // ** Handle Create User
  const handleCreateUser = async () => {
    try {
      await apiConnector.post('/users', formData)
      await fetchUsers()
      handleCloseDialog()
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  // ** Handle Edit Dialog
  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: '',
      roleId: user.role?.id || null
    })
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setSelectedUser(null)
    setFormData({
      name: '',
      lastName: '',
      email: '',
      password: '',
      roleId: null
    })
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      const updateData: any = {
        name: formData.name,
        lastName: formData.lastName,
        email: formData.email,
        roleId: formData.roleId
      }
      
      await apiConnector.put(`/users/${selectedUser.id}`, updateData)
      await fetchUsers()
      handleCloseEditDialog()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // ** Handle Delete Dialog
  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setOpenDeleteDialog(true)
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      await apiConnector.remove(`/users/${selectedUser.id}`)
      await fetchUsers()
      handleCloseDeleteDialog()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  // ** Handle Form Change
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            title='Gestión de Usuarios'
            subheader='Administra los usuarios del sistema'
            action={
              <Button
                variant='contained'
                startIcon={<Icon icon='tabler:user-plus' />}
                onClick={handleOpenDialog}
              >
                Crear Usuario
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{`${user.name} ${user.lastName}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <Chip
                            label={user.role.name}
                            size='small'
                            sx={{
                              backgroundColor: user.role.color,
                              color: '#fff'
                            }}
                          />
                        ) : (
                          <Chip label='Sin rol' size='small' variant='outlined' />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Chip label='Admin' color='primary' size='small' />
                        ) : (
                          <Chip label='Usuario' size='small' variant='outlined' />
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton size='small' color='primary' onClick={() => handleOpenEditDialog(user)}>
                          <Icon icon='tabler:edit' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleOpenDeleteDialog(user)}>
                          <Icon icon='tabler:trash' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Create User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='tabler:user-plus' fontSize={24} />
            Crear Nuevo Usuario
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
            <TextField
              fullWidth
              label='Nombre'
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            <TextField
              fullWidth
              label='Apellido'
              value={formData.lastName}
              onChange={(e) => handleFormChange('lastName', e.target.value)}
            />
            <TextField
              fullWidth
              label='Email'
              type='email'
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
            />
            <TextField
              fullWidth
              label='Contraseña'
              type='password'
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.roleId || ''}
                label='Rol'
                onChange={(e) => handleFormChange('roleId', e.target.value)}
              >
                <MenuItem value=''>
                  <em>Sin rol</em>
                </MenuItem>
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: role.color
                        }}
                      />
                      {role.name}
                      {role.userId === null && (
                        <Chip label='Global' size='small' sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateUser}
            variant='contained'
            disabled={!formData.name || !formData.lastName || !formData.email || !formData.password}
          >
            Crear Usuario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='tabler:edit' fontSize={24} />
            Editar Usuario
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, pt: 2 }}>
            <TextField
              fullWidth
              label='Nombre'
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
            />
            <TextField
              fullWidth
              label='Apellido'
              value={formData.lastName}
              onChange={(e) => handleFormChange('lastName', e.target.value)}
            />
            <TextField
              fullWidth
              label='Email'
              type='email'
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.roleId || ''}
                label='Rol'
                onChange={(e) => handleFormChange('roleId', e.target.value)}
              >
                <MenuItem value=''>
                  <em>Sin rol</em>
                </MenuItem>
                {roles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: role.color
                        }}
                      />
                      {role.name}
                      {role.userId === null && (
                        <Chip label='Global' size='small' sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color='secondary'>
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateUser}
            variant='contained'
            disabled={!formData.name || !formData.lastName || !formData.email}
          >
            Actualizar Usuario
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
            ¿Estás seguro que deseas eliminar al usuario{' '}
            <strong>
              {selectedUser?.name} {selectedUser?.lastName}
            </strong>
            ?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color='secondary'>
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} variant='contained' color='error'>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default UsersView
