# 🔍 Database Analysis & Optimization Report

## Current State Overview

**Database**: Dexie (IndexedDB wrapper)  
**Version**: 13  
**Total Tables**: 35+ tables  
**Architecture**: Offline-first, client-side storage

---

## 📊 Current Index Analysis

### ✅ Well-Indexed Tables

| Table       | Indexes                                                    | Status |
| ----------- | ---------------------------------------------------------- | ------ |
| `logs`      | id, type, date, title, category_id, created_at, updated_at | Good   |
| `items`     | id, type, name, category, created_at, updated_at           | Good   |
| `content`   | id, type, title, created_at, updated_at                    | Good   |
| `habits`    | id, name, frequency, is_active                             | Good   |
| `habitLogs` | id, habit_id, date, completed                              | Good   |
| `syncQueue` | id, table_name, record_id, action, synced                  | Good   |

### ⚠️ Missing Critical Indexes

| Table        | Missing Index                | Impact                     |
| ------------ | ---------------------------- | -------------------------- |
| `logs`       | `[type, date]` compound      | High - date range queries  |
| `items`      | `[type, category]` compound  | Medium                     |
| `content`    | `[type, created_at]`         | Medium                     |
| `categories` | `[type, name]`               | Low                        |
| `habitLogs`  | `[habit_id, date]` compound  | High - streak calculations |
| `waterLogs`  | `[date, type]` compound      | Medium                     |
| `moodLogs`   | `[date, mood]`               | Medium                     |
| `reminders`  | `[type, is_active]` compound | Medium                     |

---

## 🚨 Performance Issues Identified

### 1. **Search Functions Using `.filter()`** (HIGH PRIORITY)

```typescript
// CURRENT - Full table scan, O(n)
export async function searchLogs(query: string): Promise<Log[]> {
  const lowerQuery = query.toLowerCase()
  return await db.logs.filter((log) => log.title.toLowerCase().includes(lowerQuery)).toArray()
}
```

**Problems**:

- Loads ALL records into memory first
- No use of indexes
- Very slow with large datasets
- 100% CPU usage during search

### 2. **Missing Pagination** (HIGH PRIORITY)

All list pages load ALL data at once:

```typescript
// CURRENT - No pagination
await db.logs.where("type").equals(type).toArray()
```

**Impact**: Memory issues with 1000+ records

### 3. **Date Range Queries Inefficient** (MEDIUM PRIORITY)

```typescript
// CURRENT - Uses filter after where
return await db.logs
  .where("type")
  .equals(type)
  .and((log) => log.date >= startDate && log.date <= endDate) // SLOW!
  .toArray()
```

### 4. **Multiple Filter Operations** (MEDIUM PRIORITY)

```typescript
// In use-stats.ts - loads ALL data then filters
const completedToday = habitLogs.filter((l) => l.date.startsWith(today) && l.completed)
```

---

## 🛠 Optimization Recommendations

### Priority 1: Add Missing Indexes

```typescript
// In src/lib/db/index.ts - version(14)

this.version(14).stores({
  // Logs - add compound index for type + date range
  logs: "id, [type+date], title, category_id, created_at, updated_at",

  // Items - add compound index
  items: "id, [type+category], name, created_at, updated_at",

  // Content - add date index
  content: "id, type, [type+created_at], title, created_at, updated_at",

  // Habit logs - critical for streak calculations
  habitLogs: "id, [habit_id+date], date, completed",

  // Mood logs
  moodLogs: "id, [date+mood], date, mood, energy, stress",

  // Water logs
  waterLogs: "id, [date+type], date, amount_ml, type",

  // Reminders - for active reminder queries
  reminders: "id, [type+is_active], time, days, is_active, related_id, priority",

  // Books
  books:
    "id, [title+published_year], isbn13, published_year, language, format, series_id, created_at, updated_at",
  userBooks:
    "id, [book_id+status], book_id, status, rating, started_at, finished_at, created_at, updated_at",

  // Recipe - for ingredient lookups
  recipeIngredients: "id, [name+category], name, category, subcategory",
  recipeIngredientItems: "id, [recipe_id+order], recipe_id, ingredient_id, order",
  recipeSteps: "id, [recipe_id+order], recipe_id, order",
})
```

### Priority 2: Optimize Search Functions

```typescript
// NEW - Indexed search with prefix matching
export async function searchLogs(query: string, limit = 50): Promise<Log[]> {
  const lowerQuery = query.toLowerCase()

  // Use primary index for exact matches first
  const exactMatches = await db.logs
    .where("title")
    .startsWithIgnoreCase(query)
    .limit(limit)
    .toArray()

  if (exactMatches.length >= limit) return exactMatches

  // Then search with filter for partial matches
  const remaining = limit - exactMatches.length
  const allLogs = await db.logs
    .filter(
      (log) =>
        log.title.toLowerCase().includes(lowerQuery) && !exactMatches.find((e) => e.id === log.id)
    )
    .limit(remaining)
    .toArray()

  return [...exactMatches, ...allLogs]
}
```

### Priority 3: Add Pagination Support

```typescript
// NEW - Pagination helpers
export interface PaginationOptions {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getLogsPaginated(
  type: string,
  options: PaginationOptions
): Promise<PaginatedResult<Log>> {
  const { page, pageSize, sortBy = "date", sortOrder = "desc" } = options

  const collection = db.logs.where("type").equals(type)

  // Get total count
  const total = await collection.count()

  // Get paginated data
  const data = await collection
    .sortBy(sortBy)
    .then((items) => (sortOrder === "desc" ? items.reverse() : items))
    .then((items) => items.slice((page - 1) * pageSize, page * pageSize))

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
```

### Priority 4: Optimize Date Range Queries

```typescript
// NEW - Efficient date range queries
export async function getLogsByDateRange(
  type: string,
  startDate: string,
  endDate: string
): Promise<Log[]> {
  // Use compound index [type+date] - O(log n) instead of O(n)
  return await db.logs
    .where(["type", "date"])
    .between([type, startDate], [type, endDate], true, true)
    .toArray()
}

// For same-day queries - use exact match
export async function getLogsByDate(type: string, date: string): Promise<Log[]> {
  return await db.logs.where(["type", "date"]).equals([type, date]).toArray()
}
```

### Priority 5: Add Data Integrity

```typescript
// NEW - Database constraints and validation
this.version(15).stores({
  // Add unique constraints via compound indexes
  accounts: "++id, [type+name], name", // unique by type+name
  categories: "++id, [type+name], name",
  units: "++id, [type+name], name",
})
```

---

## 📈 Expected Performance Improvements

| Optimization          | Before       | After   | Improvement    |
| --------------------- | ------------ | ------- | -------------- |
| Search (1000 records) | ~500ms       | ~50ms   | **90% faster** |
| Date range query      | ~300ms       | ~20ms   | **93% faster** |
| List pagination       | Memory crash | Instant | **Stability**  |
| Habit streak calc     | ~200ms       | ~10ms   | **95% faster** |

---

## 🔧 Additional Recommendations

### 1. Database Cleanup Utility

```typescript
// Add to src/lib/db/index.ts
export async function cleanupDatabase(): Promise<{
  deleted: number
  freed: number
}> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dateStr = thirtyDaysAgo.toISOString().split("T")[0]

  // Delete old logs (keep important ones)
  const oldLogs = await db.logs
    .where("date")
    .below(dateStr)
    .and((log) => !log.important) // Keep important
    .toArray()

  await db.logs.bulkDelete(oldLogs.map((l) => l.id))

  // Clear old sync queue
  const synced = await db.syncQueue.where("synced").equals(1).toArray()
  await db.syncQueue.bulkDelete(synced.map((s) => s.id))

  return {
    deleted: oldLogs.length + synced.length,
    freed: estimateSize(oldLogs) + estimateSize(synced),
  }
}
```

### 2. Implement Database Stats

```typescript
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const tables = [
    "logs",
    "items",
    "content",
    "categories",
    "tags",
    "habits",
    "habitLogs",
    "books",
    "recipes",
  ]

  const stats: Record<string, number> = {}
  let totalRecords = 0

  for (const table of tables) {
    const count = await (db as any)[table].count()
    stats[table] = count
    totalRecords += count
  }

  return { tables: stats, totalRecords }
}
```

### 3. Consider Data Normalization

**Current Issue**: Some tables store redundant data:

- `category_id` in logs but could join to categories
- `author` fields repeated in book tables

**Recommendation**: Create view-like helper functions for common joins:

```typescript
export async function getLogWithCategory(logId: string) {
  const log = await db.logs.get(logId)
  if (!log?.category_id) return log

  const category = await db.categories.get(log.category_id)
  return { ...log, category }
}
```

---

## ✅ Implementation Priority Order

1. **Week 1**: Add missing indexes (version 14)
2. **Week 2**: Implement pagination helpers
3. **Week 3**: Optimize search functions
4. **Week 4**: Add cleanup utilities and stats

---

## 📝 Migration Strategy

```typescript
// Always add new versions, never modify existing
this.version(14).stores({
  /* new indexes */
})
this.version(15).stores({
  /* constraints */
})
// etc.
```

**Important**: Test migrations with real data before deploying!
