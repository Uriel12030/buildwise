'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  planning: '#f59e0b',
  active: '#10b981',
  on_hold: '#f97316',
  completed: '#3b82f6',
}

interface DashboardChartsProps {
  logsByWeek: { date: string; logs: number }[]
  projectsByStatus: { status: string; count: number }[]
}

export function DashboardCharts({ logsByWeek, projectsByStatus }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logs This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={logsByWeek}>
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="logs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={projectsByStatus.filter((p) => p.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="status"
                  label={({ name, value }: any) => `${name} (${value})`}
                  labelLine={false}
                >
                  {projectsByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {projectsByStatus
              .filter((p) => p.count > 0)
              .map((p) => (
                <div key={p.status} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[p.status] }}
                  />
                  <span className="capitalize text-gray-600">{p.status.replace('_', ' ')}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
