//Генератор цветов

import { moduleHue, ModuleType } from "./tokens"

const createColor = (h: number) => ({
  light: `bg-[oklch(var(--l2)_var(--c2)_${h})]`,
  DEFAULT: `bg-[oklch(var(--l3)_var(--c3)_${h})]`,
  soft: `bg-[oklch(var(--l1)_var(--c1)_${h})]`,
  text: `text-[oklch(var(--l3)_var(--c3)_${h})]`,
  border: `border-[oklch(var(--l3)_var(--c3)_${h})/0.45]`,
  shadow: `shadow-[oklch(var(--l3)_var(--c3)_${h})/0.25]`,
})

export const moduleColors: Record<ModuleType, ReturnType<typeof createColor>> = Object.fromEntries(
  Object.entries(moduleHue).map(([k, h]) => [k, createColor(h)])
) as any
