import { AbilityBuilder, Ability } from '@casl/ability'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'
export type AppAbility = Ability<[Actions, Subjects]> | undefined
export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

const defineRulesFor = (role: string, subject: string) => {
  const { can, rules } = new AbilityBuilder(AppAbility)
  
  if (role === 'superadmin') {
    can('manage', 'all')
  } else {
    // Todos los demás roles (dinámicos o no) pueden acceder a nivel de página
    // El control de acceso granular se hace con permisos específicos en PermissionGuard/ConditionalRender
    can(['read', 'create', 'update', 'delete', 'manage'], subject)
  }

  return rules
}

export const buildAbilityFor = (role: string, subject: string): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
