Для современного приложения (как **Linear / Notion / Apple Health**) лучше сделать **FAB accent system** — когда кнопка **адаптируется к текущей категории** и имеет собственную шкалу оттенков.

Я покажу **архитектуру**, которая идеально подходит для **Next.js + React + OKLCH + auto dark/light**.

---

# FAB Accent System

## 1. Основной принцип

FAB использует **accent-цвет активной категории**.

Например:

| Категория | FAB цвет           |
| --------- | ------------------ |
| food      | теплый оранжевый   |
| workout   | энергичный красный |
| finance   | изумруд            |
| water     | голубой            |
| sleep     | индиго             |
| mood      | фиолетовый         |
| books     | янтарный           |
| recipes   | коралловый         |
| habits    | лаймовый           |
| goals     | синий              |
| logs      | серый              |

---

# 2. OKLCH токены FAB

```
fab.primary
fab.hover
fab.active
fab.surface
fab.text
fab.shadow
```

---

# 3. Пример системы

```ts
export const fabAccent = {
  food: {
    light: {
      primary: "oklch(70% 0.18 50)",
      hover: "oklch(65% 0.18 50)",
      active: "oklch(60% 0.18 50)",
      text: "oklch(100% 0 0)",
      shadow: "oklch(50% 0.10 50 / .35)",
    },
    dark: {
      primary: "oklch(75% 0.18 50)",
      hover: "oklch(70% 0.18 50)",
      active: "oklch(65% 0.18 50)",
      text: "oklch(20% 0 0)",
      shadow: "oklch(0% 0 0 / .6)",
    },
  },
}
```

---

# 4. React FAB компонент

```tsx
export function FAB({ category }) {
  const theme = useTheme()

  const color = fabAccent[category][theme]

  return (
    <button
      style={{
        background: color.primary,
        color: color.text,
        boxShadow: `0 8px 24px ${color.shadow}`,
      }}
      className="fab"
    >
      +
    </button>
  )
}
```

---

# 5. Современная анимация FAB

Добавь micro-interaction:

```
scale: 1 → 1.06
shadow: stronger
```

CSS:

```css
.fab {
  transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.fab:hover {
  transform: scale(1.06);
}
```

---

# 6. Smart FAB (очень крутая UX функция)

FAB автоматически меняет цвет:

```
Finance screen → green
Workout screen → red
Food log → orange
```

```
currentCategory → FAB accent
```

---

# 7. Extended FAB system

Можно добавить **варианты**:

```
fab.primary
fab.secondary
fab.ghost
fab.danger
```

Danger:

```
oklch(62% 0.23 27)
```

---

# 8. FAB для dark mode

Правило:

```
dark mode = ↑ lightness
```

пример

```
light  L 65
dark   L 75
```

---

# 9. Идеальная архитектура

```
/theme
   colors.ts
   categories.ts
   fab.ts
   charts.ts
   surfaces.ts
```
