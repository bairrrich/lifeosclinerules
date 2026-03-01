import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { moduleColors, type ModuleType } from "@/lib/theme-colors"

interface ModuleCardProps {
  /** Тип модуля для определения цветовой схемы */
  module: ModuleType
  /** Иконка модуля */
  icon: React.ReactNode
  /** Заголовок карточки */
  title: string
  /** Опциональное описание */
  subtitle?: string
  /** Ссылка для навигации (если нужна) */
  href?: string
  /** Обработчик клика (если не нужна ссылка) */
  onClick?: () => void
  /** Дополнительные элементы справа от контента */
  action?: React.ReactNode
  /** Дополнительные классы */
  className?: string
  /** Показать hover эффект (по умолчанию true) */
  showHover?: boolean
}

/**
 * Унифицированная карточка модуля с автоматической цветовой схемой
 *
 * @example
 * <ModuleCard
 *   module="food"
 *   icon={<Utensils className="h-5 w-5" />}
 *   title="Питание"
 *   subtitle="Отслеживание рациона"
 *   href="/logs/food"
 * />
 */
export function ModuleCard({
  module,
  icon,
  title,
  subtitle,
  href,
  onClick,
  action,
  className,
  showHover = true,
}: ModuleCardProps) {
  const colors = moduleColors[module]

  const cardContent = (
    <Card
      className={cn(
        // Базовая цветовая схема
        colors.light,
        "border border-transparent",
        // Анимации
        showHover &&
          "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-[--border]",
        // Интерактивность
        (href || onClick) && "cursor-pointer",
        className
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        {/* Иконка с цветным фоном */}
        <div
          className={cn(
            colors.DEFAULT,
            "text-white p-3 rounded-xl flex-shrink-0",
            showHover && "transition-transform duration-200"
          )}
        >
          {icon}
        </div>

        {/* Текстовый контент */}
        <div className="flex-1 min-w-0">
          <h3 className={cn("font-semibold truncate", colors.text)}>{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>

        {/* Дополнительное действие справа */}
        {action && <div className="flex-shrink-0">{action}</div>}
      </CardContent>
    </Card>
  )

  // Рендерим ссылку или div по условию
  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    )
  }

  return cardContent
}

/**
 * Компактная версия карточки модуля для сетки
 */
interface ModuleCardCompactProps {
  module: ModuleType
  icon: React.ReactNode
  title: string
  value?: string | number
  href?: string
  onClick?: () => void
  className?: string
}

export function ModuleCardCompact({
  module,
  icon,
  title,
  value,
  href,
  onClick,
  className,
}: ModuleCardCompactProps) {
  const colors = moduleColors[module]

  const cardContent = (
    <Card
      className={cn(
        colors.light,
        "border border-transparent",
        "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-[--border]",
        (href || onClick) && "cursor-pointer",
        className
      )}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
        <div className={cn(colors.DEFAULT, "text-white p-2 rounded-lg [&>svg]:h-5 [&>svg]:w-5")}>
          {icon}
        </div>
        <span className={cn("font-medium text-sm", colors.text)}>{title}</span>
        {value !== undefined && <span className="text-lg font-bold text-foreground">{value}</span>}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{cardContent}</Link>
  }

  if (onClick) {
    return <div onClick={onClick}>{cardContent}</div>
  }

  return cardContent
}

/**
 * Карточка с горизонтальным списком
 */
interface ModuleListItemProps {
  module: ModuleType
  icon: React.ReactNode
  title: string
  subtitle?: string
  href?: string
  onClick?: () => void
  action?: React.ReactNode
  className?: string
}

export function ModuleListItem({
  module,
  icon,
  title,
  subtitle,
  href,
  onClick,
  action,
  className,
}: ModuleListItemProps) {
  const colors = moduleColors[module]

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl",
        colors.light,
        "border border-transparent",
        "transition-all duration-200 hover:bg-transparent hover:border-[--border]",
        (href || onClick) && "cursor-pointer",
        className
      )}
    >
      <div
        className={cn(
          colors.DEFAULT,
          "text-white p-2 rounded-lg flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate", colors.text)}>{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  if (onClick) {
    return <div onClick={onClick}>{content}</div>
  }

  return content
}

/**
 * Badge с цветовой схемой модуля
 */
interface ModuleBadgeProps {
  module: ModuleType
  children: React.ReactNode
  variant?: "light" | "DEFAULT" | "text"
  className?: string
}

export function ModuleBadge({ module, children, variant = "light", className }: ModuleBadgeProps) {
  const colors = moduleColors[module]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "light" && colors.light,
        variant === "DEFAULT" && cn(colors.DEFAULT, "text-white"),
        variant === "text" && "bg-transparent",
        className
      )}
    >
      {children}
    </span>
  )
}
