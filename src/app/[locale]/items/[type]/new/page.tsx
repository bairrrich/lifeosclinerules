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
import { CreateFormActions } from "@/components/shared/form-actions"
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
import { db, createEntity, initializeDatabase, getAllEntities } from "@/lib/db"
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
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS
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
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createItemSchema((key) => t(`validation.${key}`))),
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

  const tFinCat = useTranslations("financeCategories")

  // Emoji для категорий (зависит от типа предмета)
  const getCategoryEmoji = (category: string, itemType: ItemType = type): string => {
    const emojiSets: Record<ItemType, Record<string, string>> = {
      // Vitamins (Витамины)
      vitamin: {
        // Russian
        Витамины: "💊",
        Минералы: "🧂",
        БАД: "🌿",
        Пробиотики: "🦠",
        Омега: "🐟",
        Протеин: "🥤",
        Аминокислоты: "🧪",
        Коллаген: "🧴",
        Антиоксиданты: "🫐",
        "Для иммунитета": "🛡️",
        "Для энергии": "⚡",
        "Для костей": "🦴",
        "Для суставов": "🦵",
        "Для сердца": "❤️",
        "Для зрения": "👁️",
        "Для волос": "💇",
        "Для ногтей": "💅",
        "Для кожи": "🧴",
        // English - default categories
        "Vitamin A": "🥕",
        "Vitamin B": "💊",
        "Vitamin C": "🍊",
        "Vitamin D": "☀️",
        "Vitamin E": "🌻",
        "Vitamin K": "🥬",
        Multivitamins: "💊",
        Minerals: "🧂",
        // English - other
        Vitamins: "💊",
        Supplements: "🌿",
        Probiotics: "🦠",
        Omega: "🐟",
        Protein: "🥤",
        "Amino acids": "🧪",
        Collagen: "🧴",
        Antioxidants: "🫐",
        "For immunity": "🛡️",
        "For energy": "⚡",
        "For bones": "🦴",
        "For joints": "🦵",
        "For heart": "❤️",
        "For vision": "👁️",
        "For hair": "💇",
        "For nails": "💅",
        "For skin": "🧴",
      },
      // Medicines (Лекарства)
      medicine: {
        // Russian
        Обезболивающие: "💉",
        "Сердечно-сосудистые": "❤️",
        Противовирусные: "🦠",
        Антибиотики: "💊",
        Жаропонижающие: "🌡️",
        "От давления": "🩺",
        "Для желудка": "🤢",
        Антигистаминные: "🤧",
        Успокоительные: "😴",
        Противовоспалительные: "🔥",
        Гормональные: "🧪",
        Мочегонные: "💧",
        "От кашля": "😷",
        "Для горла": "🗣️",
        "Для носа": "👃",
        "Для глаз": "👁️",
        Антисептики: "🧼",
        Перевязочные: "🩹",
        Сиропы: "🍯",
        Таблетки: "💊",
        Капли: "💧",
        Мази: "🧴",
        Спреи: "💨",
        Порошки: "🧂",
        Свечи: "🕯️",
        Пластыри: "🩹",
        // English - default categories
        "Pain relievers": "💉",
        Antipyretics: "🌡️",
        Antivirals: "🦠",
        Antibiotics: "💊",
        Allergy: "🤧",
        Digestive: "🤢",
        Heart: "❤️",
        "Nervous system": "🧠",
        // English - other
        Painkillers: "💉",
        Cardiovascular: "❤️",
        Antipyretic: "🌡️",
        "For blood pressure": "🩺",
        "For stomach": "🤢",
        Antihistamines: "🤧",
        Sedatives: "😴",
        "Anti-inflammatory": "🔥",
        Hormonal: "🧪",
        Diuretics: "💧",
        "For cough": "😷",
        "For throat": "🗣️",
        "For nose": "👃",
        "For eyes": "👁️",
        Antiseptics: "🧼",
        Bandages: "🩹",
        Syrups: "🍯",
        Tablets: "💊",
        Drops: "💧",
        Ointments: "🧴",
        Sprays: "💨",
        Powders: "🧂",
        Suppositories: "🕯️",
        Plasters: "🩹",
      },
      // Herbs (Травы)
      herb: {
        // Russian
        Травы: "🌿",
        Корни: "🥕",
        Цветы: "🌸",
        Ягоды: "🍓",
        Семена: "🌱",
        Кора: "🪵",
        Листва: "🍃",
        Почки: "🌳",
        Грибы: "🍄",
        Чаи: "🍵",
        Настойки: "🧪",
        Отвары: "🍲",
        Сборы: "🌿",
        Экстракты: "💧",
        Масла: "🫗",
        Порошки: "🧂",
        // English - default categories
        Sedatives: "😴",
        Immunity: "🛡️",
        Digestion: "🤢",
        Sleep: "😴",
        Respiratory: "🫁",
        Heart: "❤️",
        Liver: "🫀",
        Kidneys: "🫘",
        // English - other
        Herbs: "🌿",
        Roots: "🥕",
        Flowers: "🌸",
        Berries: "🍓",
        Seeds: "🌱",
        Bark: "🪵",
        Leaves: "🍃",
        Buds: "🌳",
        Mushrooms: "🍄",
        Teas: "🍵",
        Tinctures: "🧪",
        Decoctions: "🍲",
        Collections: "🌿",
        Extracts: "💧",
        Oils: "🫗",
        Powders: "🧂",
      },
      // Cosmetics (Косметика)
      cosmetic: {
        // Russian
        "Уход за лицом": "🧴",
        "Уход за телом": "🛁",
        "Уход за волосами": "💇",
        Декоративная: "💄",
        Парфюмерия: "🌺",
        Гигиена: "🪥",
        "Защита от солнца": "☀️",
        "Для рук": "🤲",
        "Для ног": "🦶",
        "Для губ": "👄",
        "Для ногтей": "💅",
        Кремы: "🧴",
        Маски: "🎭",
        Скрабы: "🧽",
        Шампуни: "🧴",
        Бальзамы: "🧴",
        Лосьоны: "🧴",
        Гели: "🧴",
        Сыворотки: "💧",
        Тоники: "💧",
        Пенки: "🫧",
        Мыло: "🧼",
        Дезодоранты: "💨",
        Лаки: "💅",
        Тушь: "👁️",
        Помада: "💄",
        Тени: "👁️",
        Румяна: "🌸",
        Пудра: "🧂",
        Тональные: "🧴",
        // English
        "Face care": "🧴",
        "Body care": "🛁",
        "Hair care": "💇",
        "Hand care": "🤲",
        "Foot care": "🦶",
        "Sun protection": "☀️",
        "Decorative cosmetics": "💄",
        "Nail care": "💅",
        "Lip care": "👄",
        Perfume: "🌺",
        Hygiene: "🪥",
        Creams: "🧴",
        Masks: "🎭",
        Scrubs: "🧽",
        Shampoos: "🧴",
        Balms: "🧴",
        Lotions: "🧴",
        Gels: "🧴",
        Serums: "💧",
        Toners: "💧",
        Foams: "🫧",
        Soaps: "🧼",
        Deodorants: "💨",
        Varnishes: "💅",
        Mascara: "👁️",
        Lipstick: "💄",
        Eyeshadow: "👁️",
        Blush: "🌸",
        Powder: "🧂",
        Foundation: "🧴",
      },
      // Products (Продукты) - includes finance subcategories
      product: {
        // Finance subcategories (from tFinCat)
        dairy: "🥛",
        meat: "🥩",
        fish: "🐟",
        vegetables: "🥬",
        fruits: "🍎",
        berries: "🫐",
        cereals: "🌾",
        bread: "🍞",
        drinks: "🥤",
        groceries: "🛒",
        confectionery: "🍬",
        frozen: "🧊",
        // Russian names
        Молочные: "🥛",
        Мясо: "🥩",
        Рыба: "🐟",
        Овощи: "🥬",
        Фрукты: "🍎",
        Ягоды: "🫐",
        Зёрна: "🌾",
        Хлеб: "🍞",
        Яйца: "🥚",
        Орехи: "🥜",
        Напитки: "🥤",
        Сладости: "🍬",
        Бакалея: "🛒",
        Соусы: "🥫",
        Специи: "🧂",
        Консервы: "🥫",
        Полуфабрикаты: "🍱",
        Фастфуд: "🍔",
        Масла: "🫒",
        Чай: "🍵",
        Кофе: "☕",
        Соки: "🧃",
        Вода: "💧",
        Газировка: "🥤",
        Алкоголь: "🍷",
        Снеки: "🍿",
        Чипсы: "🥔",
        Шоколад: "🍫",
        Конфеты: "🍬",
        Печенье: "🍪",
        Торты: "🎂",
        Мороженое: "🍦",
        Мёд: "🍯",
        Варенье: "🍓",
        Сгущёнка: "🥛",
        Сыр: "🧀",
        Колбаса: "🥓",
        Сосиски: "🌭",
        Пельмени: "🥟",
        Макароны: "🍝",
        Рис: "🍚",
        Гречка: "🌾",
        Овсянка: "🥣",
      },
    }

    const emojis = emojiSets[itemType] || emojiSets.product

    // Поиск по ключу (частичное совпадение)
    for (const [key, emoji] of Object.entries(emojis)) {
      if (category.includes(key)) {
        return emoji
      }
    }
    return "📦" // Default
  }

  // Получаем emoji для формы выпуска
  const getFormEmoji = (form: string): string => {
    const emojis: Record<string, string> = {
      // English
      Tablets: "💊",
      Capsules: "💊",
      Pills: "💊",
      Liquid: "💧",
      Syrup: "🍯",
      Drops: "💧",
      Powder: "🧂",
      Cream: "🧴",
      Ointment: "🧴",
      Gel: "🧴",
      Spray: "💨",
      Injection: "💉",
      Patch: "🩹",
      Suppository: "🕯️",
      Tea: "🍵",
      Tincture: "🧪",
      Extract: "💧",
      Oil: "🫗",
      Balm: "🧴",
      Lotion: "🧴",
      Solution: "💧",
      Suspension: "💧",
      Granules: "🧂",
      Chewable: "🍬",
      Effervescent: "🫧",
      // Russian
      Таблетки: "💊",
      Капсулы: "💊",
      Пилюли: "💊",
      Жидкость: "💧",
      Сироп: "🍯",
      Капли: "💧",
      Порошок: "🧂",
      Крем: "🧴",
      Мазь: "🧴",
      Гель: "🧴",
      Спрей: "💨",
      Инъекция: "💉",
      Пластырь: "🩹",
      Свечи: "🕯️",
      Чай: "🍵",
      Настойка: "🧪",
      Экстракт: "💧",
      Масло: "🫗",
      Бальзам: "🧴",
      Лосьон: "🧴",
      Раствор: "💧",
      Суспензия: "💧",
      Гранулы: "🧂",
      Жевательные: "🍬",
      Шипучие: "🫧",
    }

    for (const [key, emoji] of Object.entries(emojis)) {
      if (form.includes(key)) {
        return emoji
      }
    }
    return "💊" // Default
  }

  // Получаем категории для текущего типа с emoji
  const getCategoryOptions = (): { id: string; label: string }[] => {
    if (type === "product") {
      // Для продуктов используем подкатегории из финансов с emoji
      const productSubcats = financeCategoriesStructure.expense?.product?.subcategories || {}
      const productCats = Object.keys(productSubcats).map((key) => ({
        id: tFinCat(`subcategories.${key}`),
        label: `${getCategoryEmoji(key, "product" as ItemType)} ${tFinCat(`subcategories.${key}`)}`,
      }))

      // Добавляем существующие категории
      const existing = existingCategories
        .filter((c) => !productCats.some((pc) => pc.id === c))
        .map((c) => ({
          id: c,
          label: `${getCategoryEmoji(c, "product" as ItemType)} ${c}`,
        }))

      const result = [...productCats, ...existing]
      console.log("[CategoryOptions] Product:", result)
      return result
    }

    // Для витаминов, лекарств, трав, косметики
    const categories =
      existingCategories.length > 0 ? existingCategories : getDefaultCategories(type, t)

    const result = categories.map((c) => ({
      id: c,
      label: `${getCategoryEmoji(c, type)} ${c}`,
    }))

    console.log("[CategoryOptions]", type, ":", result)
    console.log("[CategoryOptions] existingCategories:", existingCategories)
    console.log("[CategoryOptions] getDefaultCategories:", getDefaultCategories(type, t))

    return result
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

              <div className="space-y-2">
                <Label>{t("fields.category")}</Label>
                <Combobox
                  options={getCategoryOptions()}
                  value={selectedCategory}
                  onChange={(value) => {
                    setSelectedCategory(value as string)
                    setValue("category", value as string)
                  }}
                  placeholder={t("new.categoryPlaceholder")}
                  allowCustom={true}
                  searchable={false}
                  className="emoji"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">{t("fields.dosage")}</Label>
                  <Input
                    id="dosage"
                    placeholder={t("new.dosagePlaceholder")}
                    {...register("dosage")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("fields.form")}</Label>
                  <Combobox
                    options={formOptionsList.map((opt) => ({
                      id: opt,
                      label: `${getFormEmoji(opt)} ${opt}`,
                    }))}
                    value={selectedForm}
                    onChange={(value) => {
                      setSelectedForm(value as string)
                      setValue("form", value as string)
                    }}
                    placeholder={t("new.formPlaceholder")}
                    allowCustom={true}
                    searchable={false}
                    className="emoji"
                  />
                </div>
              </div>
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
                    placeholder={t("new.manufacturerPlaceholder")}
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
