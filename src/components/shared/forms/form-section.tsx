import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface FormSectionProps {
  title: string
  description?: string
  icon?: React.ElementType
  children: React.ReactNode
  className?: string
  headerClassName?: string
  actions?: React.ReactNode
}

/**
 * Универсальная секция формы в виде карточки
 * Используется для группировки полей формы по логическим блокам
 */
export function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerClassName,
  actions,
}: FormSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className={headerClassName}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          {actions}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
