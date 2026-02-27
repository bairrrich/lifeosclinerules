"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    // Здесь можно отправить ошибку в сервис мониторинга (Sentry и т.д.)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-2">Что-то пошло не так</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Произошла ошибка при загрузке. Попробуйте обновить страницу.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="text-xs text-left bg-muted p-2 rounded mb-4 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
              <Button onClick={this.handleReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Попробовать снова
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Хук для программного сброса ошибки
export function useErrorBoundary() {
  const resetErrorBoundary = () => {
    window.location.reload()
  }

  return { resetErrorBoundary }
}
