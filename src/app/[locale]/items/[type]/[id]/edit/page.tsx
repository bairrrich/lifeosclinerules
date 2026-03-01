"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import { useLocale } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormActions } from "@/components/shared/form-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { db, getEntityById, updateEntity, getAllEntities } from "@/lib/db"
import type { ItemType, Item } from "@/types"
import { financeCategoriesStructure } from "@/lib/finance-categories"

// Validation messages
const validationMessages = {
  name: "Введите название",
}

// Form schema factory function
function createItemSchema(t: (key: string) => string) {
  const messages = {
    name: t("validation.name") || validationMessages.name,
  }

  return z.object({
    name: z.string().min(1, messages.name),
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
}

type FormData = z.infer<ReturnType<typeof createItemSchema>>

const typeLabels: Record<ItemType, string> = {
  vitamin: "Витамин",
  medicine: "Лекарство",
  herb: "Трава",
  cosmetic: "Косметика",
  product: "Продукт",
}

// Формы выпуска по типам
const formOptions: Record<ItemType, string[]> = {
  vitamin: ["Таблетки", "Капсулы", "Драже", "Порошок", "Жидкость", "Спрей", "Пластырь"],
  medicine: [
    "Таблетки",
    "Капсулы",
    "Ампулы",
    "Флакон",
    "Туба",
    "Мазь",
    "Гель",
    "Свечи",
    "Порошок",
    "Сироп",
    "Капли",
  ],
  herb: ["Сухая смесь", "Фильтр-пакеты", "Настойка", "Экстракт", "Масло", "Капсулы"],
  cosmetic: [
    "Крем",
    "Гель",
    "Сыворотка",
    "Маска",
    "Лосьон",
    "Тоник",
    "Масло",
    "Скраб",
    "Бальзам",
    "Спрей",
  ],
  product: ["Штучный", "Весовой", "Жидкий", "Замороженный", "Консервы", "Бутылка", "Пакет"],
}

// Производители по типам
const manufacturerOptions: Record<ItemType, string[]> = {
  vitamin: [
    "Solgar",
    "Now Foods",
    "Nature's Bounty",
    "Доппельгерц",
    "Компливит",
    "Алфавит",
    "Витрум",
    "Мульти-табс",
    "Эвалар",
    "Другое",
  ],
  medicine: [
    "Фармстандарт",
    "Teva",
    "Sanofi",
    "Bayer",
    "Novartis",
    "Nycomed",
    "Берлин-Хеми",
    "Гедеон Рихтер",
    "Другое",
  ],
  herb: [
    "Эвалар",
    "Байкальские травы",
    "Травы Кавказа",
    "Биолит",
    "Фитолон",
    "Nature's Way",
    "Другое",
  ],
  cosmetic: [
    "Nivea",
    "L'Oreal",
    "Garnier",
    "La Roche-Posay",
    "CeraVe",
    "Vichy",
    "Bioderma",
    "The Ordinary",
    "Другое",
  ],
  product: [
    "Магнит",
    "Пятёрочка",
    "Азбука Вкуса",
    "Перекрёсток",
    "Красная Цена",
    "Чистая Линия",
    "Домик в деревне",
    "Простоквашино",
    "Савушкин",
    "Другое",
  ],
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ItemType
  const id = params.id as string
  const t = useTranslations("items")
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedForm, setSelectedForm] = useState("")
  const [selectedManufacturer, setSelectedManufacturer] = useState("")
  const [existingManufacturers, setExistingManufacturers] = useState<string[]>([])
  const [existingCategories, setExistingCategories] = useState<string[]>([])

  const tFinCat = useTranslations("financeCategories")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createItemSchema((key) => t(`validation.${key}`))),
  })

  // Получаем категории для текущего типа
  const getCategoryOptions = (): string[] => {
    if (type === "product") {
      // Для продуктов используем подкатегории из финансов
      const productSubcats = financeCategoriesStructure.expense?.product?.subcategories || {}
      const productCats = Object.keys(productSubcats).map((key) => tFinCat(`subcategories.${key}`))
      return [...productCats, ...existingCategories.filter((c) => !productCats.includes(c))]
    }
    return existingCategories.length > 0 ? existingCategories : getDefaultCategories(type)
  }

  const getDefaultCategories = (itemType: ItemType): string[] => {
    const defaults: Record<ItemType, string[]> = {
      vitamin: [
        "Витамин A",
        "Витамин B",
        "Витамин C",
        "Витамин D",
        "Витамин E",
        "Витамин K",
        "Мультивитамины",
        "Минералы",
      ],
      medicine: [
        "Обезболивающие",
        "Жаропонижающие",
        "Противовирусные",
        "Антибиотики",
        "Аллергия",
        "ЖКТ",
        "Сердце",
        "Нервная система",
      ],
      herb: [
        "Успокоительные",
        "Иммунитет",
        "Пищеварение",
        "Сон",
        "Дыхание",
        "Сердце",
        "Печень",
        "Почки",
      ],
      cosmetic: [
        "Уход за лицом",
        "Уход за телом",
        "Уход за волосами",
        "Уход за руками",
        "Уход за ногами",
        "Солнцезащитные",
        "Декоративная",
      ],
      product: [],
    }
    return defaults[itemType] || []
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

  useEffect(() => {
    async function loadData() {
      try {
        // Загружаем существующие категории и производителей
        const allItems = (await getAllEntities(db.items)) as Item[]
        const itemsOfType = allItems.filter((i) => i.type === type)

        const categories = [
          ...new Set(itemsOfType.map((i) => i.category).filter(Boolean)),
        ] as string[]
        const manufacturers = [
          ...new Set(itemsOfType.map((i) => i.manufacturer).filter(Boolean)),
        ] as string[]

        setExistingCategories(categories)
        setExistingManufacturers(manufacturers)

        // Загружаем элемент
        const item = await getEntityById(db.items, id)
        if (item) {
          setSelectedCategory(item.category || "")
          setSelectedForm(item.form || "")
          setSelectedManufacturer(item.manufacturer || "")

          reset({
            name: item.name,
            category: item.category || "",
            description: item.description || "",
            usage: item.usage || "",
            benefits: item.benefits || "",
            contraindications: item.contraindications || "",
            dosage: item.dosage || "",
            form: item.form || "",
            manufacturer: item.manufacturer || "",
            composition: item.composition || "",
            storage: item.storage || "",
            expiration: item.expiration?.split("T")[0] || "",
            notes: item.notes || "",
            tags: item.tags?.join(", ") || "",
            calories: item.calories,
            protein: item.protein,
            fat: item.fat,
            carbs: item.carbs,
            serving_size: item.serving_size,
          })
        }
      } catch (error) {
        console.error("Failed to load item:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, reset, type])

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)
    try {
      await updateEntity(db.items, id, {
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
      router.push(`/items/${type}/${id}`)
    } catch (error) {
      console.error("Failed to update item:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title={t("edit.loading")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("edit.loading")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t("edit.title", { type: typeLabels[type] })}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("edit.basic")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name")} *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t("fields.category")}</Label>
                <Combobox
                  options={getCategoryOptions().map((opt) => ({ id: opt, label: opt }))}
                  value={selectedCategory}
                  onChange={(value) => {
                    setSelectedCategory(value as string)
                    setValue("category", value as string)
                  }}
                  placeholder={t("edit.categoryPlaceholder")}
                  allowCustom={true}
                  searchable={false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("fields.description")}</Label>
                <Textarea id="description" {...register("description")} />
              </div>
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("edit.usage")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usage">{t("fields.usage")}</Label>
                <Textarea id="usage" {...register("usage")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">{t("fields.dosage")}</Label>
                  <Input id="dosage" {...register("dosage")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("fields.form")}</Label>
                  <Combobox
                    options={formOptionsList.map((opt) => ({ id: opt, label: opt }))}
                    value={selectedForm}
                    onChange={(value) => {
                      setSelectedForm(value as string)
                      setValue("form", value as string)
                    }}
                    placeholder={t("edit.formPlaceholder")}
                    allowCustom={true}
                    searchable={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("edit.health")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="benefits">{t("fields.benefits")}</Label>
                <Textarea id="benefits" {...register("benefits")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contraindications">{t("fields.contraindications")}</Label>
                <Textarea id="contraindications" {...register("contraindications")} />
              </div>
            </CardContent>
          </Card>

          {/* Nutrition - only for products */}
          {type === "product" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("edit.nutrition")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories" className="text-xs">
                      {t("edit.calories")}
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
                      {t("edit.protein")}
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
                      {t("edit.fat")}
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
                      {t("edit.carbs")}
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
                  <Label htmlFor="serving_size">{t("edit.servingSize")}</Label>
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
              <CardTitle>{t("edit.additional")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("fields.manufacturer")}</Label>
                  <Combobox
                    options={manufacturerOptionsList.map((opt) => ({ id: opt, label: opt }))}
                    value={selectedManufacturer}
                    onChange={(value) => {
                      setSelectedManufacturer(value as string)
                      setValue("manufacturer", value as string)
                    }}
                    placeholder={t("edit.manufacturerPlaceholder")}
                    allowCustom={true}
                    searchable={false}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiration">{t("fields.expiration")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watch("expiration") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {(() => {
                          const expiration = watch("expiration")
                          return expiration ? (
                            format(new Date(expiration), "LLL dd, y", {
                              locale: dateFnsLocale,
                            })
                          ) : (
                            <span>{t("fields.expiration")}</span>
                          )
                        })()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <Calendar
                        mode="single"
                        selected={watch("expiration") ? new Date(watch("expiration")!) : undefined}
                        onSelect={(date) =>
                          setValue("expiration", date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                        locale={dateFnsLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="composition">{t("fields.composition")}</Label>
                <Textarea id="composition" {...register("composition")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">{t("fields.storage")}</Label>
                <Input id="storage" {...register("storage")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("fields.notes")}</Label>
                <Textarea id="notes" {...register("notes")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">{t("fields.tags")}</Label>
                <Input id="tags" placeholder={t("edit.tagsPlaceholder")} {...register("tags")} />
              </div>
            </CardContent>
          </Card>

          <FormActions
            type="page"
            onCancel={() => router.back()}
            onSave={handleSubmit(onSubmit)}
            isSaving={isSaving}
          />
        </form>
      </div>
    </AppLayout>
  )
}
