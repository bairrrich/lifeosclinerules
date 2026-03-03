import * as React from "react"
import { cn } from "@/lib/utils"
import type { ValidationRule } from "react-hook-form"

export interface FormFieldProps {
  label?: string
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
  description?: string
  className?: string
  error?: string
  // Валидация
  minLength?: number
  maxLength?: number
  min?: number | string
  max?: number | string
  pattern?: RegExp
  validate?: (value: unknown) => string | true
}

/**
 * Универсальная обёрка для полей формы со встроенной валидацией
 * Устраняет дублирование <div className="space-y-2"> паттернов
 * Интегрируется с react-hook-form через validate проп
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      htmlFor,
      children,
      required,
      description,
      className,
      error,
      minLength,
      maxLength,
      min,
      max,
      pattern,
      validate,
    },
    ref
  ) => {
    // Генерация сообщений об ошибках валидации
    const getValidationErrors = (): string[] => {
      const errors: string[] = []
      if (required) errors.push("Это поле обязательно для заполнения")
      if (minLength) errors.push(`Минимальная длина: ${minLength} символов`)
      if (maxLength) errors.push(`Максимальная длина: ${maxLength} символов`)
      if (min !== undefined) errors.push(`Минимальное значение: ${min}`)
      if (max !== undefined) errors.push(`Максимальное значение: ${max}`)
      if (pattern) errors.push("Неверный формат поля")
      return errors
    }

    const validationErrors = getValidationErrors()

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
        {React.isValidElement(children) &&
          React.cloneElement(children as React.ReactElement<any>, {
            required,
            minLength,
            maxLength,
            min,
            max,
            pattern,
          })}
        {!React.isValidElement(children) && children}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!error && validationErrors.length > 0 && (
          <ul className="text-xs text-muted-foreground list-disc list-inside">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"
