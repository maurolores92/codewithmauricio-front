import KanbanBoardsView from 'src/views/kanban/KanbanBoardsView'
import PermissionGuard from 'src/components/PermissionGuard'

const KanbanBoardsPage = () => {
  return (
    <PermissionGuard permission='view-boards'>
      <KanbanBoardsView />
    </PermissionGuard>
  )
}

export default KanbanBoardsPage
