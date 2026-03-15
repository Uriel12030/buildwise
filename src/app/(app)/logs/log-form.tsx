'use client'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dailyLogSchema, type DailyLogFormData } from '@/lib/validations'
import { createLogAction, updateLogAction, uploadLogFiles } from '@/features/logs/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper'
import { FileUploader } from '@/components/forms/file-uploader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { DailyLog, Project, Employee } from '@/types'

interface LogFormProps {
  log?: DailyLog
  projects: (Pick<Project, 'id' | 'name' | 'project_code' | 'location'> & {
    client?: { id: string; name: string } | null
    project_manager?: { id: string; full_name: string } | null
  })[]
  companyEmployees: Pick<Employee, 'id' | 'full_name' | 'role_title'>[]
  foreignWorkers: Pick<Employee, 'id' | 'full_name' | 'role_title'>[]
  currentUserName: string
  defaultProjectId?: string
}

function buildDefaultActivities(count: number, startSeq = 1) {
  return Array.from({ length: count }, (_, i) => ({
    seq_number: startSeq + i,
    description: '',
    is_irregular: false,
    notes: '',
  }))
}

export function LogForm({
  log,
  projects,
  companyEmployees,
  foreignWorkers,
  currentUserName,
  defaultProjectId,
}: LogFormProps) {
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
          work_summary: log.work_summary || '',
          notes: log.notes,
          issues: log.issues,
          status: log.status,
          start_time: log.start_time,
          end_time: log.end_time,
          main_contractor: log.main_contractor,
          site_address: log.site_address,
          workers:
            log.workers?.map((w) => ({
              worker_type: w.worker_type || 'company',
              employee_id: w.employee_id,
              worker_name: w.worker_name,
              role_title: w.role_title,
              hours_worked: w.hours_worked,
              overtime_hours: w.overtime_hours,
              notes: w.notes,
            })) || [],
          activities:
            log.activities && log.activities.length > 0
              ? log.activities.map((a) => ({
                  seq_number: a.seq_number,
                  description: a.description,
                  is_irregular: a.is_irregular,
                  notes: a.notes,
                }))
              : buildDefaultActivities(10),
          equipment:
            log.equipment?.map((e) => ({
              equipment_type: e.equipment_type,
              identification_number: e.identification_number,
              equipment_name: e.equipment_name,
              notes: e.notes,
            })) || [],
          materials:
            log.materials?.map((m) => ({
              material_name: m.material_name,
              quantity: m.quantity,
              supplier: m.supplier,
              notes: m.notes,
            })) || [],
        }
      : {
          project_id: defaultProjectId || '',
          log_date: new Date().toISOString().split('T')[0],
          status: 'draft',
          workers: [],
          activities: buildDefaultActivities(10),
          equipment: [],
          materials: [],
        },
  })

  const selectedProjectId = watch('project_id')
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  )

  // Workers split by type
  const companyWorkerFields = useFieldArray({ control, name: 'workers' })
  const activityFields = useFieldArray({ control, name: 'activities' })
  const equipmentFields = useFieldArray({ control, name: 'equipment' })
  const materialFields = useFieldArray({ control, name: 'materials' })

  const workers = watch('workers') || []
  const companyWorkersIndices = workers
    .map((w, i) => (w.worker_type === 'company' ? i : -1))
    .filter((i) => i !== -1)
  const foreignWorkersIndices = workers
    .map((w, i) => (w.worker_type === 'foreign' ? i : -1))
    .filter((i) => i !== -1)
  const subcontractorWorkersIndices = workers
    .map((w, i) => (w.worker_type === 'subcontractor' ? i : -1))
    .filter((i) => i !== -1)

  const companyEquipmentIndices = (watch('equipment') || [])
    .map((e, i) => (e.equipment_type === 'company' ? i : -1))
    .filter((i) => i !== -1)
  const subEquipmentIndices = (watch('equipment') || [])
    .map((e, i) => (e.equipment_type === 'subcontractor' ? i : -1))
    .filter((i) => i !== -1)

  const addWorker = (type: 'company' | 'foreign' | 'subcontractor') => {
    companyWorkerFields.append({
      worker_type: type,
      employee_id: type === 'subcontractor' ? null : '',
      worker_name: '',
      role_title: '',
      hours_worked: 8,
      overtime_hours: 0,
      notes: '',
    })
  }

  const addEquipment = (type: 'company' | 'subcontractor') => {
    equipmentFields.append({
      equipment_type: type,
      identification_number: '',
      equipment_name: '',
      notes: '',
    })
  }

  const onSubmit = async (data: DailyLogFormData) => {
    setLoading(true)
    try {
      if (isEdit) {
        await updateLogAction(log.id, data)
        if (files.length > 0) {
          const formData = new FormData()
          files.forEach((f) => formData.append('files', f))
          await uploadLogFiles(log.id, formData)
        }
        toast.success('היומן עודכן')
        router.push(`/logs/${log.id}`)
      } else {
        const formData = new FormData()
        files.forEach((f) => formData.append('files', f))
        const newLog = await createLogAction(data, formData)
        toast.success('היומן נוצר')
        router.push(`/logs/${newLog.id}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'אירעה שגיאה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: General Details */}
      <Card>
        <CardHeader>
          <CardTitle>פרטים כלליים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormFieldWrapper label="פרויקט" required error={errors.project_id?.message}>
              <NativeSelect
                value={watch('project_id') || ''}
                onChange={(e) => setValue('project_id', e.target.value)}
                placeholder="בחר פרויקט"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.project_code})
                  </option>
                ))}
              </NativeSelect>
            </FormFieldWrapper>

            <FormFieldWrapper label="תאריך" required error={errors.log_date?.message}>
              <Input {...register('log_date')} type="date" />
            </FormFieldWrapper>

            <FormFieldWrapper label="מזמין עבודה">
              <Input
                value={selectedProject?.client?.name || ''}
                readOnly
                className="bg-muted"
                placeholder="יבחר אוטומטית לפי פרויקט"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="מנהל עבודה">
              <Input value={currentUserName} readOnly className="bg-muted" />
            </FormFieldWrapper>

            <FormFieldWrapper label="כתובת האתר" error={errors.site_address?.message}>
              <Input
                {...register('site_address')}
                placeholder="כתובת האתר"
                defaultValue={selectedProject?.location || ''}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="קבלן ראשי" error={errors.main_contractor?.message}>
              <Input {...register('main_contractor')} placeholder="שם הקבלן הראשי" />
            </FormFieldWrapper>

            <FormFieldWrapper label="מנהל פרויקט">
              <Input
                value={selectedProject?.project_manager?.full_name || ''}
                readOnly
                className="bg-muted"
                placeholder="יבחר אוטומטית לפי פרויקט"
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="שעת התחלת העבודה" error={errors.start_time?.message}>
              <Input {...register('start_time')} type="time" />
            </FormFieldWrapper>

            <FormFieldWrapper label="שעת סיום העבודה" error={errors.end_time?.message}>
              <Input {...register('end_time')} type="time" />
            </FormFieldWrapper>

            <FormFieldWrapper label="מזג אוויר" error={errors.weather?.message}>
              <Input {...register('weather')} placeholder="לדוגמה: שמשי, גשום" />
            </FormFieldWrapper>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Company Workers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">כח אדם חברה</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => addWorker('company')}>
            <Plus className="ms-2 h-4 w-4" />
            הוסף עובד
          </Button>
        </CardHeader>
        <CardContent>
          {companyWorkersIndices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              טרם נוספו עובדי חברה. לחץ &quot;הוסף עובד&quot; להתחיל.
            </p>
          ) : (
            <div className="space-y-3">
              {companyWorkersIndices.map((idx) => (
                <div key={companyWorkerFields.fields[idx]?.id || idx} className="flex gap-3 items-end rounded-lg border p-3">
                  <FormFieldWrapper label="עובד" required className="flex-1">
                    <NativeSelect
                      value={watch(`workers.${idx}.employee_id`) || ''}
                      onChange={(e) => {
                        setValue(`workers.${idx}.employee_id`, e.target.value)
                        const emp = companyEmployees.find((emp) => emp.id === e.target.value)
                        if (emp) setValue(`workers.${idx}.role_title`, emp.role_title)
                      }}
                      placeholder="בחר עובד"
                    >
                      {companyEmployees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.full_name}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormFieldWrapper>
                  <FormFieldWrapper label="תפקיד" className="w-32">
                    <Input
                      value={watch(`workers.${idx}.role_title`) || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="שעות" className="w-20">
                    <Input
                      {...register(`workers.${idx}.hours_worked`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="נוספות" className="w-20">
                    <Input
                      {...register(`workers.${idx}.overtime_hours`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="הערות" className="flex-1">
                    <Input {...register(`workers.${idx}.notes`)} placeholder="אופציונלי" />
                  </FormFieldWrapper>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-700"
                    onClick={() => companyWorkerFields.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Foreign Workers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">פועלים</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => addWorker('foreign')}>
            <Plus className="ms-2 h-4 w-4" />
            הוסף פועל
          </Button>
        </CardHeader>
        <CardContent>
          {foreignWorkersIndices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              טרם נוספו פועלים. לחץ &quot;הוסף פועל&quot; להתחיל.
            </p>
          ) : (
            <div className="space-y-3">
              {foreignWorkersIndices.map((idx) => (
                <div key={companyWorkerFields.fields[idx]?.id || idx} className="flex gap-3 items-end rounded-lg border p-3">
                  <FormFieldWrapper label="עובד" required className="flex-1">
                    <NativeSelect
                      value={watch(`workers.${idx}.employee_id`) || ''}
                      onChange={(e) => setValue(`workers.${idx}.employee_id`, e.target.value)}
                      placeholder="בחר פועל"
                    >
                      {foreignWorkers.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.full_name}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormFieldWrapper>
                  <FormFieldWrapper label="שעות" className="w-20">
                    <Input
                      {...register(`workers.${idx}.hours_worked`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="נוספות" className="w-20">
                    <Input
                      {...register(`workers.${idx}.overtime_hours`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="הערות" className="flex-1">
                    <Input {...register(`workers.${idx}.notes`)} placeholder="אופציונלי" />
                  </FormFieldWrapper>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-700"
                    onClick={() => companyWorkerFields.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Subcontractor Workers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">כח אדם קבלני משנה</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => addWorker('subcontractor')}>
            <Plus className="ms-2 h-4 w-4" />
            הוסף עובד
          </Button>
        </CardHeader>
        <CardContent>
          {subcontractorWorkersIndices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              טרם נוספו עובדי קבלני משנה. לחץ &quot;הוסף עובד&quot; להתחיל.
            </p>
          ) : (
            <div className="space-y-3">
              {subcontractorWorkersIndices.map((idx) => (
                <div key={companyWorkerFields.fields[idx]?.id || idx} className="flex gap-3 items-end rounded-lg border p-3">
                  <FormFieldWrapper label="שם עובד" required className="flex-1">
                    <Input {...register(`workers.${idx}.worker_name`)} placeholder="שם העובד" />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="תפקיד" className="w-32">
                    <Input {...register(`workers.${idx}.role_title`)} placeholder="תפקיד" />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="שעות" className="w-20">
                    <Input
                      {...register(`workers.${idx}.hours_worked`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="נוספות" className="w-20">
                    <Input
                      {...register(`workers.${idx}.overtime_hours`, { valueAsNumber: true })}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                    />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="הערות" className="flex-1">
                    <Input {...register(`workers.${idx}.notes`)} placeholder="אופציונלי" />
                  </FormFieldWrapper>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-700"
                    onClick={() => companyWorkerFields.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Company Equipment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">כלים וציוד חברה</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => addEquipment('company')}>
            <Plus className="ms-2 h-4 w-4" />
            הוסף ציוד
          </Button>
        </CardHeader>
        <CardContent>
          {companyEquipmentIndices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              טרם נוסף ציוד חברה.
            </p>
          ) : (
            <div className="space-y-3">
              {companyEquipmentIndices.map((idx) => (
                <div key={equipmentFields.fields[idx]?.id || idx} className="flex gap-3 items-end rounded-lg border p-3">
                  <FormFieldWrapper label='מס&apos; זיהוי' className="w-32">
                    <Input {...register(`equipment.${idx}.identification_number`)} placeholder="מספר זיהוי" />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="סוג" required className="flex-1">
                    <Input {...register(`equipment.${idx}.equipment_name`)} placeholder="סוג הציוד" />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="הערות" className="flex-1">
                    <Input {...register(`equipment.${idx}.notes`)} placeholder="אופציונלי" />
                  </FormFieldWrapper>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-700"
                    onClick={() => equipmentFields.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 6: Subcontractor Equipment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">כלים קבלני משנה</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={() => addEquipment('subcontractor')}>
            <Plus className="ms-2 h-4 w-4" />
            הוסף ציוד
          </Button>
        </CardHeader>
        <CardContent>
          {subEquipmentIndices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              טרם נוסף ציוד קבלני משנה.
            </p>
          ) : (
            <div className="space-y-3">
              {subEquipmentIndices.map((idx) => (
                <div key={equipmentFields.fields[idx]?.id || idx} className="flex gap-3 items-end rounded-lg border p-3">
                  <FormFieldWrapper label='מס&apos; זיהוי' className="w-32">
                    <Input {...register(`equipment.${idx}.identification_number`)} placeholder="מספר זיהוי" />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="סוג" required className="flex-1">
                    <Input {...register(`equipment.${idx}.equipment_name`)} placeholder="סוג הציוד" />
                  </FormFieldWrapper>
                  <FormFieldWrapper label="הערות" className="flex-1">
                    <Input {...register(`equipment.${idx}.notes`)} placeholder="אופציונלי" />
                  </FormFieldWrapper>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500 hover:text-red-700"
                    onClick={() => equipmentFields.remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 7: Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">תיאור פעולות שבוצעו באתר</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              activityFields.append({
                seq_number: (watch('activities')?.length || 0) + 1,
                description: '',
                is_irregular: false,
                notes: '',
              })
            }
          >
            <Plus className="ms-2 h-4 w-4" />
            הוסף שורה
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground w-16">מס&apos;</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">תיאור הפעולה</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground w-24">עבודה חריגה</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground w-40">הערות</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {activityFields.fields.map((field, index) => (
                  <tr key={field.id} className="border-b last:border-0">
                    <td className="px-3 py-2 text-center text-muted-foreground">{index + 1}</td>
                    <td className="px-3 py-1">
                      <Textarea
                        {...register(`activities.${index}.description`)}
                        rows={1}
                        className="min-h-[36px] resize-none border-0 shadow-none focus-visible:ring-0 p-1"
                        placeholder="תיאור הפעולה..."
                      />
                      <input type="hidden" {...register(`activities.${index}.seq_number`, { valueAsNumber: true })} value={index + 1} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Controller
                        control={control}
                        name={`activities.${index}.is_irregular`}
                        render={({ field: f }) => (
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={(checked) => f.onChange(!!checked)}
                          />
                        )}
                      />
                    </td>
                    <td className="px-3 py-1">
                      <Input
                        {...register(`activities.${index}.notes`)}
                        className="border-0 shadow-none focus-visible:ring-0 p-1"
                        placeholder="הערות"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() => activityFields.remove(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 8: Issues and Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">בעיות / הערות נוספות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormFieldWrapper label="בעיות" error={errors.issues?.message}>
            <Textarea {...register('issues')} rows={3} placeholder="בעיות או חסימות..." />
          </FormFieldWrapper>
          <FormFieldWrapper label="הערות נוספות" error={errors.notes?.message}>
            <Textarea {...register('notes')} rows={3} placeholder="הערות נוספות..." />
          </FormFieldWrapper>
        </CardContent>
      </Card>

      {/* Section 9: Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">תמונות וקבצים</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader onFilesSelected={setFiles} existingFiles={log?.files} />
        </CardContent>
      </Card>

      {/* Section 10: Status and Submit */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">סטטוס</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormFieldWrapper label="סטטוס יומן" error={errors.status?.message}>
            <NativeSelect
              value={watch('status')}
              onChange={(e) => setValue('status', e.target.value as any)}
              className="w-40"
            >
              <option value="draft">טיוטה</option>
              <option value="submitted">הוגש</option>
              <option value="approved">אושר</option>
            </NativeSelect>
          </FormFieldWrapper>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEdit ? 'עדכן יומן' : 'שמור יומן'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ביטול
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
