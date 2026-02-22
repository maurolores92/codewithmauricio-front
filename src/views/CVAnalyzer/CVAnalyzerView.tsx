import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Container, Divider, Grid, LinearProgress, Stack, Typography } from '@mui/material' 
import Icon from 'src/@core/components/icon'

let pdfConfigured = false

const getPdfjs = async () => {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfConfigured) {
    const pdfSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString()
    pdfjs.GlobalWorkerOptions.workerSrc = pdfSrc
    pdfConfigured = true
  }

  return pdfjs
}

type LanguageCode = 'es' | 'en'

type AnalysisResult = {
  language: LanguageCode
  wordCount: number
  score: number
  sections: { key: string; label: string; found: boolean }[]
  signals: {
    hasEmail: boolean
    hasPhone: boolean
    hasLinks: boolean
    hasMetrics: boolean
    hasDates: boolean
  }
  suggestions: string[]
}

type StoredAnalysis = AnalysisResult & {
  fileName: string
  analyzedAt: string
}

const storageKey = 'cvAnalyzer:lastResult'

const esStop = ['el', 'la', 'los', 'las', 'de', 'y', 'en', 'para', 'con', 'como', 'por', 'sobre']
const enStop = ['the', 'and', 'with', 'for', 'in', 'to', 'from', 'about', 'on', 'as']

const esSections = [
  { key: 'summary', label: 'Resumen', matchers: ['resumen', 'perfil', 'sobre mi', 'perfil profesional'] },
  { key: 'experience', label: 'Experiencia', matchers: ['experiencia', 'experiencia laboral', 'trabajo'] },
  { key: 'education', label: 'Educacion', matchers: ['educacion', 'formacion', 'estudios'] },
  { key: 'skills', label: 'Habilidades', matchers: ['habilidades', 'competencias', 'skills', 'tecnologias'] },
  { key: 'projects', label: 'Proyectos', matchers: ['proyectos', 'proyecto'] },
  { key: 'contact', label: 'Contacto', matchers: ['contacto', 'email', 'correo', 'telefono', 'celular'] }
]

const enSections = [
  { key: 'summary', label: 'Summary', matchers: ['summary', 'profile', 'about me'] },
  { key: 'experience', label: 'Experience', matchers: ['experience', 'work experience', 'employment'] },
  { key: 'education', label: 'Education', matchers: ['education', 'academic', 'studies'] },
  { key: 'skills', label: 'Skills', matchers: ['skills', 'technologies', 'stack'] },
  { key: 'projects', label: 'Projects', matchers: ['projects', 'project'] },
  { key: 'contact', label: 'Contact', matchers: ['contact', 'email', 'phone', 'mobile'] }
]

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const getWords = (text: string) => {
  const tokens = text.match(/\b[a-z]+\b/g)

  return tokens ?? []
}

const detectLanguage = (text: string): LanguageCode => {
  const lower = text.toLowerCase()
  if (/[\u00f1\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc]/.test(lower)) {
    return 'es'
  }

  const words = getWords(normalizeText(lower))
  const esScore = words.filter(word => esStop.includes(word)).length
  const enScore = words.filter(word => enStop.includes(word)).length

  if (esScore === enScore) {
    return 'en'
  }

  return esScore > enScore ? 'es' : 'en'
}

const hasAnyMatcher = (normalizedText: string, matchers: string[]) => {
  return matchers.some(matcher => normalizedText.includes(normalizeText(matcher)))
}

const analyzeText = (text: string): AnalysisResult => {
  const language = detectLanguage(text)
  const normalizedText = normalizeText(text)
  const words = getWords(normalizedText)
  const wordCount = words.length
  const sectionsConfig = language === 'es' ? esSections : enSections

  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)
  const hasPhone = /\+?\d[\d\s().-]{7,}\d/.test(text)
  const hasLinks = /(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.[a-z]{2,}(?:\/\S*)?/i.test(text)
  const hasMetrics = /\b\d+%?\b/.test(text)
  const hasDates = /\b(19|20)\d{2}\b/.test(text)

  const sections = sectionsConfig.map(section => {
    const matched = hasAnyMatcher(normalizedText, section.matchers)
    const found = section.key === 'contact' ? matched || hasEmail || hasPhone || hasLinks : matched

    return {
      key: section.key,
      label: section.label,
      found
    }
  })

  const suggestions: string[] = []

  const missingSections = sections.filter(section => !section.found).map(section => section.key)
  const isShort = wordCount > 0 && wordCount < 200
  const isLong = wordCount > 900

  if (language === 'es') {
    if (missingSections.includes('summary')) suggestions.push('Agrega un resumen profesional de 2 a 3 lineas.')
    if (missingSections.includes('experience')) suggestions.push('Incluye experiencia laboral con logros concretos.')
    if (missingSections.includes('education')) suggestions.push('Agrega tu educacion o formacion relevante.')
    if (missingSections.includes('skills')) suggestions.push('Destaca habilidades tecnicas clave para el rol.')
    if (missingSections.includes('projects')) suggestions.push('Suma proyectos para mostrar impacto real.')
    if (!hasEmail || !hasPhone) suggestions.push('Asegurate de mostrar email y telefono visibles.')
    if (!hasLinks) suggestions.push('Agrega links a LinkedIn o portafolio.')
    if (!hasMetrics) suggestions.push('Incluye resultados medibles (numeros, %, tiempos).')
    if (!hasDates) suggestions.push('Agrega fechas para cada experiencia o estudio.')
    if (isShort) suggestions.push('El CV se ve corto. Agrega mas detalle y logros.')
    if (isLong) suggestions.push('El CV es largo. Resume a 1-2 paginas si es posible.')
  } else {
    if (missingSections.includes('summary')) suggestions.push('Add a concise professional summary (2-3 lines).')
    if (missingSections.includes('experience')) suggestions.push('Include work experience with clear outcomes.')
    if (missingSections.includes('education')) suggestions.push('Add your education or relevant training.')
    if (missingSections.includes('skills')) suggestions.push('Highlight key technical skills for the role.')
    if (missingSections.includes('projects')) suggestions.push('Add projects to show real impact.')
    if (!hasEmail || !hasPhone) suggestions.push('Make sure email and phone are visible.')
    if (!hasLinks) suggestions.push('Add links to LinkedIn or portfolio.')
    if (!hasMetrics) suggestions.push('Include measurable results (numbers, %, time).')
    if (!hasDates) suggestions.push('Add dates for each role or education item.')
    if (isShort) suggestions.push('The CV looks short. Add more details and outcomes.')
    if (isLong) suggestions.push('The CV is long. Try to keep it to 1-2 pages.')
  }

  let score = 100
  score -= missingSections.length * 8
  if (!hasEmail) score -= 10
  if (!hasPhone) score -= 8
  if (!hasLinks) score -= 6
  if (!hasMetrics) score -= 10
  if (!hasDates) score -= 6
  if (isShort) score -= 12
  if (isLong) score -= 8
  score = Math.max(0, Math.min(100, score))

  return {
    language,
    wordCount,
    score,
    sections,
    signals: { hasEmail, hasPhone, hasLinks, hasMetrics, hasDates },
    suggestions
  }
}

const extractTextFromPdf = async (file: File) => {
  const { getDocument } = await getPdfjs()
  const data = await file.arrayBuffer()
  const pdf = await getDocument({ data }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items
      .map(item => {
        if (typeof (item as any).str === 'string') {
          return (item as any).str
        }

        return ''
      })
      .join(' ')

    fullText += `\n${strings}`
  }

  return fullText.trim()
}

const CVAnalyzerView = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StoredAnalysis | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(storageKey)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as StoredAnalysis
      setResult(parsed)
    } catch {
      localStorage.removeItem(storageKey)
    }
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setFile(nextFile)
    setError(null)
  }

  const handleAnalyze = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const text = await extractTextFromPdf(file)
      if (!text) {
        throw new Error('No se pudo leer texto. Usa un PDF digital.')
      }

      const analysis = analyzeText(text)
      const payload: StoredAnalysis = {
        ...analysis,
        fileName: file.name,
        analyzedAt: new Date().toISOString()
      }

      setResult(payload)
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(payload))
      }
    } catch (err: any) {
      setError(err.message || 'Error al analizar el PDF')
    } finally {
      setLoading(false)
    }
  }, [file])

  const handleClear = () => {
    setResult(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
  }

  const scoreLabel = useMemo(() => {
    if (!result) return ''
    if (result.score >= 80) return result.language === 'es' ? 'Muy bien' : 'Strong'
    if (result.score >= 60) return result.language === 'es' ? 'Bien' : 'Good'

    return result.language === 'es' ? 'Mejorable' : 'Needs work'
  }, [result])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth='md'>
        <Box textAlign='center' mb={6}>
          <Typography variant='h3' component='h1' fontWeight={800} gutterBottom>
            CV Analyzer (PDF)
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 720, mx: 'auto' }}>
            Analisis local y gratuito. El PDF no se sube al servidor.
          </Typography>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant='h5' sx={{ mb: 2 }} fontWeight='bold'>
              ⚡ Tecnologias y Herramientas de CV Analyzer 
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                  Frontend
                </Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ rowGap: 1, columnGap: 1 }}>
                  <Chip label='React' size='small' color='primary' variant='outlined' />
                  <Chip label='Next.js' size='small' color='primary' variant='outlined' />
                  <Chip label='TypeScript' size='small' color='primary' variant='outlined' />
                  <Chip label='MUI' size='small' color='primary' variant='outlined' />
                  <Chip label='LocalStorage' size='small' color='primary' variant='outlined' />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                  Analisis
                </Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ rowGap: 1, columnGap: 1 }}>
                  <Chip label='pdfjs-dist' size='small' color='secondary' variant='outlined' />
                  <Chip label='Regex' size='small' color='secondary' variant='outlined' />
                  <Chip label='Text normalization' size='small' color='secondary' variant='outlined' />
                  <Chip label='Language detection' size='small' color='secondary' variant='outlined' />
                  <Chip label='Heuristics' size='small' color='secondary' variant='outlined' />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Alert severity='info'>Solo funciona con PDF digital (no escaneado).</Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Button variant='outlined' component='label' startIcon={<Icon icon='mdi:file-pdf-box' />}>
                  Seleccionar PDF
                  <input type='file' hidden accept='application/pdf' onChange={handleFileChange} />
                </Button>
                <Typography variant='body2' color='text.secondary'>
                  {file ? file.name : 'Ningun archivo seleccionado'}
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant='contained'
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  startIcon={<Icon icon='mdi:magnify' />}
                >
                  {loading ? 'Analizando...' : 'Analizar CV'}
                </Button>
                {result && (
                  <Button variant='text' color='inherit' onClick={handleClear} startIcon={<Icon icon='mdi:delete' />}>
                    Limpiar analisis
                  </Button>
                )}
              </Stack>
              {loading && <LinearProgress />}
              {error && (
                <Alert severity='error' onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant='h5' fontWeight={700} gutterBottom>
                    Resultado
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    <Chip label={`Idioma: ${result.language.toUpperCase()}`} color='primary' variant='outlined' />
                    <Chip label={`Palabras: ${result.wordCount}`} variant='outlined' />
                    <Chip label={`Score: ${result.score} (${scoreLabel})`} color='success' variant='outlined' />
                  </Stack>
                  <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 1 }}>
                    Archivo: {result.fileName}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant='h6' fontWeight={700} gutterBottom>
                    Secciones detectadas
                  </Typography>
                  <Grid container spacing={2}>
                    {result.sections.map(section => (
                      <Grid item xs={12} sm={6} key={section.key}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Icon
                            icon={section.found ? 'mdi:check-circle' : 'mdi:close-circle'}
                            color={section.found ? 'success' : 'error'}
                          />
                          <Typography variant='body2'>{section.label}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box>
                  <Typography variant='h6' fontWeight={700} gutterBottom>
                    Senales basicas
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { key: 'email', label: 'Email', value: result.signals.hasEmail },
                      { key: 'phone', label: 'Telefono', value: result.signals.hasPhone },
                      { key: 'links', label: 'Links', value: result.signals.hasLinks },
                      { key: 'metrics', label: 'Metricas', value: result.signals.hasMetrics },
                      { key: 'dates', label: 'Fechas', value: result.signals.hasDates }
                    ].map(item => (
                      <Grid item xs={12} sm={6} key={item.key}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Icon icon={item.value ? 'mdi:check' : 'mdi:minus-circle'} color={item.value ? 'success' : 'warning'} />
                          <Typography variant='body2'>{item.label}</Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Box>
                  <Typography variant='h6' fontWeight={700} gutterBottom>
                    Sugerencias
                  </Typography>
                  {result.suggestions.length === 0 ? (
                    <Alert severity='success'>Todo se ve bien. Sigue optimizando con logros medibles.</Alert>
                  ) : (
                    <Stack spacing={1}>
                      {result.suggestions.map((suggestion, index) => (
                        <Alert key={`${suggestion}-${index}`} severity='warning'>
                          {suggestion}
                        </Alert>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}

export default CVAnalyzerView
