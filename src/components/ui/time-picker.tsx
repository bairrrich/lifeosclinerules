"use client"

import * as React from "react"
import { Clock } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function TimePicker({ value = "", onChange, className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hour, setHour] = React.useState(() => value.split(":")[0] || "00")
  const [minute, setMinute] = React.useState(() => value.split(":")[1] || "00")

  React.useEffect(() => {
    if (value) {
      const parts = value.split(":")
      setHour(parts[0] || "00")
      setMinute(parts[1] || "00")
    }
  }, [value])

  const handleHourChange = (newHour: string) => {
    const num = parseInt(newHour, 10)
    if (isNaN(num)) return
    const clamped = Math.max(0, Math.min(23, num))
    const formatted = clamped.toString().padStart(2, "0")
    setHour(formatted)
    onChange?.(`${formatted}:${minute}`)
  }

  const handleMinuteChange = (newMinute: string) => {
    const num = parseInt(newMinute, 10)
    if (isNaN(num)) return
    const clamped = Math.max(0, Math.min(59, num))
    const formatted = clamped.toString().padStart(2, "0")
    setMinute(formatted)
    onChange?.(`${hour}:${formatted}`)
  }

  const quickTimes = [
    { label: "00:00", value: "00:00" },
    { label: "06:00", value: "06:00" },
    { label: "07:00", value: "07:00" },
    { label: "08:00", value: "08:00" },
    { label: "09:00", value: "09:00" },
    { label: "12:00", value: "12:00" },
    { label: "18:00", value: "18:00" },
    { label: "21:00", value: "21:00" },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? value : <span>Выберите время</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Время</Label>
            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <Label htmlFor="hour" className="text-xs">
                  Часы
                </Label>
                <Input
                  id="hour"
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className="w-16 text-center"
                />
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="space-y-1">
                <Label htmlFor="minute" className="text-xs">
                  Минуты
                </Label>
                <Input
                  id="minute"
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => handleMinuteChange(e.target.value)}
                  className="w-16 text-center"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Быстрый выбор</Label>
            <div className="grid grid-cols-4 gap-1">
              {quickTimes.map((time) => (
                <Button
                  key={time.value}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setHour(time.value.split(":")[0])
                    setMinute(time.value.split(":")[1])
                    onChange?.(time.value)
                  }}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
