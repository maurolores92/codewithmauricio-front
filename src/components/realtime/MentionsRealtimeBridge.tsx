import apiConnector from 'src/services/api.service'
import useMentionsRealtime from 'src/hooks/useMentionsRealtime'

const MentionsRealtimeBridge = () => {
  useMentionsRealtime({
    onMentionCreated: () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mentions-refresh-requested'))
      }

      // Trigger a lightweight background hit so front can stay in sync even
      // if no component is currently listening to the custom event.
      apiConnector
        .get('/comments/mentions/me', { status: 'unread' })
        .catch(() => null)
    },
    showToast: true,
  })

  return null
}

export default MentionsRealtimeBridge
