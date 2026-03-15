'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema, type EmployeeFormData } from '@/lib/validations'
import { createEmployeeAction, updateEmployeeAction } from '@/features/employees/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Employee } from '@/types'

interface EmployeeFormProps {
  employee?: Employee
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!employee

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          full_name: employee.full_name,
          national_id: employee.national_id,
          phone: employee.phone,
          email: employee.email,
          role_title: employee.role_title,
          employee_type: employee.employee_type,
          hourly_rate: employee.hourly_rate,
          status: employee.status,
          hire_date: employee.hire_date,
          end_date: employee.end_date,
          notes: employee.notes,
        }
      : {
          employee_type: 'field',
          status: 'active',
          hourly_rate: 0,
          hire_date: new Date().toISOString().split('T')[0],
        },
  })

  const onSubmit = async (data: EmployeeFormData) => {
    setLoading(true)
    try {
      if (isEdit) {
        await updateEmployeeAction(employee.id, data)
        toast.success('העובד עודכן')
        router.push(`/employees/${employee.id}`)
      } else {
        const newEmployee = await createEmployeeAction(data)
        toast.success('העובד נוצר')
        router.push(`/employees/${newEmployee.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'עריכת עובד' : 'עובד חדש'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="שם מלא" required error={errors.full_name?.message}>
              <Input {...register('full_name')} />
            </FormFieldWrapper>
            <FormFieldWrapper label="תעודת זהות" error={errors.national_id?.message}>
              <Input {...register('national_id')} />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="טלפון" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormFieldWrapper>
            <FormFieldWrapper label="אימייל" error={errors.email?.message}>
              <Input {...register('email')} type="email" />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="תפקיד" required error={errors.role_title?.message}>
              <Input {...register('role_title')} placeholder="לדוגמה: מפעיל, חשמלאי" />
            </FormFieldWrapper>
            <FormFieldWrapper label="סוג עובד" required error={errors.employee_type?.message}>
              <Select
                value={watch('employee_type')}
                onValueChange={(v) => v && setValue('employee_type', v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field">שטח</SelectItem>
                  <SelectItem value="office">משרד</SelectItem>
                  <SelectItem value="freelancer">פרילנסר</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormFieldWrapper label="תעריף לשעה (₪)" required error={errors.hourly_rate?.message}>
              <Input {...register('hourly_rate', { valueAsNumber: true })} type="number" step="0.01" min="0" />
            </FormFieldWrapper>
            <FormFieldWrapper label="תחילת העסקה" required error={errors.hire_date?.message}>
              <Input {...register('hire_date')} type="date" />
            </FormFieldWrapper>
            <FormFieldWrapper label="סיום העסקה" error={errors.end_date?.message}>
              <Input {...register('end_date')} type="date" />
            </FormFieldWrapper>
          </div>
          <FormFieldWrapper label="סטטוס" error={errors.status?.message}>
            <Select
              value={watch('status')}
              onValueChange={(v) => v && setValue('status', v as any)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="inactive">לא פעיל</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
          <FormFieldWrapper label="הערות">
            <Textarea {...register('notes')} rows={3} />
          </FormFieldWrapper>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEdit ? 'עדכן עובד' : 'צור עובד'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ביטול
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
