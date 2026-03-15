import { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  badge?: ReactNode
}

export function PageHeader({ title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {description && (
        <p className="text-[13px] text-muted-foreground">{description}</p>
      )}
      <Separator className="!mt-4" />
    </div>
  )
}
