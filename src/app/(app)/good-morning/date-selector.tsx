'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import dayjs from '@/lib/dayjs'

export function DateSelector({ currentDate }: { currentDate: string }) {
  const router = useRouter()

  const goToDate = (date: string) => {
    router.push(`/good-morning?date=${date}`)
  }

  const prevDay = dayjs(currentDate).subtract(1, 'day').format('YYYY-MM-DD')
  const nextDay = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD')
  const today = dayjs().format('YYYY-MM-DD')
  const isToday = currentDate === today

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => goToDate(nextDay)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Input
        type="date"
        value={currentDate}
        onChange={(e) => e.target.value && goToDate(e.target.value)}
        className="h-8 w-40 text-center text-sm"
      />
      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => goToDate(prevDay)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {!isToday && (
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => goToDate(today)}>
          היום
        </Button>
      )}
    </div>
  )
}
