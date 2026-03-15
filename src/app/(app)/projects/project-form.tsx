'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormData } from '@/lib/validations'
import { createProjectAction, updateProjectAction } from '@/features/projects/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Project, Client, User } from '@/types'

interface ProjectFormProps {
  project?: Project
  clients: Pick<Client, 'id' | 'name'>[]
  users: Pick<User, 'id' | 'full_name' | 'role'>[]
  defaultClientId?: string
}

export function ProjectForm({ project, clients, users, defaultClientId }: ProjectFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!project

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          name: project.name,
          project_code: project.project_code,
          client_id: project.client_id,
          status: project.status,
          location: project.location,
          description: project.description,
          start_date: project.start_date,
          end_date: project.end_date,
          project_manager_user_id: project.project_manager_user_id,
          site_manager_user_id: project.site_manager_user_id,
        }
      : {
          status: 'planning',
          client_id: defaultClientId || '',
        },
  })

  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true)
    try {
      // Convert empty strings to null for optional UUID fields
      const cleaned = {
        ...data,
        project_manager_user_id: data.project_manager_user_id || null,
        site_manager_user_id: data.site_manager_user_id || null,
      }
      if (isEdit) {
        await updateProjectAction(project.id, cleaned)
        toast.success('הפרויקט עודכן')
        router.push(`/projects/${project.id}`)
      } else {
        const newProject = await createProjectAction(cleaned)
        toast.success('הפרויקט נוצר')
        router.push(`/projects/${newProject.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const managers = users.filter((u) =>
    ['admin', 'project_manager', 'office_manager'].includes(u.role)
  )
  const siteManagers = users.filter((u) =>
    ['admin', 'site_manager', 'project_manager'].includes(u.role)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'עריכת פרויקט' : 'פרויקט חדש'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="שם פרויקט" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormFieldWrapper>
            <FormFieldWrapper label="מספר פרויקט" required error={errors.project_code?.message}>
              <Input {...register('project_code')} placeholder="לדוגמה: PRJ-001" />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="לקוח" required error={errors.client_id?.message}>
              <Select
                value={watch('client_id')}
                onValueChange={(v) => setValue('client_id', v!)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
            <FormFieldWrapper label="סטטוס" error={errors.status?.message}>
              <Select
                value={watch('status')}
                onValueChange={(v) => v && setValue('status', v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">תכנון</SelectItem>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="on_hold">מושהה</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>
          <FormFieldWrapper label="מיקום" error={errors.location?.message}>
            <Input {...register('location')} />
          </FormFieldWrapper>
          <FormFieldWrapper label="תיאור">
            <Textarea {...register('description')} rows={3} />
          </FormFieldWrapper>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="תאריך התחלה" error={errors.start_date?.message}>
              <Input {...register('start_date')} type="date" />
            </FormFieldWrapper>
            <FormFieldWrapper label="תאריך סיום" error={errors.end_date?.message}>
              <Input {...register('end_date')} type="date" />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="מנהל פרויקט" error={errors.project_manager_user_id?.message}>
              <Select
                value={watch('project_manager_user_id') || ''}
                onValueChange={(v) => setValue('project_manager_user_id', v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מנהל פרויקט" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
            <FormFieldWrapper label="מנהל עבודה" error={errors.site_manager_user_id?.message}>
              <Select
                value={watch('site_manager_user_id') || ''}
                onValueChange={(v) => setValue('site_manager_user_id', v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר מנהל עבודה" />
                </SelectTrigger>
                <SelectContent>
                  {siteManagers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEdit ? 'עדכן פרויקט' : 'צור פרויקט'}
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
