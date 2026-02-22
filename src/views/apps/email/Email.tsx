// ** React Imports
import { useState, useEffect } from 'react'

// ** Redux Imports
import { useDispatch } from 'react-redux'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Types
import { AppDispatch } from 'src/store'
import { MailLayoutType } from 'src/types/apps/emailTypes'

import ComposePopup from 'src/views/apps/email/ComposePopup'


const EmailAppLayout = ({ folder, label }: MailLayoutType) => {
  // ** States
  const [query] = useState<string>('')
  const [composeOpen, setComposeOpen] = useState<boolean>(false)

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const dispatch = useDispatch<AppDispatch>()
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))

  // ** Vars
  const { skin } = settings
  const composePopupWidth = mdAbove ? 754 : smAbove ? 520 : '100%'
  const routeParams = {
    label: label || '',
    folder: folder || 'inbox'
  }

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchMails({ q: query || '', folder: routeParams.folder, label: routeParams.label }))
  }, [dispatch, query, routeParams.folder, routeParams.label])

  const toggleComposeOpen = () => setComposeOpen(!composeOpen)

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
      }}
    >
      <ComposePopup
        mdAbove={mdAbove}
        composeOpen={composeOpen}
        composePopupWidth={composePopupWidth}
        toggleComposeOpen={toggleComposeOpen}
      />
    </Box>
  )
}

export default EmailAppLayout
