"use client"

import { useState } from "react"
import { Upload } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export interface ImageUploadProps {
  /** Текущее значение URL изображения */
  imageUrl?: string
  /** Callback при изменении URL */
  onChange: (url: string) => void
  /** Label для поля */
  label: string
  /** Placeholder для input */
  placeholder?: string
  /** ID для accessibility */
  id?: string
  /** Ширина превью (по умолчанию 64px) */
  previewWidth?: number
  /** Высота превью (по умолчанию 96px) */
  previewHeight?: number
}

export function ImageUpload({
  imageUrl,
  onChange,
  label,
  placeholder = "https://example.com/image.jpg",
  id = "image_url",
  previewWidth = 64,
  previewHeight = 96,
}: ImageUploadProps) {
  const [inputId] = useState(() => `${id}_input`)
  const [fileId] = useState(() => `${id}_file`)

  return (
    <div className="flex items-center gap-4">
      {imageUrl && (
        <div
          className="relative flex-shrink-0 rounded overflow-hidden border"
          style={{ width: previewWidth, height: previewHeight }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="flex gap-2">
          <Input
            id={inputId}
            placeholder={placeholder}
            value={imageUrl || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1"
          />
          <input
            type="file"
            id={fileId}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  onChange(reader.result as string)
                }
                reader.readAsDataURL(file)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => document.getElementById(fileId)?.click()}
            title="Upload image"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
