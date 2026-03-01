# 🔍 Аудит кода: Ошибки и Неиспользуемый код

**Дата аудита:** 2026-03-01  
**Проект:** Life OS  
**Режим:**Architect

---

## 📊 Резюме

| Категория                       | Количество     |
| ------------------------------- | -------------- |
| Пустые/мусорные файлы           | 1              |
| Debug console.log в продакшене  | ~15+           |
| alert() вместо toast            | 10             |
| Неиспользуемый Supabase код     | Модуль целиком |
| Шаблонные файлы Storybook       | 8+ файлов      |
| Потенциальные типоквые проблемы | 2              |

---

## 🚨 Критические проблемы

### 1. Пустой файл в корне проекта

**Файл:** `console.log(k))`  
**Проблема:** Пустой файл с некорректным именем  
**Решение:** Удалить файл

```bash
# Рекомендуемая команда
rm "console.log(k))"
```

---

## ⚠️ Средние проблемы

### 2. Debug console.log в продакшен коде

Множественные `console.log` и `console.warn` которые должны быть удалены или заменены на условную отладку:

**src/lib/db/index.ts:**

- Строка 200: `console.log('[DB v11] Updated...')`
- Строка 228: `console.log('[DB v13] Removed...')`
- Строка 247: `console.log('[DB] Version change event...')`
- Строка 250: `console.log('[DB] Another connection...')`
- Строка 856: `console.log('Database initialized...')`

**src/components/reminder-notification.tsx:**

- Строка 54, 123-125, 130, 135, 139, 164, 174: Множественные debug логи `[ReminderNotification]`

**src/app/[locale]/items/[type]/new/page.tsx:**

- Строка 529, 542-544: `console.log('[CategoryOptions]...')`

**Рекомендация:** Удалить все debug console.log или обернуть в `process.env.NODE_ENV !== 'production'`

---

### 3. Использование alert() вместо toast уведомлений

**Проблема:** 10 мест где используется `alert()` вместо более удобных toast уведомлений:

| Файл                                               | Строки            |
| -------------------------------------------------- | ----------------- |
| `src/components/water/water-reminder-settings.tsx` | 60                |
| `src/components/settings/export-manager.tsx`       | 91, 104, 188, 191 |
| `src/app/[locale]/templates/page.tsx`              | 321               |
| `src/app/[locale]/books/[id]/edit/page.tsx`        | 155, 276, 301     |
| `src/app/[locale]/books/new/page.tsx`              | 128, 210          |

ендация:\*\*\*\*Реком Заменить на существующую систему toast уведомлений (функция `showToast`)

. Supabase модуль не используется

\*\*П---

### 4уть:\*\* `src/lib/supabase/`

**Проблема:** Полный модуль синхронизации с Supabase реализован, но не используется, так как бэкенд не создан (см. memory-bank/progress.md)

**Файлы:**

- `src/lib/supabase/client.ts`
- `src/lib/supabase/index.ts`
- `src/lib/supabase/sync-service.ts`
- `src/lib/supabase/schema.sql`
- `src/lib/supabase/rls-policies.sql`

**Рекомендация:**

- Либо удалить неиспользуемый код
- Либо добавить комментарий `# eslint-disable` с пометкой TODO для будущей реализации

---

### 5. Шаблонные файлы Storybook

**Путь:** `src/stories/`  
**Проблема:** 8+ шаблонных файлов из Storybook starter kit которые не относятся к проекту

**Файлы:**

- `src/stories/Button.stories.ts`
- `src/stories/Button.tsx`
- `src/stories/Header.stories.ts`
- `src/stories/Header.tsx`
- `src/stories/Page.stories.ts`
- `src/stories/Page.tsx`
- `src/stories/*.css` (3 файла)
- `src/stories/Configure.mdx`
- `src/stories/assets/*` (множество картинок)

**Примечание:** Реальные stories находятся в `src/components/ui/*.stories.tsx`

**Рекомендация:** Удалить папку `src/stories/` если она не используется

---

### 6. Потенциальные типоквые проблемы

**src/components/reminder-notification.tsx:149-150:**

```typescript
const times = [reminder.time, ...((reminder as any).times || [])]
const maxCompletionsPerDay = 1 + ((reminder as any).times?.length || 0)
```

**Проблема:** Использование `as any` для доступа к свойству `times`  
**Рекомендация:** Добавить поле `times` в тип Reminder или использовать более безопасную типизацию

---

## ✅ Что хорошо

1. **Нет @ts-ignore / @ts-expect-error** - проект хорошо типизирован
2. **Нет TODO/FIXME комментариев** - нет отложенных задач в коде
3. **Хорошая структура** - понятная организация компонентов
4. **Barrel exports** - правильно настроены index файлы
5. **Zustand stores** - грамотно разделены по функционалу

---

## 📋 Рекомендуемые действия

### Высокий приоритет

1. ✅ Удалить пустой файл `console.log(k))`
2. ⬜ Удалить или закомментировать debug console.log
3. ⬜ Заменить alert() на showToast()

### Средний приоритет

4. ⬜ Удалить неиспользуемый Supabase код
5. ⬜ Удалить папку src/stories/
6. ⬜ Исправить `as any` в reminder-notification.tsx

### Низкий приоритет

7. ⬜ Добавить условные логи для отладки (NODE_ENV check)

---

## 📁 Файл отчета

Этот отчет сохранен в: `plans/code-audit-report.md`
