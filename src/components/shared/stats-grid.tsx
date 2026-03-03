"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { statusColors } from "@/lib/theme-colors"

export interface StatItem {
  value: number | string
  label: string
  icon?: React.ElementType
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: number
}

export interface StatsGridProps {
  title: string
  description?: string
  icon?: React.ElementType
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
  statClassName?: string
}

/**
 * Универсальная сетка статистики
 * Используется для отображения сводных данных в настройках и аналитике
 */
export function StatsGrid({
  title,
  description,
  icon: Icon,
  stats,
  columns = 3,
  className,
  statClassName,
}: StatsGridProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "grid gap-4",
            columns === 2 && "grid-cols-2",
            columns === 3 && "grid-cols-3",
            columns === 4 && "grid-cols-4"
          )}
        >
          {stats.map((stat, index) => {
            const StatIcon = stat.icon
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl bg-muted text-center",
                  statClassName
                )}
              >
                {StatIcon && (
                  <div className="mb-2 p-2 rounded-full bg-primary/10">
                    <StatIcon className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                {stat.description && (
                  <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
                )}
                {stat.trend && (
                  <div
                    className={cn(
                      "text-xs mt-1",
                      stat.trend === "up" && statusColors.success.icon,
                      stat.trend === "down" && statusColors.error.icon,
                      stat.trend === "neutral" && "text-muted-foreground"
                    )}
                  >
                    {stat.trendValue && `${stat.trendValue > 0 ? "+" : ""}${stat.trendValue}%`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
