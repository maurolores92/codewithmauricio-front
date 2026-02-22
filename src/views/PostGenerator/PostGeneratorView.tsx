import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Fade,
  Tooltip
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import apiConnector from 'src/services/api.service'

type FormValues = {
  topic: string
  tone: string
  length: 'short' | 'medium' | 'long'
}

type GeneratePostResponse = {
  topic: string
  content: string
  hashtags?: string[]
  generatedAt?: string
}

export const PostGeneratorView = () => {
  const [result, setResult] = useState<GeneratePostResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<FormValues>({
    defaultValues: { topic: '', tone: '', length: 'medium' }
  })

  const lengthValue = watch('length')

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      // TODO: Ajusta la ruta del endpoint según tu API
      const data = await apiConnector.post('/generate-post', values)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Error al generar el post')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      const hashtagsStr = result.hashtags ? result.hashtags.join(' ') : ''
      const textToCopy = `${result.content}\n\n${hashtagsStr}`
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth='md'>
        {/* HERO */}
        <Box textAlign='center' mb={6}>
          <Typography variant='h3' component='h1' gutterBottom fontWeight='bold'>
            Genera Posts Profesionales con IA 🚀
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 700, mx: 'auto' }}>
            Una herramienta experimental para crear contenido optimizado para LinkedIn usando Inteligencia Artificial.
          </Typography>
        </Box>

        {/* OBJETIVO */}
        <Paper variant='outlined' sx={{ p: 3, mb: 4 }}>
          <Typography variant='h5' sx={{ mb: 2 }} fontWeight='bold'>
            🎯 Objetivo del Proyecto
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Este generador fue creado como una demostración técnica de integración entre backend, APIs de Inteligencia
            Artificial y frontend moderno.
          </Typography>
        </Paper>

        <Paper variant='outlined' sx={{ p: 3, mb: 4 }}>
          <Typography variant='h5' sx={{ mb: 2 }} fontWeight='bold'>
            ⚡ Tecnologias del Post Generator
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                Frontend
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ rowGap: 1, columnGap: 1 }}>
                <Chip label='React Hook Form' size='small' color='primary' variant='outlined' />
                <Chip label='Axios' size='small' color='primary' variant='outlined' />
                <Chip label='MUI' size='small' color='primary' variant='outlined' />
                <Chip label='Clipboard API' size='small' color='primary' variant='outlined' />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                Backend + IA
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ rowGap: 1, columnGap: 1 }}>
                <Chip label='NestJS' size='small' color='secondary' variant='outlined' />
                <Chip label='API REST' size='small' color='secondary' variant='outlined' />
                <Chip label='Groq API' size='small' color='secondary' variant='outlined' />
                <Chip label='Llama 3.3 70B' size='small' color='secondary' variant='outlined' />
                <Chip label='Rate Limit' size='small' color='secondary' variant='outlined' />
                <Chip label='Validaciones' size='small' color='secondary' variant='outlined' />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* COMO FUNCIONA */}
        <Box mb={4}>
          <Typography variant='h5' align='center' gutterBottom sx={{ mb: 4 }} fontWeight='bold'>
            ⚙️ ¿Cómo funciona?
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                <Typography variant='h6' gutterBottom>
                  1️⃣ Define el tema
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Escribe sobre qué quieres que trate el post.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                <Typography variant='h6' gutterBottom>
                  2️⃣ Personaliza el tono
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Elige si quieres un estilo profesional, motivador o educativo.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                <Typography variant='h6' gutterBottom>
                  3️⃣ Genera en segundos
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  La IA procesa tu solicitud y crea un post estructurado.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* FORMULARIO */}
        <Paper sx={{ p: 4, mb: 4 }}>
          {!result ? (
            <Fade in timeout={300}>
              <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                <Typography variant='h5' gutterBottom sx={{ mb: 3 }}>
                  ¿Quieres generar un post? <strong>Comencemos</strong>
                </Typography>

                <Stack spacing={3}>
                  <Controller
                    name='topic'
                    control={control}
                    rules={{
                      required: 'El tema es requerido',
                      minLength: {
                        value: 3,
                        message: 'El tema debe tener al menos 3 caracteres'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label='Tema'
                        placeholder='Ej: Inteligencia Artificial en el marketing'
                        fullWidth
                        required
                        error={!!errors.topic}
                        helperText={errors.topic?.message}
                      />
                    )}
                  />

                  <Controller
                    name='tone'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label='Tono'
                        placeholder='Ej: profesional, motivador, educativo'
                        fullWidth
                        helperText='Opcional: Define el estilo del post'
                      />
                    )}
                  />

                  <Box>
                    <Typography variant='subtitle2' gutterBottom>
                      Extensión
                    </Typography>
                    <ToggleButtonGroup
                      value={lengthValue}
                      exclusive
                      onChange={(e, newValue) => {
                        if (newValue !== null) {
                          setValue('length', newValue)
                        }
                      }}
                      fullWidth
                      color='primary'
                    >
                      <ToggleButton value='short'>Corta</ToggleButton>
                      <ToggleButton value='medium'>Media</ToggleButton>
                      <ToggleButton value='long'>Larga</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {error && (
                    <Alert severity='error' onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    fullWidth
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Generando...' : 'Generar Post'}
                  </Button>
                </Stack>
              </Box>
            </Fade>
          ) : (
            <Typography variant='h5' gutterBottom fontWeight='bold'>
              ✨ Resultado:
            </Typography>
          )}

          {result && (
            <Fade in timeout={500}>
              <Box>
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
                  <Typography variant='h5' gutterBottom fontWeight='bold' sx={{ mb: 0 }}>
                    ✨ Tu Post Generado:
                  </Typography>
                  <Tooltip title={copied ? '¡Copiado!' : 'Copiar al portapapeles'}>
                    <Button
                      variant={copied ? 'contained' : 'outlined'}
                      color={copied ? 'success' : 'primary'}
                      startIcon={copied ? <Icon icon='mdi:check' /> : <Icon icon='mdi:content-copy' />}
                      onClick={handleCopy}
                    >
                      {copied ? 'Copiado' : 'Copiar'}
                    </Button>
                  </Tooltip>
                </Box>

                {/* CONTENEDOR PRINCIPAL DEL RESULTADO */}
                <Paper
                  sx={{
                    p: 4,
                    mt: 2,
                    mb: 3,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* DECORACIÓN */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: 'rgba(63, 81, 181, 0.1)',
                      opacity: 0.5
                    }}
                  />

                  {/* CONTENIDO */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    {/* TEMA Y METADATA */}
                    <Box
                      sx={{
                        pb: 2,
                        mb: 3,
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        opacity: 0.8
                      }}
                    >
                      <Typography
                        variant='h6'
                        fontWeight='bold'
                        sx={{
                          color: 'primary.dark',
                          mb: 1
                        }}
                      >
                        📌 Tema: {result.topic}
                      </Typography>
                      {result.generatedAt && (
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          Generado: {new Date(result.generatedAt).toLocaleString('es-ES')}
                        </Typography>
                      )}
                    </Box>

                    {/* CONTENIDO DEL POST */}
                    <Box
                      sx={{
                        bgcolor: 'background.paper',
                        p: 3,
                        borderRadius: 1.5,
                        mb: 2,
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                        minHeight: 150
                      }}
                    >
                      <Typography
                        variant='body1'
                        sx={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.8,
                          color: 'text.primary',
                          fontWeight: 500
                        }}
                      >
                        {result.content}
                      </Typography>
                    </Box>

                    {/* HASHTAGS */}
                    {result.hashtags && result.hashtags.length > 0 && (
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{
                            color: 'primary.dark',
                            fontWeight: 'bold',
                            mb: 1.5
                          }}
                        >
                          🏷️ Hashtags sugeridos:
                        </Typography>
                        <Stack direction='row' spacing={1} flexWrap='wrap'>
                          {result.hashtags.map(hashtag => (
                            <Chip
                              key={hashtag}
                              label={hashtag}
                              size='small'
                              color='primary'
                              variant='outlined'
                              sx={{
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: 'primary.lighter',
                                  color: 'primary.darker'
                                }
                              }}
                              onClick={() => {
                                navigator.clipboard.writeText(hashtag)
                                setCopied(true)
                                setTimeout(() => setCopied(false), 1500)
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Paper>

                {/* ACCIONES */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant='contained'
                    color='primary'
                    size='large'
                    onClick={() => setResult(null)}
                    startIcon={<Icon icon='mdi:plus' />}
                  >
                    Generar otro post
                  </Button>
                  <Button
                    variant='outlined'
                    color='secondary'
                    size='large'
                    startIcon={<Icon icon='mdi:download' />}
                  >
                    Descargar
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}
        </Paper>

        {/* BETA NOTICE */}
        <Paper sx={{ bgcolor: 'warning.lighter', p: 2, mb: 4, border: '1px solid', borderColor: 'warning.main' }}>
          <Typography variant='h6' color='warning.dark' sx={{ mb: 1 }} fontWeight='bold'>
            🚧 Versión Beta
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Cada IP puede generar hasta <strong>3 posts por día</strong>.
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}
