"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateFormActions } from "@/components/shared/form-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ComboboxSelect } from "@/components/logs/combobox-select"
import { db, createEntity, initializeDatabase, getAllEntities } from "@/lib/db"
import type { ItemType, Item } from "@/types"
import { financeCategories } from "@/components/logs/finance-form"

// Form schema
const itemSchema = z.object({
  name: z.string().min(1, "Введите название"),
  category: z.string().optional(),
  description: z.string().optional(),
  usage: z.string().optional(),
  benefits: z.string().optional(),
  contraindications: z.string().optional(),
  dosage: z.string().optional(),
  form: z.string().optional(),
  manufacturer: z.string().optional(),
  composition: z.string().optional(),
  storage: z.string().optional(),
  expiration: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  carbs: z.number().optional(),
  serving_size: z.number().optional(),
})

type FormData = z.infer<typeof itemSchema>

function getTypeLabels(t: any): Record<ItemType, string> {
  return {
    vitamin: t("types.vitamin"),
    medicine: t("types.medicine"),
    herb: t("types.herb"),
    cosmetic: t("types.cosmetic"),
    product: t("types.product"),
  }
}

function getFormOptions(t: any): Record<ItemType, string[]> {
  return {
    vitamin: t("formOptions.vitamin").split("|"),
    medicine: t("formOptions.medicine").split("|"),
    herb: t("formOptions.herb").split("|"),
    cosmetic: t("formOptions.cosmetic").split("|"),
    product: t("formOptions.product").split("|"),
  }
}

function getManufacturerOptions(t: any): Record<ItemType, string[]> {
  return {
    vitamin: t("manufacturerOptions.vitamin").split("|"),
    medicine: t("manufacturerOptions.medicine").split("|"),
    herb: t("manufacturerOptions.herb").split("|"),
    cosmetic: t("manufacturerOptions.cosmetic").split("|"),
    product: t("manufacturerOptions.product").split("|"),
  }
}

export default function NewItemPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ItemType
  const t = useTranslations("items")
  const typeLabels = getTypeLabels(t)
  const formOptions = getFormOptions(t)
  const manufacturerOptions = getManufacturerOptions(t)

  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedForm, setSelectedForm] = useState("")
  const [selectedManufacturer, setSelectedManufacturer] = useState("")
  const [existingManufacturers, setExistingManufacturers] = useState<string[]>([])
  const [existingCategories, setExistingCategories] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(itemSchema),
  })

  // Загружаем существующие категории и производителей
  useEffect(() => {
    async function loadData() {
      await initializeDatabase()
      const allItems = (await getAllEntities(db.items)) as Item[]
      const itemsOfType = allItems.filter((i) => i.type === type)

      // Собираем уникальные категории и производителей
      const categories = [
        ...new Set(itemsOfType.map((i) => i.category).filter(Boolean)),
      ] as string[]
      const manufacturers = [
        ...new Set(itemsOfType.map((i) => i.manufacturer).filter(Boolean)),
      ] as string[]

      setExistingCategories(categories)
      setExistingManufacturers(manufacturers)
    }
    loadData()
  }, [type])

  // Получаем категории для текущего типа
  const getCategoryOptions = (): string[] => {
    if (type === "product") {
      // Для продуктов используем подкатегории из финансов
      const productCats = Object.keys(
        financeCategories.expense?.[t("financeCategories.product")]?.subcategories || {}
      )
      return [...productCats, ...existingCategories.filter((c) => !productCats.includes(c))]
    }
    return existingCategories.length > 0 ? existingCategories : getDefaultCategories(type, t)
  }

  const getDefaultCategories = (itemType: ItemType, t: any): string[] => {
    const categoriesStr = t(`defaultCategories.${itemType}`)
    if (!categoriesStr) return []
    return categoriesStr.split("|").filter(Boolean)
  }

  // Объединяем варианты форм и производителей
  const formOptionsList = [
    ...new Set([
      ...(formOptions[type] || []),
      ...existingManufacturers.filter((m) => formOptions[type]?.includes(m)),
    ]),
  ]
  const manufacturerOptionsList = [
    ...new Set([...(manufacturerOptions[type] || []), ...existingManufacturers]),
  ]

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await createEntity(db.items, {
        type,
        name: data.name,
        category: selectedCategory || undefined,
        description: data.description,
        usage: data.usage,
        benefits: data.benefits,
        contraindications: data.contraindications,
        dosage: data.dosage,
        form: selectedForm || undefined,
        manufacturer: selectedManufacturer || undefined,
        composition: data.composition,
        storage: data.storage,
        expiration: data.expiration,
        notes: data.notes,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        serving_size: data.serving_size,
      })

      router.push("/items")
    } catch (error) {
      console.error("Failed to create item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={t("new.title", { type: typeLabels[type] })}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("new.basic")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name")} *</Label>
                <Input id="name" placeholder={t("new.namePlaceholder")} {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <ComboboxSelect
                label={t("fields.category")}
                options={getCategoryOptions()}
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value)
                  setValue("category", value)
                }}
                placeholder={t("new.categoryPlaceholder")}
              />

              <div className="space-y-2">
                <Label htmlFor="description">{t("fields.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("new.descriptionPlaceholder")}
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("new.usage")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usage">{t("fields.usage")}</Label>
                <Textarea
                  id="usage"
                  placeholder={t("new.usagePlaceholder")}
                  {...register("usage")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">{t("fields.dosage")}</Label>
                <Input
                  id="dosage"
                  placeholder={t("new.dosagePlaceholder")}
                  {...register("dosage")}
                />
              </div>

              <ComboboxSelect
                label={t("fields.form")}
                options={formOptionsList}
                value={selectedForm}
                onChange={(value) => {
                  setSelectedForm(value)
                  setValue("form", value)
                }}
                placeholder={t("new.formPlaceholder")}
              />
            </CardContent>
          </Card>

          {/* Health Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("new.health")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="benefits">{t("fields.benefits")}</Label>
                <Textarea
                  id="benefits"
                  placeholder={t("new.benefitsPlaceholder")}
                  {...register("benefits")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraindications">{t("fields.contraindications")}</Label>
                <Textarea
                  id="contraindications"
                  placeholder={t("new.contraindicationsPlaceholder")}
                  {...register("contraindications")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Nutrition - only for products */}
          {type === "product" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("new.nutrition")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories" className="text-xs">
                      {t("new.calories")}
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="0"
                      {...register("calories", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein" className="text-xs">
                      {t("new.protein")}
                    </Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      {...register("protein", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat" className="text-xs">
                      {t("new.fat")}
                    </Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      {...register("fat", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs" className="text-xs">
                      {t("new.carbs")}
                    </Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      {...register("carbs", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serving_size">{t("new.servingSize")}</Label>
                  <Input
                    id="serving_size"
                    type="number"
                    placeholder="100"
                    {...register("serving_size", { valueAsNumber: true })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("new.additional")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ComboboxSelect
                label={t("fields.manufacturer")}
                options={manufacturerOptionsList}
                value={selectedManufacturer}
                onChange={(value) => {
                  setSelectedManufacturer(value)
                  setValue("manufacturer", value)
                }}
                placeholder={t("new.manufacturerPlaceholder")}
              />

              <div className="space-y-2">
                <Label htmlFor="expiration">{t("fields.expiration")}</Label>
                <Input id="expiration" type="date" {...register("expiration")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="composition">{t("fields.composition")}</Label>
                <Textarea
                  id="composition"
                  placeholder={t("new.compositionPlaceholder")}
                  {...register("composition")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">{t("fields.storage")}</Label>
                <Input
                  id="storage"
                  placeholder={t("new.storagePlaceholder")}
                  {...register("storage")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("fields.notes")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("new.notesPlaceholder")}
                  {...register("notes")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">{t("fields.tags")}</Label>
                <Input id="tags" placeholder={t("new.tagsPlaceholder")} {...register("tags")} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <CreateFormActions
            onCancel={() => router.back()}
            onSave={handleSubmit(onSubmit)}
            isSaving={isLoading}
          />
        </form>
      </div>
    </AppLayout>
  )
}
