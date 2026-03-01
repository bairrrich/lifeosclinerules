# UI/UX Design System - Life OS

## Анализ текущего состояния

### Сильные стороны

- **Техническая база**: Tailwind CSS v4, Radix UI, OKLCH цветовая модель
- **Адаптивность**: Мобильная версия с bottom navigation, safe-area поддержка
- **Доступность**: ARIA-атрибуты, focus states, поддержка reduced-motion
- **PWA**: Манифест, иконки, установка на устройство
- **Тёмная тема**: Полная поддержка через CSS переменные

### Проблемы визуального стиля

1. **Плоский дизайн** - нет глубины и визуальной иерархии
2. **Ограниченная палитра** - только стандартные Tailwind цвета
3. **Нет современных эффектов** - отсутствует glassmorphism, градиенты
4. **Монотонная типографика** - только Inter, нет акцентных шрифтов
5. **Техничный вид** - компоненты выглядят как "коробки"
6. **Нет микро-анимаций** - интерфейс статичен
7. **Слабая визуальная иерархия** - элементы не выделяются друг от друга

---

## 1. Современная цветовая палитра

### Текущая палитра (оставить как основу)

```css
/* OKLCH - отлично, сохраняем */
--primary: oklch(0.208 0.042 265.755) /* Синий */ --secondary: oklch(0.968 0.007 247.896)
  /* Серый */ --accent: oklch(0.968 0.007 247.896) /* Серый */ --muted: oklch(0.968 0.007 247.896)
  /* Серый */;
```

### Рекомендуемые изменения

#### Акцентные цвета (добавить)

```css
/* Тёплые акценты - для позитивных действий */
--accent-warm: oklch(0.7 0.15 45) /* Оранжевый */ --accent-warm-light: oklch(0.85 0.12 45)
  /* Светлый оранжевый */ /* Природные акценты - для здоровья */
  --accent-nature: oklch(0.65 0.18 160) /* Зелёный */ --accent-nature-light: oklch(0.85 0.15 160)
  /* Светлый зелёный */ /* Энергия - для тренировок */ --accent-energy: oklch(0.6 0.18 280)
  /* Фиолетовый */ --accent-energy-light: oklch(0.8 0.15 280) /* Светлый фиолетовый */
  /* Вода - для гидратации */ --accent-water: oklch(0.7 0.16 220) /* Голубой */
  --accent-water-light: oklch(0.85 0.12 220) /* Светлый голубой */
  /* Успех - для завершённых действий */ --success: oklch(0.6 0.18 145) /* Ярко-зелёный */
  --success-light: oklch(0.85 0.12 145) /* Светлый успех */ /* Предупреждение */
  --warning: oklch(0.75 0.15 85) /* Жёлтый */ /* Опасность */ --danger: oklch(0.6 0.22 25)
  /* Красный */;
```

#### Градиенты для категорий

```css
/* Градиенты для категорий на главной */
--gradient-food: linear-gradient(135deg, oklch(0.7 0.15 45), oklch(0.6 0.2 30))
  --gradient-workout: linear-gradient(135deg, oklch(0.6 0.18 280), oklch(0.5 0.2 300))
  --gradient-finance: linear-gradient(135deg, oklch(0.65 0.18 160), oklch(0.55 0.2 180))
  --gradient-books: linear-gradient(135deg, oklch(0.7 0.15 60), oklch(0.6 0.18 45))
  --gradient-recipes: linear-gradient(135deg, oklch(0.65 0.2 20), oklch(0.55 0.22 350))
  --gradient-health: linear-gradient(135deg, oklch(0.7 0.16 220), oklch(0.6 0.18 260));
```

---

## 2. Типографика

### Текущее состояние

- **Основной шрифт**: Inter (хороший выбор для UI)
- **Проблемы**: Нет визуальной иерархии, ограниченные возможности для заголовков

### Рекомендации

#### Вариант А: Расширенная система Inter (простой)

```css
/* Добавить в Tailwind конфиг */
fontFamily: {
  'display': ['Inter', 'system-ui', 'sans-serif'],
  'body': ['Inter', 'system-ui', 'sans-serif'],
  'mono': ['JetBrains Mono', 'monospace'],
}

/* Типографика в CSS */
--text-display: 700 2.5rem/1.1 Inter
--text-h1: 700 2rem/1.2 Inter
--text-h2: 600 1.5rem/1.3 Inter
--text-h3: 600 1.25rem/1.4 Inter
--text-body: 400 1rem/1.5 Inter
--text-small: 400 0.875rem/1.5 Inter
--text-caption: 500 0.75rem/1.4 Inter
```

#### Вариант Б: Смешанная система (рекомендуемый)

```css
/* Акцентный шрифт для заголовков - Manrope */
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap");

fontFamily: {
  'display':['Manrope','Inter', 'sans-serif'],
  'body':
    [ "Inter",
    "system-ui",
    "sans-serif"];
}

/* В CSS переменных */
--font-display: "Manrope", sans-serif;
--font-body: "Inter", sans-serif;
```

#### Типографические стили

```css
/* Display - для больших заголовков на главной */
.text-display {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Heading 1 - основные заголовки страниц */
.text-h1 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* Heading 2 - секции */
.text-h2 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.3;
}

/* Body - основной текст */
.text-body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
}

/* Caption - подписи */
.text-caption {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1.4;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
```

---

## 3. Glassmorphism и система теней

### Glassmorphism эффекты

```css
/* Основной glass эффект */
.glass {
  background: oklch(1 0 0 / 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid oklch(1 0 0 / 0.1);
}

/* Тёмная версия */
.glass-dark {
  background: oklch(0.2 0.04 265 / 0.7);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid oklch(1 0 0 / 0.1);
}

/* Лёгкий glass для карточек */
.glass-light {
  background: oklch(1 0 0 / 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid oklch(0.95 0.01 265 / 0.1);
}

/* Gradient glass для акцентов */
.glass-gradient {
  background: linear-gradient(135deg, oklch(1 0 0 / 0.8), oklch(0.95 0.02 265 / 0.6));
  backdrop-filter: blur(16px);
  border: 1px solid oklch(1 0 0 / 0.15);
}
```

### Современная система теней

```css
/* Мягкие тени - рекомендуется */
--shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.07), 0 2px 4px -2px oklch(0 0 0 / 0.05);
--shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.08), 0 4px 6px -4px oklch(0 0 0 / 0.05);
--shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.05);

/* Цветные тени для акцентов */
--shadow-accent: 0 4px 14px oklch(0.6 0.15 265 / 0.25);
--shadow-warm: 0 4px 14px oklch(0.7 0.15 45 / 0.25);
--shadow-nature: 0 4px 14px oklch(0.65 0.18 160 / 0.25);
--shadow-water: 0 4px 14px oklch(0.7 0.16 220 / 0.25);

/* Glow эффекты */
--glow-primary: 0 0 20px oklch(0.5 0.15 265 / 0.3);
--glow-success: 0 0 20px oklch(0.6 0.18 145 / 0.3);
```

---

## 4. Улучшенные стили компонентов

### Card - улучшенный

```css
/* Современная карточка с глубиной */
.card {
  background: oklch(1 0 0 / 0.8);
  border-radius: 1rem;
  border: 1px solid oklch(0.95 0.01 265 / 0.1);
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-interactive {
  cursor: pointer;
}

.card-interactive:active {
  transform: scale(0.98);
}

/* Карточка с градиентной рамкой */
.card-gradient-border {
  position: relative;
  background: oklch(1 0 0 / 0.9);
  border-radius: 1rem;
}

.card-gradient-border::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  padding: 1px;
  background: linear-gradient(135deg, oklch(0.6 0.15 265), oklch(0.6 0.15 180));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### Button - улучшенный

```css
/* Основная кнопка с градиентом */
.btn-primary {
  background: linear-gradient(135deg, oklch(0.55 0.15 265), oklch(0.45 0.18 280));
  color: white;
  border-radius: 0.75rem;
  font-weight: 600;
  padding: 0.625rem 1.25rem;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  box-shadow: var(--shadow-lg), var(--glow-primary);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: scale(0.98);
}

/* Вторичная кнопка */
.btn-secondary {
  background: oklch(0.98 0.01 265 / 0.5);
  border: 1px solid oklch(0.9 0.02 265 / 0.2);
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: oklch(0.95 0.02 265 / 0.7);
  border-color: oklch(0.8 0.05 265 / 0.3);
}

/* Кнопка-чип */
.btn-chip {
  background: oklch(0.95 0.02 265 / 0.1);
  border-radius: 9999px;
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-chip:hover {
  background: oklch(0.9 0.03 265 / 0.2);
}

.btn-chip.active {
  background: oklch(0.55 0.15 265);
  color: white;
}
```

### Input - улучшенный

```css
/* Поле ввода с фокусом */
.input {
  background: oklch(0.99 0 0 / 0.5);
  border: 1.5px solid oklch(0.9 0.02 265 / 0.15);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: oklch(0.6 0.15 265);
  box-shadow: 0 0 0 3px oklch(0.55 0.15 265 / 0.15);
  outline: none;
  background: oklch(1 0 0 / 0.8);
}

/* Поле с иконкой */
.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-left: 2.75rem;
}

.input-with-icon .icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: oklch(0.6 0.05 265 / 0.5);
}
```

---

## 5. Анимации и микро-взаимодействия

### Основные анимации

```css
/* CSS переменные для анимаций */
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Появление с масштабированием */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in var(--duration-normal) var(--ease-default);
}

/* Появление с подъёмом */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up var(--duration-slow) var(--ease-default);
}

/* Пульсация */
@keyframes pulse-soft {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse-soft {
  animation: pulse-soft 2s var(--ease-default) infinite;
}

/* Блик для загрузки */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    oklch(0.95 0.01 265 / 0.1) 0%,
    oklch(0.95 0.01 265 / 0.2) 50%,
    oklch(0.95 0.01 265 / 0.1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Микро-взаимодействия

```css
/* Нажатие кнопки */
.btn:active {
  transform: scale(0.97);
  transition: transform var(--duration-fast) var(--ease-default);
}

/* Hover эффект на карточках */
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Фокус на элементах формы */
.input:focus,
.select:focus {
  border-color: oklch(0.6 0.15 265);
  box-shadow: 0 0 0 3px oklch(0.55 0.15 265 / 0.15);
}

/* Переключатель (toggle) */
.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background: oklch(0.9 0.02 265 / 0.2);
  border-radius: 9999px;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-default);
}

.toggle.active {
  background: oklch(0.6 0.15 265);
}

.toggle::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px oklch(0 0 0 / 0.2);
  transition: transform var(--duration-fast) var(--ease-default);
}

.toggle.active::after {
  transform: translateX(20px);
}

/* Checkbox анимация */
.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid oklch(0.7 0.05 265 / 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);
}

.checkbox.checked {
  background: oklch(0.6 0.15 265);
  border-color: oklch(0.6 0.15 265);
}

.checkbox.checked::after {
  content: "✓";
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  animation: check-pop var(--duration-fast) var(--ease-bounce);
}

@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

---

## 6. Улучшенная мобильная адаптация

### Bottom Navigation - улучшенный

```css
/* Современный bottom nav с glass эффектом */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: oklch(1 0 0 / 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid oklch(0.95 0.01 265 / 0.1);
  padding: 0.5rem;
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  z-index: 50;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all var(--duration-fast) var(--ease-default);
  min-width: 56px;
  min-height: 56px;
}

.bottom-nav-item:hover {
  background: oklch(0.95 0.01 265 / 0.1);
}

.bottom-nav-item.active {
  background: oklch(0.55 0.15 265 / 0.1);
  color: oklch(0.55 0.15 265);
}

.bottom-nav-item.active svg {
  filter: drop-shadow(0 0 8px oklch(0.5 0.15 265 / 0.3));
}

/* Floating nav - альтернатива */
.floating-nav {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: oklch(1 0 0 / 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid oklch(0.95 0.01 265 / 0.15);
  border-radius: 24px;
  padding: 0.5rem;
  box-shadow: var(--shadow-xl);
  display: flex;
  gap: 0.25rem;
}
```

### Header - улучшенный

```css
/* Header с gradient blur */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, oklch(1 0 0 / 0.95) 0%, oklch(1 0 0 / 0.85) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid oklch(0.95 0.01 265 / 0.08);
  z-index: 40;
  padding-top: env(safe-area-inset-top);
}
```

---

## 7. Визуальная иерархия и глубина

### Система слоёв

```css
/* Z-index масштаб */
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-modal-backdrop: 30;
--z-modal: 40;
--z-popover: 50;
--z-tooltip: 60;
--z-toast: 70;

/* Глубина фона */
.bg-depth-0 {
  background: oklch(1 0 0);
}
.bg-depth-1 {
  background: oklch(0.99 0 0 / 0.8);
}
.bg-depth-2 {
  background: oklch(0.98 0 0 / 0.6);
  backdrop-filter: blur(8px);
}

/* Границы-разделители */
.divider-subtle {
  border-bottom: 1px solid oklch(0.95 0.01 265 / 0.08);
}

.divider-medium {
  border-bottom: 1px solid oklch(0.9 0.02 265 / 0.15);
}
```

### Акценты и визуальное выделение

```css
/* Бейдж категории */
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-badge.food {
  background: oklch(0.7 0.15 45 / 0.15);
  color: oklch(0.6 0.18 45);
}

.category-badge.workout {
  background: oklch(0.6 0.18 280 / 0.15);
  color: oklch(0.5 0.2 280);
}

.category-badge.health {
  background: oklch(0.65 0.16 220 / 0.15);
  color: oklch(0.55 0.18 220);
}

/* Статус индикатор */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.success {
  background: oklch(0.6 0.18 145);
  box-shadow: 0 0 8px oklch(0.6 0.18 145 / 0.4);
}

.status-dot.warning {
  background: oklch(0.75 0.15 85);
  box-shadow: 0 0 8px oklch(0.75 0.15 85 / 0.4);
}

.status-dot.error {
  background: oklch(0.6 0.22 25);
  box-shadow: 0 0 8px oklch(0.6 0.22 25 / 0.4);
}
```

---

## 8. Состояния загрузки (Skeleton)

### Улучшенные скелетоны

```css
/* Базовый skeleton */
.skeleton {
  background: oklch(0.95 0.01 265 / 0.1);
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.1) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* Skeleton для текста */
.skeleton-text {
  height: 1em;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-text:last-child {
  width: 70%;
}

/* Skeleton для карточки */
.skeleton-card {
  background: oklch(1 0 0 / 0.5);
  border: 1px solid oklch(0.95 0.01 265 / 0.08);
  border-radius: 1rem;
  padding: 1rem;
}

/* Skeleton для аватара */
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
```

---

## 9. Глобальные CSS переменные (полный набор)

### Файл: src/app/[locale]/globals.css

```css
:root {
  /* === Цветовая палитра === */
  /* Основные цвета (OKLCH) */
  --color-primary: oklch(0.208 0.042 265.755);
  --color-primary-light: oklch(0.55 0.15 265);
  --color-primary-dark: oklch(0.15 0.03 265);

  --color-secondary: oklch(0.968 0.007 247.896);
  --color-secondary-foreground: oklch(0.208 0.042 265.755);

  --color-accent: oklch(0.968 0.007 247.896);
  --color-accent-foreground: oklch(0.208 0.042 265.755);

  --color-muted: oklch(0.968 0.007 247.896);
  --color-muted-foreground: oklch(0.554 0.046 257.417);

  /* Акцентные цвета */
  --color-warm: oklch(0.7 0.15 45);
  --color-warm-light: oklch(0.85 0.12 45);
  --color-nature: oklch(0.65 0.18 160);
  --color-nature-light: oklch(0.85 0.15 160);
  --color-energy: oklch(0.6 0.18 280);
  --color-energy-light: oklch(0.8 0.15 280);
  --color-water: oklch(0.7 0.16 220);
  --color-water-light: oklch(0.85 0.12 220);
  --color-success: oklch(0.6 0.18 145);
  --color-success-light: oklch(0.85 0.12 145);
  --color-warning: oklch(0.75 0.15 85);
  --color-danger: oklch(0.577 0.245 27.325);

  /* Градиенты */
  --gradient-primary: linear-gradient(135deg, oklch(0.55 0.15 265), oklch(0.45 0.18 280));
  --gradient-warm: linear-gradient(135deg, oklch(0.7 0.15 45), oklch(0.6 0.18 30));
  --gradient-nature: linear-gradient(135deg, oklch(0.65 0.18 160), oklch(0.55 0.2 180));
  --gradient-water: linear-gradient(135deg, oklch(0.7 0.16 220), oklch(0.6 0.18 260));

  /* === Типографика === */
  --font-display: "Manrope", "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* === Тени === */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.07), 0 2px 4px -2px oklch(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.08), 0 4px 6px -4px oklch(0 0 0 / 0.05);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.05);
  --shadow-glow: 0 0 20px oklch(0.5 0.15 265 / 0.3);

  /* === Анимации === */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* === Радиусы === */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}

/* Тёмная тема */
.dark {
  --color-primary: oklch(0.929 0.013 255.508);
  --color-primary-light: oklch(0.7 0.1 265);
  --color-primary-dark: oklch(0.3 0.05 265);

  --color-secondary: oklch(0.279 0.041 260.031);
  --color-secondary-foreground: oklch(0.984 0.003 247.858);

  --color-muted: oklch(0.279 0.041 260.031);
  --color-muted-foreground: oklch(0.704 0.04 256.788);

  /* Тень для тёмной темы */
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.3), 0 2px 4px -2px oklch(0 0 0 / 0.2);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.4), 0 4px 6px -4px oklch(0 0 0 / 0.25);
  --shadow-xl: 0 20px 25px -5px oklch(0 0 0 / 0.5), 0 8px 10px -6px oklch(0 0 0 / 0.3);
}
```

---

## 10. План внедрения

### Фаза 1: Основа (1-2 дня)

1. [ ] Обновить CSS переменные в `globals.css`
2. [ ] Добавить шрифт Manrope через Google Fonts
3. [ ] Создать классы для glass эффектов
4. [ ] Обновить систему теней

### Фаза 2: Компоненты (2-3 дня)

1. [ ] Обновить Button - добавить варианты с градиентом
2. [ ] Обновить Card - добавить hover эффекты
3. [ ] Обновить Input - улучшить фокус states
4. [ ] Обновить Dialog - добавить glass overlay
5. [ ] Обновить Tabs - современный вид

### Фаза 3: Layout (1-2 дня)

1. [ ] Обновить Header с gradient blur
2. [ ] Обновить BottomNav с glass эффектом
3. [ ] Добавить анимации появления страниц

### Фаза 4: Страницы (2-3 дня)

1. [ ] Обновить главную страницу -Dashboard
2. [ ] Добавить градиенты для категорий
3. [ ] Улучшить карточки привычек и целей
4. [ ] Обновить формы ввода

### Фаза 5: Полировка (1 день)

1. [ ] Добавить skeleton загрузки
2. [ ] Проверить анимации на performance
3. [ ] Тестировать на мобильных устройствах

---

## Резюме

Предложенная дизайн-система включает:

| Категория       | Изменения                                           |
| --------------- | --------------------------------------------------- |
| **Цвета**       | Расширенная OKLCH палитра + градиенты для категорий |
| **Типографика** | Manrope для заголовков + чёткая иерархия            |
| **Эффекты**     | Glassmorphism, мягкие тени, glow эффекты            |
| **Компоненты**  | Hover states, анимации, улучшенные states           |
| **Анимации**    | Smooth transitions, micro-interactions              |
| **Мобильные**   | Улучшенный bottom nav, safe areas                   |

Система сохраняет техническую базу (Tailwind, Radix UI) но значительно улучшает визуальный опыт, делая приложение современным и привлекательным.
