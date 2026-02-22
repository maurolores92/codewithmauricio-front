import React, { useCallback, useMemo, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Container, Dialog, DialogContent, DialogTitle, Divider, Grid, LinearProgress, Stack, TextField, Typography } from '@mui/material'
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

type SummaryResult = {
  summary: string
  wordCount: number
  chunkCount: number
}

type QAResult = {
  answer: string
  relevance: number
}

const minWordLength = 4
const maxKeywords = 12
const maxSummarySentences = 6

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const splitIntoSentences = (text: string) => {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []

  return cleaned.split(/(?<=[.!?])\s+/)
}

const splitIntoChunks = (text: string, maxWords = 180) => {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []

  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
  }

  return chunks
}

const extractKeywords = (text: string) => {
  const normalized = normalizeText(text)
  const tokens = normalized.match(/\b[a-z]+\b/g) ?? []
  const freq = new Map<string, number>()

  tokens.forEach(token => {
    if (token.length < minWordLength) return
    freq.set(token, (freq.get(token) ?? 0) + 1)
  })

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

const scoreSentence = (sentence: string, keywords: string[]) => {
  const normalized = normalizeText(sentence)
  let score = 0
  keywords.forEach(keyword => {
    if (normalized.includes(keyword)) {
      score += 1
    }
  })

  return score
}

const summarizeText = (text: string) => {
  const sentences = splitIntoSentences(text)
  if (sentences.length === 0) return []
  const keywords = extractKeywords(text)

  const scored = sentences.map(sentence => ({
    sentence,
    score: scoreSentence(sentence, keywords)
  }))

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(maxSummarySentences, sentences.length))
    .map(item => item.sentence.trim())
}

const buildSummaryText = (summarySentences: string[]): string => {
  return summarySentences.join(' ')
}

const findAnswers = (question: string, text: string): QAResult[] => {
  const questionWords = normalizeText(question)
    .split(/\s+/)
    .filter(w => w.length > 3)
  
  const sentences = splitIntoSentences(text)
  
  const scored = sentences
    .map(sentence => {
      const normalized = normalizeText(sentence)
      let relevance = 0
      
      questionWords.forEach(word => {
        if (normalized.includes(word)) {
          relevance += 1
        }
      })
      
      return { answer: sentence.trim(), relevance }
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
  
  return scored
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

const renderPdfFirstPage = async (file: File): Promise<string> => {
  const { getDocument } = await getPdfjs()
  const data = await file.arrayBuffer()
  const pdf = await getDocument({ data }).promise
  const page = await pdf.getPage(1)
  
  const viewport = page.getViewport({ scale: 0.5 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context failed')
  
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  await page.render({ canvasContext: context, viewport }).promise
  
  return canvas.toDataURL('image/jpeg')
}

const PdfSummarizerView = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [pdfThumb, setPdfThumb] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pdfText, setPdfText] = useState<string>('')
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<QAResult[]>([])
  const [askingQuestion, setAskingQuestion] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setFile(nextFile)
    setError(null)
    setPdfThumb(null)
    
    if (nextFile) {
      renderPdfFirstPage(nextFile)
        .then(setPdfThumb)
        .catch(() => setPdfThumb(null))
    }
  }

  const handleSummarize = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const text = await extractTextFromPdf(file)
      if (!text) {
        throw new Error('No se pudo leer texto. Usa un PDF digital.')
      }

      const chunks = splitIntoChunks(text)
      const summarySentences = summarizeText(text)
      const summaryText = buildSummaryText(summarySentences)
      
      setPdfText(text)

      setResult({
        summary: summaryText,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        chunkCount: chunks.length
      })
    } catch (err: any) {
      setError(err.message || 'Error al procesar el PDF')
    } finally {
      setLoading(false)
    }
  }, [file])

  const summaryLabel = useMemo(() => {
    if (!result) return ''

    return result.summary.length > 0 ? 'Resumen generado' : 'Resumen no disponible'
  }, [result])

  const handleAskQuestion = useCallback(() => {
    if (!question.trim() || !pdfText) return
    setAskingQuestion(true)
    
    try {
      const results = findAnswers(question, pdfText)
      setAnswers(results)
    } catch (err) {
      setAnswers([])
    } finally {
      setAskingQuestion(false)
    }
  }, [question, pdfText])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth='md'>
        <Box textAlign='center' mb={6}>
          <Typography variant='h3' component='h1' fontWeight={800} gutterBottom>
            Resumidor Inteligente de PDF
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 720, mx: 'auto' }}>
            Resume PDFs, genera preguntas tipo entrevista y crea flashcards. Analisis local y gratuito.
          </Typography>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant='h5' sx={{ mb: 2 }} fontWeight='bold'>
              Tecnologias y herramientas
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
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 1 }}>
                  Analisis
                </Typography>
                <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ rowGap: 1, columnGap: 1 }}>
                  <Chip label='pdfjs-dist' size='small' color='secondary' variant='outlined' />
                  <Chip label='Chunking' size='small' color='secondary' variant='outlined' />
                  <Chip label='TF-IDF' size='small' color='secondary' variant='outlined' />
                  <Chip label='Semantic search' size='small' color='secondary' variant='outlined' />
                  <Chip label='Q&A extraction' size='small' color='secondary' variant='outlined' />
                  <Chip label='Flashcards' size='small' color='secondary' variant='outlined' />
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
              {pdfThumb && (
                <Box
                  sx={{
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    overflow: 'hidden',
                    maxWidth: 150,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                  onClick={() => setModalOpen(true)}
                >
                  <img src={pdfThumb} alt='PDF preview' style={{ width: '100%', display: 'block' }} />
                </Box>
              )}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant='contained'
                  onClick={handleSummarize}
                  disabled={!file || loading}
                  startIcon={<Icon icon='mdi:robot' />}
                >
                  {loading ? 'Procesando...' : 'Generar resumen'}
                </Button>
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
                    <Chip label={`Palabras: ${result.wordCount}`} variant='outlined' />
                    <Chip label={`Chunks: ${result.chunkCount}`} variant='outlined' />
                    <Chip label={summaryLabel} color='success' variant='outlined' />
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant='h6' fontWeight={700} gutterBottom>
                    Resumen
                  </Typography>
                  <Typography variant='body1' sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {result.summary}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant='h6' fontWeight={700} gutterBottom>
                    Preguntas sobre el PDF
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        fullWidth
                        placeholder='Escribe tu pregunta aqui...'
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAskQuestion()}
                        disabled={askingQuestion}
                      />
                      <Button
                        variant='contained'
                        onClick={handleAskQuestion}
                        disabled={!question.trim() || askingQuestion}
                        startIcon={<Icon icon='mdi:send' />}
                      >
                        {askingQuestion ? 'Buscando...' : 'Buscar'}
                      </Button>
                    </Stack>
                    
                    {answers.length > 0 && (
                      <Stack spacing={2}>
                        <Typography variant='subtitle2' fontWeight={700}>
                          Respuestas encontradas ({answers.length})
                        </Typography>
                        {answers.map((result, index) => (
                          <Alert key={`${result.answer}-${index}`} severity='success'>
                            <Typography variant='body2'>{result.answer}</Typography>
                            <Typography variant='caption' sx={{ display: 'block', mt: 1 }}>
                              Relevancia: {result.relevance} coincidencias
                            </Typography>
                          </Alert>
                        ))}
                      </Stack>
                    )}
                    
                    {question && answers.length === 0 && !askingQuestion && (
                      <Alert severity='info'>No se encontraron respuestas relevantes para tu pregunta.</Alert>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth='sm' fullWidth>
          <DialogTitle>Vista previa del PDF</DialogTitle>
          <DialogContent>
            {pdfThumb && (
              <Box sx={{ mt: 2 }}>
                <img src={pdfThumb} alt='PDF full preview' style={{ width: '100%', display: 'block' }} />
                <Typography variant='caption' color='text.secondary' sx={{ mt: 2, display: 'block' }}>
                  Primera página del PDF
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  )
}

export default PdfSummarizerView
