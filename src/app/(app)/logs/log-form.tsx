'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dailyLogSchema, type DailyLogFormData } from '@/lib/validations'
import { createLogAction, updateLogAction, uploadLogFiles } from '@/features/logs/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper'
import { FileUploader } from '@/components/forms/file-uploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { DailyLog, Project, Employee } from '@/types'

interface LogFormProps {
  log?: DailyLog
  projects: Pick<Project, 'id' | 'name' | 'project_code'>[]
  employees: Pick<Employee, 'id' | 'full_name' | 'role_title'>[]
  defaultProjectId?: string
}

export function LogForm({ log, projects, employees, defaultProjectId }: LogFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const isEdit = !!log

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DailyLogFormData>({
    resolver: zodResolver(dailyLogSchema),
    defaultValues: log
      ? {
          project_id: log.project_id,
          log_date: log.log_date,
          weather: log.weather,
          work_summary: log.work_summary,
          notes: log.notes,
          issues: log.issues,
          status: log.status,
          workers: log.workers?.map((w) => ({
            employee_id: w.employee_id,
            hours_worked: w.hours_worked,
            overtime_hours: w.overtime_hours,
            notes: w.notes,
          })) || [],
        }
      : {
          project_id: defaultProjectId || '',
          log_date: new Date().toISOString().split('T')[0],
          status: 'draft',
          workers: [],
        },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workers',
  })

  const onSubmit = async (data: DailyLogFormData) => {
    setLoading(true)
    try {
      if (isEdit) {
        await updateLogAction(log.id, data)
        // Upload new files
        if (files.length > 0) {
          const formData = new FormData()
          files.forEach((f) => formData.append('files', f))
          await uploadLogFiles(log.id, formData)
        }
        toast.success('Log updated')
        router.push(`/logs/${log.id}`)
      } else {
        const formData = new FormData()
        files.forEach((f) => formData.append('files', f))
        const newLog = await createLogAction(data, formData)
        toast.success('Log created')
        router.push(`/logs/${newLog.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Daily Log' : 'New Daily Log'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormFieldWrapper label="Project" required error={errors.project_id?.message}>
              <Select
                value={watch('project_id')}
                onValueChange={(v) => setValue('project_id', v!)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.project_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
            <FormFieldWrapper label="Date" required error={errors.log_date?.message}>
              <Input {...register('log_date')} type="date" />
            </FormFieldWrapper>
            <FormFieldWrapper label="Weather" error={errors.weather?.message}>
              <Input {...register('weather')} placeholder="e.g., Sunny, Rainy" />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper label="Work Summary" required error={errors.work_summary?.message}>
            <Textarea {...register('work_summary')} rows={3} placeholder="Describe the work done today..." />
          </FormFieldWrapper>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="Issues" error={errors.issues?.message}>
              <Textarea {...register('issues')} rows={2} placeholder="Any issues or blockers..." />
            </FormFieldWrapper>
            <FormFieldWrapper label="Notes" error={errors.notes?.message}>
              <Textarea {...register('notes')} rows={2} placeholder="Additional notes..." />
            </FormFieldWrapper>
          </div>

          <FormFieldWrapper label="Status" error={errors.status?.message}>
            <Select
              value={watch('status')}
              onValueChange={(v) => v && setValue('status', v as any)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </CardContent>
      </Card>

      {/* Workers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Workers & Hours</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              append({ employee_id: '', hours_worked: 8, overtime_hours: 0, notes: '' })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Worker
          </Button>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No workers added yet. Click &quot;Add Worker&quot; to begin.
            </p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end rounded-lg border p-3">
                  <FormFieldWrapper label="Employee" required className="flex-1">
                    <Select
                      value={watch(`workers.${index}.employee_id`)}
                      onValueChange={(v) => setValue(`workers.${index}.employee_id`, v!)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Hours" className="w-24">
                    <Input
                      {...register(`workers.${index}.hours_worked`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="OT" className="w-24">
                    <Input
                      {...register(`workers.${index}.overtime_hours`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="Notes" className="flex-1">
                    <Input {...register(`workers.${index}.notes`)} placeholder="Optional" />
                  </FormFieldWrapper>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-700"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos & Files</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            onFilesSelected={setFiles}
            existingFiles={log?.files}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update Log' : 'Create Log'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
