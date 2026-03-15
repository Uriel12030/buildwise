export type UserRole = 'admin' | 'office_manager' | 'project_manager' | 'site_manager'

export interface User {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  company_number: string | null
  contact_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  active_projects_count?: number
}

export type EmployeeType = 'field' | 'office' | 'freelancer'
export type EmployeeStatus = 'active' | 'inactive'

export interface Employee {
  id: string
  full_name: string
  national_id: string | null
  phone: string | null
  email: string | null
  role_title: string
  employee_type: EmployeeType
  hourly_rate: number
  status: EmployeeStatus
  hire_date: string
  end_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed'

export interface Project {
  id: string
  name: string
  project_code: string
  client_id: string
  status: ProjectStatus
  location: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  project_manager_user_id: string | null
  site_manager_user_id: string | null
  created_at: string
  updated_at: string
  client?: Client
  project_manager?: User
  site_manager?: User
}

export interface ProjectEmployee {
  id: string
  project_id: string
  employee_id: string
  assigned_from: string
  assigned_to: string | null
  created_at: string
  employee?: Employee
}

export type DailyLogStatus = 'draft' | 'submitted' | 'approved'

export interface DailyLog {
  id: string
  project_id: string
  log_date: string
  site_manager_user_id: string | null
  weather: string | null
  work_summary: string
  notes: string | null
  issues: string | null
  status: DailyLogStatus
  created_at: string
  updated_at: string
  project?: Project
  site_manager?: User
  workers?: DailyLogWorker[]
  files?: DailyLogFile[]
}

export interface DailyLogWorker {
  id: string
  daily_log_id: string
  employee_id: string
  hours_worked: number
  overtime_hours: number
  notes: string | null
  employee?: Employee
}

export interface DailyLogFile {
  id: string
  daily_log_id: string
  file_path: string
  file_name: string
  file_type: string
  uploaded_at: string
}

export interface ActivityLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  user_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  user?: User
}

// Dashboard types
export interface DashboardStats {
  activeProjects: number
  totalEmployees: number
  logsToday: number
  pendingLogs: number
}
