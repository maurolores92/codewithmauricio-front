// ** React Imports
import { createContext, useEffect, useState, ReactNode, useCallback } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, RegisterParams, ErrCallbackType, UserDataType } from './types'
import apiConnector from 'src/services/api.service'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  const router = useRouter()
  const initAuth = useCallback(async() => {
    const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
    const storedUserData = window.localStorage.getItem('userData');

    if (storedToken && storedUserData) {
      setLoading(true);
      try {
        const userData = JSON.parse(storedUserData);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('userData')
        localStorage.removeItem('accessToken');
        setUser(null)
      } finally {
        setLoading(false)
      }
    } else if (storedToken) {
      // Si solo hay token pero no userData, intentar obtener del /auth/me
      setLoading(true);
      try {
        const response: any = await apiConnector.get('/auth/me');
        setUser(response);
        window.localStorage.setItem('userData', JSON.stringify(response));
      } catch (error) {
        localStorage.removeItem('userData')
        localStorage.removeItem('accessToken');
        setUser(null)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, []);

  useEffect(() => {

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initAuth])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    // Extraer solo email y password para el backend
    const { email, password } = params;
    
    
    apiConnector
      .post(authConfig.loginEndpoint, { email, password })
      .then(async (response: any) => {
        console.log('[AUTH] Login response received:', {
          hasAccessToken: !!response.accessToken,
          userData: response.user || response,
          user: response
        });
        
        // Guardar el token
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.accessToken)
        
        // Obtener datos completos del usuario con el token
        try {
          const userDetailResponse: any = await apiConnector.get('/auth/me');
          
          setUser(userDetailResponse)
          window.localStorage.setItem('userData', JSON.stringify(userDetailResponse))
          window.localStorage.setItem('role', userDetailResponse.role || 'usuario')
          
          // Redirigir según el returnUrl o a dashboards
          const returnUrl = router.query.returnUrl
          const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards'
          
          router.replace(redirectURL as string)
        } catch (error) {
          const userData = response.user || response
          setUser(userData)
          window.localStorage.setItem('userData', JSON.stringify(userData))
          window.localStorage.setItem('role', userData.role || 'usuario')
          router.replace('/dashboards')
        }
      })
      .catch(err => {
        console.error('[AUTH] Login error:', err);
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    apiConnector
      .post(authConfig.registerEndpoint, params)
      .then(async (response: any) => {
        // Guardar el token
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.accessToken)
        
        // Obtener datos completos del usuario
        try {
          const userDetailResponse: any = await apiConnector.get('/auth/me');
          setUser(userDetailResponse)
          window.localStorage.setItem('userData', JSON.stringify(userDetailResponse))
          window.localStorage.setItem('role', userDetailResponse.role || 'usuario')
          
          // Redirigir al dashboard
          router.replace('/dashboards')
        } catch (error) {
          console.error('Error al obtener detalles del usuario:', error)
          const userData = response.user || response
          setUser(userData)
          window.localStorage.setItem('userData', JSON.stringify(userData))
          window.localStorage.setItem('role', userData.role || 'usuario')
          router.replace('/dashboards')
        }
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
