'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface FormFieldWrapperProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormFieldWrapper({
  label,
  error,
  required,
  children,
  className,
}: FormFieldWrapperProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
