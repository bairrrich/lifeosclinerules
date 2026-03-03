import { getRequestConfig } from "next-intl/server"
import { locales } from "@/lib/i18n-constants"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as any)) {
    locale = "en"
  }

  // Load all message files
  const common = (await import(`@/messages/${locale}/common.json`)).default
  const navigation = (await import(`@/messages/${locale}/navigation.json`)).default
  const home = (await import(`@/messages/${locale}/home.json`)).default
  const analytics = (await import(`@/messages/${locale}/analytics.json`)).default
  const settings = (await import(`@/messages/${locale}/settings.json`)).default
  const books = (await import(`@/messages/${locale}/books.json`)).default
  const recipes = (await import(`@/messages/${locale}/recipes.json`)).default
  const logs = (await import(`@/messages/${locale}/logs.json`)).default
  const habits = (await import(`@/messages/${locale}/habits.json`)).default
  const goals = (await import(`@/messages/${locale}/goals.json`)).default
  const reminders = (await import(`@/messages/${locale}/reminders.json`)).default
  const water = (await import(`@/messages/${locale}/water.json`)).default
  const sleep = (await import(`@/messages/${locale}/sleep.json`)).default
  const mood = (await import(`@/messages/${locale}/mood.json`)).default
  const body = (await import(`@/messages/${locale}/body.json`)).default
  const templates = (await import(`@/messages/${locale}/templates.json`)).default
  const items = (await import(`@/messages/${locale}/items.json`)).default
  const content = (await import(`@/messages/${locale}/content.json`)).default
  const entities = (await import(`@/messages/${locale}/entities.json`)).default
  const language = (await import(`@/messages/${locale}/language.json`)).default
  const onboarding = (await import(`@/messages/${locale}/onboarding.json`)).default
  const food = (await import(`@/messages/${locale}/food.json`)).default
  const fab = (await import(`@/messages/${locale}/fab.json`)).default
  const financeCategories = (await import(`@/messages/${locale}/financeCategories.json`)).default
  const finance = (await import(`@/messages/${locale}/finance.json`)).default
  const errors = (await import(`@/messages/${locale}/errors.json`)).default
  const loading = (await import(`@/messages/${locale}/loading.json`)).default
  const confirmations = (await import(`@/messages/${locale}/confirmations.json`)).default
  const empty = (await import(`@/messages/${locale}/empty.json`)).default
  const globalSearch = (await import(`@/messages/${locale}/globalSearch.json`)).default
  const timePicker = (await import(`@/messages/${locale}/timePicker.json`)).default
  const workout = (await import(`@/messages/${locale}/workout.json`)).default

  return {
    locale,
    messages: {
      common,
      navigation,
      home,
      analytics,
      settings,
      books,
      recipes,
      logs,
      habits,
      goals,
      reminders,
      water,
      sleep,
      mood,
      body,
      templates,
      items,
      content,
      entities,
      language,
      onboarding,
      food,
      fab,
      financeCategories,
      finance,
      errors,
      loading,
      confirmations,
      empty,
      globalSearch,
      timePicker,
      workout,
    },
  }
})
