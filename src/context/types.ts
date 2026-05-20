export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterParams = {
  name: string
  lastName: string
  email: string
  phone: string
  password: string
}

export type PermissionType = {
  id: number
  name: string
  slug: string
  description: string
  type: 'page' | 'component' | 'action'
  resource: string
  createdAt: string
  updatedAt: string
  RolePermission?: {
    roleId: number
    permissionId: number
  }
}

export type UserDataType = {
  id: number
  name: string
  lastName?: string
  email: string
  phone?: string
  role?: string
  avatar?: string | null
  permissions?: PermissionType[]
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => void
}
