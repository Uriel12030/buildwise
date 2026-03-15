import type { UserRole } from '@/types'

type Permission =
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'employees.view'
  | 'employees.create'
  | 'employees.edit'
  | 'employees.delete'
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'logs.view'
  | 'logs.create'
  | 'logs.edit'
  | 'logs.delete'
  | 'logs.approve'
  | 'dashboard.view'

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
    'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'logs.view', 'logs.create', 'logs.edit', 'logs.delete', 'logs.approve',
    'dashboard.view',
  ],
  office_manager: [
    'clients.view', 'clients.create', 'clients.edit',
    'employees.view', 'employees.create', 'employees.edit',
    'projects.view', 'projects.create', 'projects.edit',
    'logs.view',
    'dashboard.view',
  ],
  project_manager: [
    'clients.view',
    'employees.view',
    'projects.view', 'projects.edit',
    'logs.view', 'logs.create', 'logs.edit', 'logs.approve',
    'dashboard.view',
  ],
  site_manager: [
    'clients.view',
    'employees.view',
    'projects.view',
    'logs.view', 'logs.create', 'logs.edit',
    'dashboard.view',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function canAccess(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}
