//Design Tokens (основа всей системы)

export const moduleHue = {
  food: 68,
  workout: 218,
  finance: 145,
  water: 208,
  sleep: 278,
  mood: 312,
  books: 48,
  recipes: 58,
  habits: 118,
  goals: 38,
  logs: 242,
  settings: 255,
} as const

export type ModuleType = keyof typeof moduleHue
