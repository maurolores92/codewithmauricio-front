import KanbanBoardView from 'src/views/kanban/KanbanBoardView'
import PermissionGuard from 'src/components/PermissionGuard'

const KanbanBoardPage = () => {
  return (
    <PermissionGuard permission='view-boards'>
      <KanbanBoardView />
    </PermissionGuard>
  )
}

export default KanbanBoardPage
