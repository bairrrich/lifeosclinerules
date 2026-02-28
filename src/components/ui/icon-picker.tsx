"use client"

import { useState, useMemo, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tag as TagIcon } from "@/lib/icons"

// Предустановленный набор иконок из lucide-react для категорий
const PRESET_ICONS = [
  // Финансы
  "wallet",
  "dollar-sign",
  "banknote",
  "credit-card",
  "landmark",
  "line-chart",
  "trending-up",
  "trending-down",
  "bitcoin",
  "repeat",
  // Еда
  "utensils",
  "utensils-crossed",
  "coffee",
  "croissant",
  "soup",
  "sandwich",
  "apple",
  "martini",
  "cup-soda",
  "glass-water",
  "chef-hat",
  // Транспорт
  "car",
  "bus",
  "bike",
  "plane",
  "train",
  "boat",
  "truck",
  "fuel",
  // Здоровье
  "heart",
  "heart-pulse",
  "activity",
  "dumbbell",
  "pill",
  "bandage",
  "brain",
  "footprints",
  "flame",
  // Дом
  "home",
  "building",
  "bed",
  "bath",
  "lightbulb",
  "thermometer",
  "fan",
  "tree-pine",
  // Работа
  "briefcase",
  "laptop",
  "smartphone",
  "mail",
  "calendar",
  "clock",
  "file-text",
  "pen-tool",
  // Покупки
  "shopping-bag",
  "shopping-cart",
  "gift",
  "shirt",
  "backpack",
  "package",
  // Развлечения
  "film",
  "gamepad-2",
  "music",
  "book-open",
  "tv",
  "palette",
  "ticket",
  // Образование
  "book",
  "graduation-cap",
  "pencil",
  "calculator",
  "microscope",
  "monitor",
  // Животные
  "dog",
  "cat",
  "fish",
  "bird",
  "rabbit",
  "turtle",
  // Природа
  "sun",
  "moon",
  "star",
  "cloud",
  "flower",
  "droplet",
  "wind",
  // Другое
  "tag",
  "bookmark",
  "target",
  "bell",
  "pin",
  "folder-open",
  "sparkles",
  "settings",
]

// Кэш для загруженных иконок
const iconCache = new Map<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
>()

interface IconPickerProps {
  value?: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [loadedIcons, setLoadedIcons] = useState<Set<string>>(new Set())

  const handleSelect = useCallback(
    (iconName: string) => {
      onChange(iconName)
      setOpen(false)
    },
    [onChange]
  )

  const loadIcon = useCallback(async (iconName: string) => {
    if (iconCache.has(iconName)) {
      return iconCache.get(iconName)!
    }

    try {
      const path = iconName.toLowerCase()
      const module = await import(`lucide-react/dist/esm/icons/${path}`)
      const IconComponent = module.default
      iconCache.set(iconName, IconComponent)
      return IconComponent
    } catch {
      return null
    }
  }, [])

  // Предзагрузка иконки при наведении (опционально)
  const preloadIcon = useCallback(
    async (iconName: string) => {
      if (!iconCache.has(iconName)) {
        await loadIcon(iconName)
      }
    },
    [loadIcon]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-10 h-10 p-0 shrink-0"
          aria-label="Выбрать иконку"
        >
          <IconRenderer name={value} className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="grid grid-cols-6 gap-1 max-h-80 overflow-y-auto">
          {PRESET_ICONS.map((iconName) => (
            <button
              key={iconName}
              type="button"
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-md transition-colors",
                "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                value === iconName && "bg-accent"
              )}
              onClick={() => handleSelect(iconName)}
              onMouseEnter={() => preloadIcon(iconName)}
              aria-label={`Выбрать ${iconName}`}
              aria-pressed={value === iconName}
            >
              <IconRenderer name={iconName} className="h-5 w-5" />
            </button>
          ))}
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-muted-foreground"
            onClick={() => {
              onChange("")
              setOpen(false)
            }}
          >
            Удалить иконку
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Компонент для рендеринга иконки по имени
function IconRenderer({ name, className }: { name?: string; className?: string }) {
  const [IconComponent, setIconComponent] = useState<React.ComponentType<{
    className?: string
    strokeWidth?: number
  }> | null>(null)

  const [loading, setLoading] = useState(false)

  useMemo(() => {
    if (!name) return

    if (iconCache.has(name)) {
      setIconComponent(iconCache.get(name)!)
      return
    }

    setLoading(true)
    import(`lucide-react/dist/esm/icons/${name.toLowerCase()}`)
      .then((module) => {
        const IconComponent = module.default
        iconCache.set(name, IconComponent)
        setIconComponent(IconComponent)
      })
      .catch(() => {
        setIconComponent(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [name])

  if (!name || loading || !IconComponent) {
    return <TagIcon className={cn("h-4 w-4 text-muted-foreground", className)} />
  }

  return <IconComponent className={className} strokeWidth={1.5} />
}
