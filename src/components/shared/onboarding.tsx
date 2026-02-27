"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/lib/navigation"
import { useTranslations } from "next-intl"
import {
  Utensils,
  Dumbbell,
  Wallet,
  BookOpen,
  ChefHat,
  Droplet,
  Target,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
} from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"

const ONBOARDING_KEY = "life-os-onboarding-completed"

const steps = [
  {
    id: "welcome",
    title: "Добро пожаловать в Life OS",
    description:
      "Единое приложение для комплексного учёта жизненных показателей. Ведите записи о питании, тренировках, финансах и многом другом.",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "trackers",
    title: "Трекеры",
    description:
      "Отслеживайте воду, сон, настроение, измерения тела и привычки. Устанавливайте цели и следите за прогрессом.",
    features: [
      { icon: Utensils, label: "Питание", color: "text-orange-500" },
      { icon: Dumbbell, label: "Тренировки", color: "text-blue-500" },
      { icon: Wallet, label: "Финансы", color: "text-green-500" },
      { icon: Droplet, label: "Вода", color: "text-cyan-500" },
    ],
  },
  {
    id: "content",
    title: "Контент",
    description: "Ведите библиотеку книг и коллекцию рецептов с автоматическим расчётом калорий.",
    features: [
      { icon: BookOpen, label: "Книги", color: "text-amber-500" },
      { icon: ChefHat, label: "Рецепты", color: "text-rose-500" },
    ],
  },
  {
    id: "offline",
    title: "Работает офлайн",
    description:
      "Все данные хранятся локально на вашем устройстве. Приложение работает без интернета, а данные синхронизируются при появлении сети.",
    icon: Check,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
]

interface OnboardingProps {
  onComplete?: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const router = useRouter()
  const t = useTranslations("onboarding")
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем, пройден ли onboarding
    const checkOnboarding = async () => {
      const completed = localStorage.getItem(ONBOARDING_KEY)

      // Также проверяем, есть ли данные в базе
      const logsCount = await db.logs.count()

      if (!completed && logsCount === 0) {
        setIsVisible(true)
      }
    }

    checkOnboarding()
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setIsVisible(false)
    onComplete?.()
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const StepIcon = step.icon

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleSkip}
          aria-label={t("skip")}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardContent className="p-6">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-[width,background-color] ${
                  index === currentStep ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentStep(index)}
                aria-label={`Шаг ${index + 1}`}
              />
            ))}
          </div>

          {/* Icon */}
          {StepIcon && (
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${step.bgColor || "bg-primary/10"}`}>
                <StepIcon className={`h-8 w-8 ${step.color || "text-primary"}`} />
              </div>
            </div>
          )}

          {/* Content */}
          <h2 className="text-xl font-semibold text-center mb-2">{t(`${step.id}.title`)}</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {t(`${step.id}.description`)}
          </p>

          {/* Features grid */}
          {step.features && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {step.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev} className="flex-1 gap-2">
                <ChevronLeft className="h-4 w-4" />
                {t("back")}
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 gap-2">
              {currentStep === steps.length - 1 ? t("finishOnboarding") : t("next")}
              {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Skip link */}
          {currentStep < steps.length - 1 && (
            <button
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleSkip}
            >
              {t("skip")}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for checking onboarding status
export function useOnboarding() {
  const [isCompleted, setIsCompleted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const completed = localStorage.getItem(ONBOARDING_KEY)
      const logsCount = await db.logs.count()
      setIsCompleted(!!completed || logsCount > 0)
      setIsLoading(false)
    }
    check()
  }, [])

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY)
    setIsCompleted(false)
  }

  return { isCompleted, isLoading, resetOnboarding }
}
