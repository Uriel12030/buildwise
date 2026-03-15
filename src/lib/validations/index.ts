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
  employee_id: z.string().uuid('Select an employee'),
  hours_worked: z.number().min(0).max(24, 'Max 24 hours'),
  overtime_hours: z.number().min(0).max(24, 'Max 24 hours'),
  notes: z.string().optional().nullable(),
})

export const dailyLogSchema = z.object({
  project_id: z.string().uuid('Select a project'),
  log_date: z.string().min(1, 'Date is required'),
  weather: z.string().optional().nullable(),
  work_summary: z.string().min(1, 'Work summary is required'),
  notes: z.string().optional().nullable(),
  issues: z.string().optional().nullable(),
  status: z.enum(['draft', 'submitted', 'approved']),
  workers: z.array(dailyLogWorkerSchema).optional(),
})

export type DailyLogFormData = z.infer<typeof dailyLogSchema>
export type DailyLogWorkerFormData = z.infer<typeof dailyLogWorkerSchema>
