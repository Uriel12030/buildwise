'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormData } from '@/lib/validations'
import { createClientAction, updateClientAction } from '@/features/clients/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Client } from '@/types'

interface ClientFormProps {
  client?: Client
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!client

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          name: client.name,
          company_number: client.company_number,
          contact_name: client.contact_name,
          phone: client.phone,
          email: client.email,
          address: client.address,
          notes: client.notes,
          is_active: client.is_active,
        }
      : { is_active: true },
  })

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    try {
      if (isEdit) {
        await updateClientAction(client.id, data)
        toast.success('הלקוח עודכן')
        router.push(`/clients/${client.id}`)
      } else {
        const newClient = await createClientAction(data)
        toast.success('הלקוח נוצר')
        router.push(`/clients/${newClient.id}`)
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
        <CardTitle>{isEdit ? 'עריכת לקוח' : 'לקוח חדש'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="שם חברה" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormFieldWrapper>
            <FormFieldWrapper label="ח.פ / ע.מ" error={errors.company_number?.message}>
              <Input {...register('company_number')} />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="איש קשר" error={errors.contact_name?.message}>
              <Input {...register('contact_name')} />
            </FormFieldWrapper>
            <FormFieldWrapper label="טלפון" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormFieldWrapper>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldWrapper label="אימייל" error={errors.email?.message}>
              <Input {...register('email')} type="email" />
            </FormFieldWrapper>
            <FormFieldWrapper label="כתובת" error={errors.address?.message}>
              <Input {...register('address')} />
            </FormFieldWrapper>
          </div>
          <FormFieldWrapper label="הערות">
            <Textarea {...register('notes')} rows={3} />
          </FormFieldWrapper>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked: boolean) => setValue('is_active', checked)}
            />
            <label htmlFor="is_active" className="text-sm">פעיל</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEdit ? 'עדכן לקוח' : 'צור לקוח'}
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
