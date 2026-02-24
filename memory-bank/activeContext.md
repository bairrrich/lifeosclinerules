# 🔄 Active Context: Life OS

## Текущий фокус работы

**Приоритет 3 — PWA ЗАВЕРШЁН!** Проект готов к установке на устройство. Следующий приоритет — Синхронизация.

## Недавние изменения

### Реализовано (Приоритет 3 — PWA завершено)
- ✅ **Service Worker** — sw.js с кэшированием
- ✅ **Manifest.json** — иконки, метаданные, тема
- ✅ **Install Prompt** — PWAProvider с диалогом установки
- ✅ **Offline режим** — Cache First для статики, Network First для API
- ✅ **Иконки настроек** — перемещены в Header

## Следующие шаги

### Приоритет 4 — Синхронизация (СЛЕДУЮЩИЙ)
1. **API сервер** — backend на Node.js/Express или Next.js API Routes
2. **Sync queue** — механизм очереди синхронизации
3. **Conflict resolution** — last-write-wins стратегия
4. **Authentication** — авторизация пользователей

## Активные решения и соображения

### Архитектурные решения
- **Dexie вместо localStorage** — для структурированных данных и индексации
- **Zustand вместо Redux** — проще, меньше boilerplate
- **React Hook Form + Zod** — типобезопасные формы

### UI паттерны
- Все списки выглядят одинаково
- Все карточки имеют одинаковый header
- Все формы имеют одинаковую структуру
- Использовать rounded-2xl для карточек
- Border вместо heavy shadow

## Важные паттерны и предпочтения

### Именование
- Директории: kebab-case (например, `add-dialog.tsx`)
- Компоненты: PascalCase
- Функции: camelCase

### Структура страницы
```
Header
Search/Filter
List (Cards)
FAB (+)
```

### Структура форм
```
Section
Label
Input
Helper text
Divider
```

## Извлеченные уроки

1. **Унификация ускоряет разработку** — один шаблон для всех CRUD страниц
2. **Dexie упрощает работу с IndexedDB** — EntityTable дает типобезопасность
3. **Zustand persist** — удобно для настроек, сохраняется в localStorage