import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company_number: z.string().optional().nullable(),
  contact_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  is_active: z.boolean(),
})

export type ClientFormData = z.infer<typeof clientSchema>

export const employeeSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  national_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  role_title: z.string().min(1, 'Role title is required'),
  employee_type: z.enum(['field', 'office', 'freelancer']),
  hourly_rate: z.number().min(0, 'Must be positive'),
  status: z.enum(['active', 'inactive']),
  hire_date: z.string().min(1, 'Hire date is required'),
  end_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  project_code: z.string().min(1, 'Project code is required'),
  client_id: z.string().uuid('Select a client'),
  status: z.enum(['planning', 'active', 'on_hold', 'completed']),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  project_manager_user_id: z.string().uuid().optional().nullable(),
  site_manager_user_id: z.string().uuid().optional().nullable(),
})

export type ProjectFormData = z.infer<typeof projectSchema>

export const dailyLogWorkerSchema = z.object({
  worker_type: z.enum(['company', 'foreign', 'subcontractor']),
  employee_id: z.string().optional().nullable(),
  worker_name: z.string().optional().nullable(),
  role_title: z.string().optional().nullable(),
  hours_worked: z.number().min(0).max(24, 'Max 24 hours'),
  overtime_hours: z.number().min(0).max(24, 'Max 24 hours'),
  notes: z.string().optional().nullable(),
})

export const dailyLogActivitySchema = z.object({
  seq_number: z.number().min(1),
  description: z.string(),
  is_irregular: z.boolean(),
  notes: z.string().optional().nullable(),
})

export const dailyLogEquipmentSchema = z.object({
  equipment_type: z.enum(['company', 'subcontractor']),
  identification_number: z.string().optional().nullable(),
  equipment_name: z.string().min(1, 'Equipment name is required'),
  notes: z.string().optional().nullable(),
})

export const dailyLogMaterialSchema = z.object({
  material_name: z.string().min(1, 'Material name is required'),
  quantity: z.string().optional().nullable(),
  supplier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const dailyLogSchema = z.object({
  project_id: z.string().uuid('Select a project'),
  log_date: z.string().min(1, 'Date is required'),
  weather: z.string().optional().nullable(),
  work_summary: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  issues: z.string().optional().nullable(),
  status: z.enum(['draft', 'submitted', 'approved']),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  main_contractor: z.string().optional().nullable(),
  site_address: z.string().optional().nullable(),
  workers: z.array(dailyLogWorkerSchema).optional(),
  activities: z.array(dailyLogActivitySchema).optional(),
  equipment: z.array(dailyLogEquipmentSchema).optional(),
  materials: z.array(dailyLogMaterialSchema).optional(),
})

export type DailyLogFormData = z.infer<typeof dailyLogSchema>
export type DailyLogWorkerFormData = z.infer<typeof dailyLogWorkerSchema>
export type DailyLogActivityFormData = z.infer<typeof dailyLogActivitySchema>
export type DailyLogEquipmentFormData = z.infer<typeof dailyLogEquipmentSchema>
export type DailyLogMaterialFormData = z.infer<typeof dailyLogMaterialSchema>
