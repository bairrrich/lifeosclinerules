Сделаем production-уровневую color-system архитектуру для Next.js + Tailwind + OKLCH + auto light/dark, подходящую для твоего LifeOS.
Цель: минимум кода, максимум масштабируемости.

Итоговая система будет:
Design Tokens
Semantic colors
Module colors
Chart palette
State colors
Auto dark/light
Tailwind ready
Shadcn compatible

Структура:

/lib/theme
tokens.ts
semantic.ts
modules.ts
charts.ts
helpers.ts

/styles
theme.css

Использование
module card

<div className={moduleColors.food.DEFAULT}>
module badge
<span className={moduleColors.finance.soft}>
border
<div className={moduleColors.workout.border}>
helper
<div className={getModuleColor("water", "light")}>
7. Tailwind config

tailwind.config.ts

export default {
darkMode: "class",
} 8. Auto theme

Используй:

next-themes
npm install next-themes

layout:

<ThemeProvider attribute="class" defaultTheme="system">
