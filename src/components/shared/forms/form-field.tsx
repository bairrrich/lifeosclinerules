import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
  description?: string
  className?: string
  error?: string
}

/**
 * Универсальная обёртка для полей формы
 * Устраняет дублирование <div className="space-y-2"> паттернов
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, htmlFor, children, required, description, className, error }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {label && (
          <>
            <label
              htmlFor={htmlFor}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
        {children}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)
FormField.displayName = "FormField"
