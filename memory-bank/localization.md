# Life OS Localization (i18n)

## Overview

Life OS supports **English** and **Russian** languages with automatic locale detection and user-selectable language preference.

## Configuration

### Default Locale

- **English (en)** - Default language
- **Russian (ru)** - Secondary language

### Files Structure

```
src/
├── i18n/
│   ├── index.ts          # Locale configuration (locales, defaultLocale)
│   └── request.ts        # Server-side locale detection
├── messages/
│   ├── en.json           # English translations
│   └── ru.json           # Russian translations
├── middleware.ts         # Locale detection middleware
├── lib/
│   ├── navigation.ts     # Localized navigation (Link, useRouter, etc.)
│   └── date-format.ts    # Date formatting utilities
└── app/
    └── [locale]/         # Locale-based routing
```

## Key Features

### 1. Language Switching

- Component: `src/components/settings/language-switcher.tsx`
- Location: Settings → General → Language
- Uses `router.replace(pathname, { locale })` to maintain current page

### 2. Translation Usage

```tsx
import { useTranslations } from "next-intl"

const t = useTranslations("books")
<t("title")>  // Renders localized text
```

### 3. Date Localization

```tsx
import { useLocale } from "next-intl"

const locale = useLocale()
new Date(date).toLocaleDateString(locale, options)
```

### 4. Navigation

```tsx
import { Link, useRouter, usePathname } from "@/lib/navigation"

;<Link href="/books">Books</Link>
router.push(pathname, { locale: newLocale })
```

## Translation Keys Structure

### Common Keys

- `common.*` - Shared UI elements (buttons, actions, labels)
- `navigation.*` - Navigation menu items
- `language.*` - Language selector labels

### Feature-Specific Keys

- `books.*` - Books section (forms, statuses, formats, quotes)
- `recipes.*` - Recipes section (ingredients, steps, nutrition)
- `logs.*` - Log entries (food, workout, finance types)
- `settings.*` - Settings page (tabs, managers, danger zone)
- `home.*` - Home page (widgets, stats, quick actions)
- `analytics.*` - Analytics charts and stats
- `habits.*`, `goals.*`, `reminders.*` - Habit/goal/reminder tracking
- `mood.*`, `sleep.*`, `body.*`, `water.*` - Health trackers
- `items.*` - Catalog items (vitamins, medicines, etc.)
- `fab.*` - Floating action button labels
- `finance.*` - Finance tracking (accounts, categories, recurring)

### Nested Structure Example

```json
{
  "books": {
    "title": "Books",
    "fields": {
      "title": "Title",
      "pages": "Pages"
    },
    "status": {
      "planned": "Planned",
      "reading": "Reading",
      "completed": "Completed"
    },
    "quotes": {
      "title": "Quotes",
      "noQuotes": "No saved quotes"
    }
  }
}
```

## Important Notes

### No Hardcoded Text

- All user-facing text must use translation keys
- Date/time formatting uses `useLocale()` hook
- No hardcoded "ru-RU" or "en-US" locale strings

### JSON Structure Rules

- No duplicate keys at any level
- Use nested objects instead of dot notation in keys
- Example: Use `"fields": { "pages": "Pages" }` NOT `"fields.pages": "Pages"`

### Adding New Translations

1. Add key to both `en.json` and `ru.json`
2. Use consistent naming convention (section.feature.key)
3. Keep English as the source of truth
4. Test in both languages before committing

## Testing

```bash
# Build and verify no missing keys
pnpm build

# Run dev server and switch languages
pnpm dev
# Navigate to Settings → Language → Switch language
# Verify all text updates correctly
```

## Common Issues & Solutions

### MISSING_MESSAGE Error

- **Cause**: Key doesn't exist in translation file
- **Solution**: Add key to both en.json and ru.json

### INSUFFICIENT_PATH Error

- **Cause**: Trying to translate an object instead of string
- **Solution**: Use full path like `t("section.key")` not `t("section")`

### Dates Not Localizing

- **Cause**: Hardcoded locale like `toLocaleDateString("ru-RU")`
- **Solution**: Use `useLocale()` hook and `toLocaleDateString(locale)`

### Build Fails with JSON Error

- **Cause**: Duplicate keys or invalid JSON syntax
- **Solution**: Validate JSON and remove duplicates

## Related Files

- `/src/i18n/index.ts` - Locale configuration
- `/src/middleware.ts` - Locale detection
- `/src/components/settings/language-switcher.tsx` - Language selector
- `/src/lib/navigation.ts` - Localized navigation helpers
- `/src/lib/date-format.ts` - Date formatting utilities
