import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import type { ACLObj, AppAbility } from 'src/configs/acl'
import { AbilityContext } from 'src/layouts/components/acl/Can'
import { buildAbilityFor } from 'src/configs/acl'
import NotAuthorized from 'src/pages/401'
import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

interface AclGuardProps {
  children: ReactNode
  authGuard?: boolean
  guestGuard?: boolean
  aclAbilities: ACLObj
}

const AclGuard = (props: AclGuardProps) => {
  const { aclAbilities, children, guestGuard = false, authGuard = true } = props
  const auth = useAuth()
  const router = useRouter()
  let ability: AppAbility | undefined

  useEffect(() => {
    if (auth.user && !guestGuard && router.route === '/') {
      const homeRoute = getHomeRoute(auth.user.permissions)
      router.replace(homeRoute)
    }
  }, [auth.user, guestGuard, router])

  if (auth.user) {
    const role = auth.user.role || 'admin';
    ability = buildAbilityFor(role, aclAbilities.subject)
    
    if (router.route === '/') {
      return <Spinner />
    }
  }

  if (guestGuard || router.route === '/404' || router.route === '/500' || !authGuard) {
    // If user is logged in and his ability is built
    if (auth.user && ability) {
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    } else {
      // If user is not logged in (render pages like login, register etc..)
      return <>{children}</>
    }
  }

  // Check the access of current user and render pages
  const canAccess = ability && auth.user && ability.can(aclAbilities.action, aclAbilities.subject);
  
  if (canAccess && ability) {
    if (router.route === '/') {
      return <Spinner />
    }

    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
  }
  
  return (
    <BlankLayout>
      <NotAuthorized />
    </BlankLayout>
  )
}

export default AclGuard
