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
        toast.success('Project updated')
        router.push(`/projects/${project.id}`)
      } else {
        const newProject = await createProjectAction(cleaned)
        toast.success('Project created')
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
        <CardTitle>{isEdit ? 'Edit Project' : 'New Project'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="Project Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormFieldWrapper>
            <FormFieldWrapper label="Project Code" required error={errors.project_code?.message}>
              <Input {...register('project_code')} placeholder="e.g., PRJ-001" />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="Client" required error={errors.client_id?.message}>
              <Select
                value={watch('client_id')}
                onValueChange={(v) => setValue('client_id', v!)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
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
            <FormFieldWrapper label="Status" error={errors.status?.message}>
              <Select
                value={watch('status')}
                onValueChange={(v) => v && setValue('status', v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </FormFieldWrapper>
          </div>
          <FormFieldWrapper label="Location" error={errors.location?.message}>
            <Input {...register('location')} />
          </FormFieldWrapper>
          <FormFieldWrapper label="Description">
            <Textarea {...register('description')} rows={3} />
          </FormFieldWrapper>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="Start Date" error={errors.start_date?.message}>
              <Input {...register('start_date')} type="date" />
            </FormFieldWrapper>
            <FormFieldWrapper label="End Date" error={errors.end_date?.message}>
              <Input {...register('end_date')} type="date" />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="Project Manager" error={errors.project_manager_user_id?.message}>
              <Select
                value={watch('project_manager_user_id') || ''}
                onValueChange={(v) => setValue('project_manager_user_id', v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PM" />
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
            <FormFieldWrapper label="Site Manager" error={errors.site_manager_user_id?.message}>
              <Select
                value={watch('site_manager_user_id') || ''}
                onValueChange={(v) => setValue('site_manager_user_id', v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site manager" />
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
              {loading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
