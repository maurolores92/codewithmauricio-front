// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** MUI Components
import { Box, Typography, Button, Card, CardContent } from '@mui/material'

interface PermissionGuardProps {
  children: ReactNode
  permission: string
  fallback?: ReactNode
  redirectTo?: string
}

const PermissionGuard = ({ children, permission, fallback }: PermissionGuardProps) => {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace('/login')
    }
  }, [auth.loading, auth.user, router])

  // Mientras carga, mostrar loading
  if (auth.loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    )
  }

  // Si no hay usuario, no renderizar nada (el useEffect redirigirá)
  if (!auth.user) {
    return null
  }

  // Verificar si el usuario tiene el permiso
  const hasPermission = auth.user.permissions?.some(p => p.slug === permission)

  // Si NO tiene permiso, mostrar fallback o redirigir
  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }

    // Fallback por defecto
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 5 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='h4' sx={{ mb: 2 }}>
              🔒 Acceso Denegado
            </Typography>
            <Typography variant='body1' sx={{ mb: 4 }}>
              No tienes permisos para acceder a esta página.
            </Typography>
            <Button variant='contained' onClick={() => router.push('/dashboards')}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // Si tiene permiso, renderizar el contenido
  return <>{children}</>
}

export default PermissionGuard
