export type Board = {
  id: number
  name: string
}

export type BoardColumn = {
  id: number
  name: string
  position: number
}

export type User = {
  id: number
  name: string
  lastName?: string
  email: string
}

export type Task = {
  id: number
  name: string
  description?: string
  position: number
  assignedUserId?: number
  boardColumnId: number
  assignedUser?: User
}
