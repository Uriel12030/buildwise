'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/layout/status-badge'
import { ChevronDown, Users, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ProjectData {
  projectId: string
  projectName: string
  logId: string
  logStatus: string
  workSummary: string | null
  workers: {
    name: string
    role: string
    hours: number
    overtime: number
    hourlyRate: number
    cost: number
  }[]
  equipment: {
    id: string
    name: string
    category: string
    dailyCost: number
  }[]
  totalWorkersCost: number
  totalEquipmentCost: number
  totalHours: number
  workerCount: number
  equipmentCount: number
}

export function ProjectRow({ project }: { project: ProjectData }) {
  const [showWorkers, setShowWorkers] = useState(false)
  const [showEquipment, setShowEquipment] = useState(false)
  const totalProjectCost = project.totalWorkersCost + project.totalEquipmentCost

  return (
    <Card>
      <CardContent className="p-0">
        {/* Compact summary row */}
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link
              href={`/projects/${project.projectId}`}
              className="font-semibold text-[14px] hover:text-primary transition-colors truncate"
            >
              {project.projectName}
            </Link>
            <StatusBadge status={project.logStatus} className="shrink-0" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Workers toggle */}
            <button
              onClick={() => setShowWorkers(!showWorkers)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                showWorkers ? 'bg-blue-50 text-blue-700' : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{project.workerCount}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', showWorkers && 'rotate-180')} />
            </button>

            {/* Equipment toggle */}
            {project.equipmentCount > 0 && (
              <button
                onClick={() => setShowEquipment(!showEquipment)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                  showEquipment ? 'bg-orange-50 text-orange-700' : 'hover:bg-muted text-muted-foreground'
                )}
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>{project.equipmentCount}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', showEquipment && 'rotate-180')} />
              </button>
            )}

            {/* Total cost */}
            <div className="text-end min-w-[90px] border-s ps-3">
              <p className="text-sm font-bold">
                ₪{totalProjectCost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-muted-foreground">{project.totalHours} שעות</p>
            </div>
          </div>
        </div>

        {/* Work summary - only when nothing expanded */}
        {project.workSummary && !showWorkers && !showEquipment && (
          <div className="px-4 pb-2.5 -mt-1">
            <p className="text-xs text-muted-foreground line-clamp-1">{project.workSummary}</p>
          </div>
        )}

        {/* Expandable workers */}
        {showWorkers && project.workers.length > 0 && (
          <div className="border-t">
            <div className="px-3 py-1.5 bg-blue-50/50 border-b">
              <p className="text-[11px] font-semibold text-blue-700">
                עובדים ({project.workerCount}) · ₪{project.totalWorkersCost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/20 border-b">
                  <th className="px-3 py-1 text-start font-semibold text-muted-foreground">עובד</th>
                  <th className="px-3 py-1 text-start font-semibold text-muted-foreground">תפקיד</th>
                  <th className="px-3 py-1 text-end font-semibold text-muted-foreground">שעות</th>
                  <th className="px-3 py-1 text-end font-semibold text-muted-foreground">נוספות</th>
                  <th className="px-3 py-1 text-end font-semibold text-muted-foreground">תעריף</th>
                  <th className="px-3 py-1 text-end font-semibold text-muted-foreground">עלות</th>
                </tr>
              </thead>
              <tbody>
                {project.workers.map((w, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5 font-medium">{w.name}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{w.role || '—'}</td>
                    <td className="px-3 py-1.5 text-end">{w.hours}</td>
                    <td className="px-3 py-1.5 text-end">{w.overtime > 0 ? w.overtime : '—'}</td>
                    <td className="px-3 py-1.5 text-end">₪{w.hourlyRate}</td>
                    <td className="px-3 py-1.5 text-end font-medium">₪{w.cost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expandable equipment */}
        {showEquipment && project.equipment.length > 0 && (
          <div className="border-t">
            <div className="px-3 py-1.5 bg-orange-50/50 border-b">
              <p className="text-[11px] font-semibold text-orange-700">
                ציוד ({project.equipmentCount}) · ₪{project.totalEquipmentCost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/20 border-b">
                  <th className="px-3 py-1 text-start font-semibold text-muted-foreground">כלי</th>
                  <th className="px-3 py-1 text-start font-semibold text-muted-foreground">קטגוריה</th>
                  <th className="px-3 py-1 text-end font-semibold text-muted-foreground">עלות יומית</th>
                </tr>
              </thead>
              <tbody>
                {project.equipment.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="px-3 py-1.5">
                      <Link href={`/equipment/${e.id}`} className="font-medium hover:text-primary transition-colors">
                        {e.name}
                      </Link>
                    </td>
                    <td className="px-3 py-1.5"><StatusBadge status={e.category} className="text-[10px]" /></td>
                    <td className="px-3 py-1.5 text-end font-medium">₪{e.dailyCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
