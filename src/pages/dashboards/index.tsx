import { Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from '@mui/material'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import Icon from 'src/@core/components/icon'
import PermissionGuard from 'src/components/PermissionGuard'

const projects = [
  {
    title: 'Kanban Board',
    description: 'Tablero Kanban multi-usuario con drag & drop, roles dinámicos y multi-tenancy. Gestión visual de tareas por columnas.',
    tags: ['Drag & Drop', 'Multi-tenancy', 'Roles Dinámicos', 'NestJS', 'Next.js'],
    status: 'Activo'
  },
  {
    title: 'Post Generator (LinkedIn)',
    description: 'Generador de contenido con IA, tono y longitud configurables.',
    tags: ['IA', 'Groq', 'NestJS', 'Next.js'],
    status: 'Activo'
  },
  {
    title: 'CV Analyzer',
    description: 'Analizador de CVs con IA para destacar habilidades y sugerir mejoras.',
    tags: ['IA', 'UX', 'React'],
    status: 'Activo'
  },
  
  {
    title: 'Mini CRM',
    description: 'Gestion simple de clientes y recordatorios.',
    tags: ['Backend', 'Dashboard'],
    status: 'En progreso'
  },
  {
    title: 'Chat con PDFs',
    description: 'Interacción con documentos PDF utilizando IA para extraer información y responder preguntas.',
    tags: ['IA', 'PDF', 'React'],
    status: 'Idea'
  }
]

const skills = [
  {
    title: 'Frontend',
    items: [
      { label: 'Next.js', icon: 'logos:nextjs-icon' },
      { label: 'React', icon: 'logos:react' },
      { label: 'TypeScript', icon: 'logos:typescript-icon' },
      { label: 'MUI', icon: 'logos:material-ui' },
      { label: 'UX/UI', icon: 'mdi:palette-outline' }
    ]
  },
  {
    title: 'Backend',
    items: [
      { label: 'NestJS', icon: 'logos:nestjs' },
      { label: 'PostgreSQL', icon: 'logos:postgresql' },
      { label: 'Sequelize', icon: 'logos:sequelize' },
      { label: 'JWT', icon: 'mdi:shield-key-outline' },
      { label: 'APIs REST', icon: 'mdi:api' }
    ]
  },
  {
    title: 'IA + Automatizacion',
    items: [
      { label: 'Groq API', icon: 'mdi:chip' },
      { label: 'Prompting', icon: 'mdi:text-box-edit-outline' },
      { label: 'Workflows', icon: 'mdi:workflow-outline' },
      { label: 'Rate Limit', icon: 'mdi:speedometer' }
    ]
  },
  {
    title: 'Dev & Ops',
    items: [
      { label: 'Docker', icon: 'logos:docker-icon' },
      { label: 'CI/CD', icon: 'mdi:source-branch' },
      { label: 'Testing', icon: 'mdi:flask-outline' },
      { label: 'Observabilidad', icon: 'mdi:chart-timeline-variant' }
    ]
  },
  {
    title: 'Interactividad & UX',
    items: [
      { label: 'Drag & Drop', icon: 'mdi:gesture-swipe' },
      { label: 'Animaciones', icon: 'mdi:animation-play' },
      { label: 'dnd-kit', icon: 'mdi:package' },
      { label: 'Responsive Design', icon: 'mdi:responsive' }
    ]
  },
  {
    title: 'Arquitectura Avanzada',
    items: [
      { label: 'Multi-tenancy', icon: 'mdi:database-multiple' },
      { label: 'Roles Dinámicos', icon: 'mdi:shield-account-outline' },
      { label: 'Permisos Granulares', icon: 'mdi:lock-check-outline' },
      { label: 'Custom Hooks', icon: 'mdi:react' }
    ]
  }
]

const metrics = [
  { label: 'Tools creadas', value: '3+' },
  { label: 'Proyectos activos', value: '3+' },
  { label: 'Requests IA', value: '1.2k+' },
  { label: 'Usuarios creados', value: '2+' },
]

const services = [
  {
    title: 'Desarrollo Full Stack',
    detail: 'React + Nest + PostgreSQL'
  },
  {
    title: 'APIs REST seguras',
    detail: 'JWT, validaciones, roles dinámicos'
  },
  {
    title: 'Dashboards y paneles admin',
    detail: 'MUI, tablas, filtros, métricas, Kanban'
  },
  {
    title: 'Interfaces interactivas',
    detail: 'Drag & drop, custom hooks, animaciones fluidas'
  },
  {
    title: 'Sistemas multi-usuario',
    detail: 'Multi-tenancy, control de acceso, roles granulares'
  },
  {
    title: 'Integraciones con IA',
    detail: 'Groq/OpenAI, generación de contenido, chat con documentos'
  },
  {
    title: 'Automatización de procesos',
    detail: 'scripts, tareas programadas, emails'
  },
  {
    title: 'MVPs rápidos',
    detail: 'prototipo funcional en pocos días'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Activo':
      return 'success'
    case 'En progreso':
      return 'info'
    case 'Idea':
      return 'warning'
    default:
      return 'default'
  }
}

const AnalyticsDashboard = () => {
  return (
    <PermissionGuard permission="view-dashboard">
      <ApexChartWrapper>
        <Box
          sx={{
            minHeight: '100vh',
            py: { xs: 6, md: 10 }
          }}
        >
        <Container maxWidth='lg'>
          {/* HERO */}
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              mb: 6,
              borderRadius: 3,
              background: theme =>
                `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                right: -60,
                top: -60,
                width: 220,
                height: 220,
                borderRadius: '50%',
                background: theme => theme.palette.primary.light,
                opacity: 0.25,
                animation: 'float 10s ease-in-out infinite'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                right: 40,
                bottom: -80,
                width: 260,
                height: 260,
                borderRadius: '50%',
                background: theme => theme.palette.secondary.light,
                opacity: 0.2,
                animation: 'float 12s ease-in-out infinite reverse'
              }}
            />
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(14px)' }
                }
              }}
            >
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
                  mb: 1
                }}
              >
                Herramientas, ideas y productos en construccion
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 3, maxWidth: 720 }}>
                Soy Mauricio, construyo tools con IA y proyectos web para demostrar habilidades reales. Aqui puedes
                explorar mis soluciones, ver stacks y seguir lo que viene.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant='outlined' color='inherit' href='#contacto'>
                  Contactar
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* METRICAS */}
          <Grid container spacing={2} sx={{ mb: 6 }}>
            {metrics.map(metric => (
              <Grid item xs={6} md={3} key={metric.label}>
                <Card sx={{ borderRadius: 2}}>
                  <CardContent>
                    <Typography variant='h4' fontWeight='bold' color='primary'>
                      {metric.value}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {metric.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* GALERIA */}
          <Box id='proyectos' sx={{ mb: 6 }}>
            <Typography variant='h4' fontWeight='bold' sx={{ mb: 2 }}>
              Galeria de Tools y Proyectos
            </Typography>
            <Typography color='text.secondary' sx={{ mb: 3 }}>
              Explora herramientas con IA y proyectos pequenos creados para visibilizar habilidades y enfoque tecnico.
            </Typography>
            <Grid container spacing={3}>
              {projects.map(project => (
                <Grid item xs={12} md={6} key={project.title}>
                  <Card sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction='row' justifyContent='space-between' alignItems='center'>
                          <Typography variant='h6' fontWeight='bold'>
                            {project.title}
                          </Typography>
                          <Chip label={project.status} size='small' color={getStatusColor(project.status)} />
                        </Stack>
                        <Typography color='text.secondary'>{project.description}</Typography>
                        <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ rowGap: 1, columnGap: 1 }}>
                          {project.tags.map(tag => (
                            <Chip key={tag} label={tag} size='small' variant='outlined' />
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* SKILLS */}
          <Box sx={{ mb: 6 }}>
            <Typography variant='h4' fontWeight='bold' sx={{ mb: 2 }}>
              Skills y Stack
            </Typography>
            <Grid container spacing={3}>
              {skills.map(skill => (
                <Grid item xs={12} md={3} key={skill.title}>
                  <Card sx={{ borderRadius: 2, height: '100%'}}>
                    <CardContent>
                      <Typography variant='h6' fontWeight='bold' sx={{ mb: 2 }}>
                        {skill.title}
                      </Typography>
                      <Stack spacing={1}>
                        {skill.items.map(item => (
                          <Chip
                            key={item.label}
                            label={item.label}
                            size='small'
                            variant='outlined'
                            icon={<Icon icon={item.icon} />}
                            sx={{
                              '& .MuiChip-icon': {
                                fontSize: '1rem'
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* SERVICIOS */}
          <Box sx={{ mb: 6 }}>
            <Typography variant='h4' fontWeight='bold' sx={{ mb: 2 }}>
              Servicios y colaboraciones
            </Typography>
            <Grid container spacing={2}>
              {services.map(service => (
                <Grid item xs={12} md={4} key={service.title}>
                  <Card sx={{ borderRadius: 2, height: '100%'}}>
                    <CardContent>
                      <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 0.5 }}>
                        {service.title}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        ({service.detail})
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CONTACTO */}
          <Box id='contacto' sx={{ mb: 4 }}>
            <Card sx={{ borderRadius: 3}}>
              <CardContent>
                <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
                  Contacto rapido
                </Typography>
                <Typography color='text.secondary' sx={{ mb: 3 }}>
                  Estoy abierto a colaboraciones, proyectos cortos y validacion de ideas.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant='contained'
                    color='primary'
                    href='https://www.linkedin.com/in/mauriciolores/'
                    target='_blank'
                    rel='noopener noreferrer'
                    startIcon={<Icon icon='mdi:linkedin' />}
                  >
                    Escribeme por LinkedIn
                  </Button>
                  <Button
                    variant='outlined'
                    color='secondary'
                    href='https://github.com/maurolores92'
                    target='_blank'
                    rel='noopener noreferrer'
                    startIcon={<Icon icon='mdi:github' />}
                  >
                    Ver GitHub
                  </Button>
                  <Button
                    variant='outlined'
                    color='inherit'
                    href='mailto:maurolores1992@gmail.com'
                    startIcon={<Icon icon='mdi:email-outline' />}
                  >
                    maurolores1992@gmail.com
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </ApexChartWrapper>
    </PermissionGuard>
  )
}

export default AnalyticsDashboard
