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
  start_time: string | null
  end_time: string | null
  main_contractor: string | null
  site_address: string | null
  created_at: string
  updated_at: string
  project?: Project
  site_manager?: User
  workers?: DailyLogWorker[]
  files?: DailyLogFile[]
  activities?: DailyLogActivity[]
  equipment?: DailyLogEquipment[]
  materials?: DailyLogMaterial[]
}

export interface DailyLogWorker {
  id: string
  daily_log_id: string
  employee_id: string | null
  worker_type: 'company' | 'foreign' | 'subcontractor'
  worker_name: string | null
  role_title: string | null
  hours_worked: number
  overtime_hours: number
  notes: string | null
  employee?: Employee
}

export interface DailyLogActivity {
  id: string
  daily_log_id: string
  seq_number: number
  description: string
  is_irregular: boolean
  notes: string | null
}

export interface DailyLogEquipment {
  id: string
  daily_log_id: string
  equipment_type: 'company' | 'subcontractor'
  identification_number: string | null
  equipment_name: string
  notes: string | null
}

export interface DailyLogMaterial {
  id: string
  daily_log_id: string
  material_name: string
  quantity: string | null
  supplier: string | null
  notes: string | null
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

// Equipment types
export type EquipmentCategory = 'heavy_equipment' | 'vehicle' | 'truck' | 'trailer' | 'tool' | 'other'
export type EquipmentStatus = 'active' | 'inactive' | 'maintenance' | 'damaged' | 'archived'

export interface Equipment {
  id: string
  name: string
  equipment_code: string | null
  category: EquipmentCategory
  type_name: string | null
  status: EquipmentStatus
  chassis_number: string | null
  license_plate: string | null
  purchase_cost: number | null
  operating_cost: number | null
  hourly_cost: number | null
  insurance_company: string | null
  insurance_expiry: string | null
  test_expiry: string | null
  notes: string | null
  assigned_employee_id: string | null
  assigned_employee?: Employee
  monday_item_id: string | null
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  name: string
  item_name: string | null
  supplier_name: string | null
  quantity: number
  status: string
  priority: string | null
  received_date: string | null
  expiration_date: string | null
  notes: string | null
  monday_item_id: string | null
  created_at: string
  updated_at: string
}

export interface TransportLog {
  id: string
  log_date: string
  transport_type: string
  from_project_id: string | null
  to_project_id: string | null
  from_project_name: string | null
  to_project_name: string | null
  source_location: string | null
  material_type: string | null
  quantity: number | null
  unit: string | null
  certificate_number: string | null
  billing_notes: string | null
  notes: string | null
  monday_group: string | null
  from_project?: { id: string; name: string }
  to_project?: { id: string; name: string }
  created_at: string
  updated_at: string
}

// Dashboard types
export interface DashboardStats {
  activeProjects: number
  totalEmployees: number
  logsToday: number
  pendingLogs: number
}
