import { getSupabaseClient, type SyncStatus, type SyncState } from "./client"
import { db } from "@/lib/db"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  SYNC_BATCH_SIZE,
  SYNC_MAX_MEMORY_ITEMS,
  SYNC_CONFLICT_THRESHOLD,
  SYNC_MAX_RETRIES,
  SYNC_RETRY_DELAY_MS,
} from "@/lib/constants"

// Tables to sync
const SYNC_TABLES = [
  { local: "logs", remote: "logs" },
  { local: "items", remote: "items" },
  { local: "content", remote: "content" },
  { local: "goals", remote: "goals" },
  { local: "habits", remote: "habits" },
  { local: "habitLogs", remote: "habit_logs" },
  { local: "streaks", remote: "streaks" },
  { local: "sleepLogs", remote: "sleep_logs" },
  { local: "waterLogs", remote: "water_logs" },
  { local: "moodLogs", remote: "mood_logs" },
  { local: "bodyMeasurements", remote: "body_measurements" },
  { local: "reminders", remote: "reminders" },
  { local: "reminderLogs", remote: "reminder_logs" },
  { local: "templates", remote: "templates" },
  { local: "books", remote: "books" },
  { local: "userBooks", remote: "user_books" },
  { local: "authors", remote: "authors" },
  { local: "bookAuthors", remote: "book_authors" },
  { local: "series", remote: "series" },
  { local: "genres", remote: "genres" },
  { local: "bookGenres", remote: "book_genres" },
  { local: "bookQuotes", remote: "book_quotes" },
  { local: "bookReviews", remote: "book_reviews" },
  { local: "categories", remote: "categories" },
  { local: "units", remote: "units" },
  { local: "accounts", remote: "accounts" },
] as const

// Sync store
interface SyncStore {
  status: SyncStatus
  lastSyncAt: string | null
  error: string | null
  pendingChanges: number
  isConfigured: boolean
  setStatus: (status: SyncStatus) => void
  setLastSyncAt: (date: string | null) => void
  setError: (error: string | null) => void
  setPendingChanges: (count: number) => void
  setIsConfigured: (configured: boolean) => void
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      status: "idle",
      lastSyncAt: null,
      error: null,
      pendingChanges: 0,
      isConfigured: false,
      setStatus: (status) => set({ status }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
      setError: (error) => set({ error }),
      setPendingChanges: (pendingChanges) => set({ pendingChanges }),
      setIsConfigured: (isConfigured) => set({ isConfigured }),
    }),
    {
      name: "life-os-sync",
    }
  )
)

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && url !== "https://your-project.supabase.co")
}

// Transform local data for Supabase (add user_id, convert dates)
function transformForSupabase<T extends Record<string, unknown>>(
  data: T,
  userId: string
): Record<string, unknown> {
  const transformed: Record<string, unknown> = { ...data, user_id: userId }

  // Convert ISO strings to timestamps for Supabase
  if (data.date && typeof data.date === "string") {
    transformed.date = data.date
  }

  return transformed
}

// Transform Supabase data for local storage (remove user_id)
function transformForLocal<T extends Record<string, unknown>>(data: T): Record<string, unknown> {
  const { user_id, ...local } = data as Record<string, unknown> & { user_id?: string }
  return local
}

// Get current user from Supabase
async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Sync service class
export class SyncService {
  private supabase = getSupabaseClient()
  private userId: string | null = null

  async initialize(userId: string) {
    this.userId = userId
    useSyncStore.getState().setIsConfigured(true)
  }

  // Check if user is authenticated
  async checkAuth(): Promise<string | null> {
    const user = await getCurrentUser()
    if (user) {
      this.userId = user.id
      return user.id
    }
    return null
  }

  // Push local changes to Supabase with batch processing and offline retry
  async pushToRemote(): Promise<void> {
    if (!this.userId) {
      throw new Error("User not authenticated")
    }

    useSyncStore.getState().setStatus("syncing")

    try {
      for (const { local, remote } of SYNC_TABLES) {
        // Get unsynced items from syncQueue with batch limit
        const unsyncedItems = await db.syncQueue
          .where("table_name")
          .equals(local)
          .and((item) => !item.synced)
          .limit(SYNC_MAX_MEMORY_ITEMS)
          .toArray()

        if (unsyncedItems.length === 0) continue

        // Process in batches to avoid memory issues
        const batches = []
        for (let i = 0; i < unsyncedItems.length; i += SYNC_BATCH_SIZE) {
          batches.push(unsyncedItems.slice(i, i + SYNC_BATCH_SIZE))
        }

        for (const batch of batches) {
          await Promise.all(
            batch.map(async (item) => {
              const table = this.supabase.from(remote)

              if (item.action === "create" || item.action === "update") {
                if (!this.userId) return
                const data = transformForSupabase(item.data as Record<string, unknown>, this.userId)

                // Retry logic for network failures
                let lastError: Error | null = null
                for (let attempt = 0; attempt < SYNC_MAX_RETRIES; attempt++) {
                  try {
                    const { error } = await table.upsert(data, {
                      onConflict: "id",
                    })

                    if (error) {
                      // Skip if table doesn't exist
                      if (error.code === "42P01" || error.message?.includes("does not exist")) {
                        console.log(`Table ${remote} not found, skipping`)
                        break
                      }
                      throw new Error(error.message || `Sync failed for ${local}`)
                    }
                    break // Success
                  } catch (err) {
                    lastError = err instanceof Error ? err : new Error(String(err))
                    // Wait before retry (exponential backoff)
                    if (attempt < SYNC_MAX_RETRIES - 1) {
                      await new Promise((resolve) =>
                        setTimeout(resolve, SYNC_RETRY_DELAY_MS * Math.pow(2, attempt))
                      )
                    }
                  }
                }

                if (lastError) {
                  console.error(
                    `Failed to sync ${local} after ${SYNC_MAX_RETRIES} attempts:`,
                    lastError.message
                  )
                  return // Skip this item
                }
              } else if (item.action === "delete") {
                // Retry logic for delete operations
                let lastError: Error | null = null
                for (let attempt = 0; attempt < SYNC_MAX_RETRIES; attempt++) {
                  try {
                    const { error } = await table.delete().eq("id", item.record_id)

                    if (error) {
                      if (error.code === "42P01" || error.message?.includes("does not exist")) {
                        break
                      }
                      throw new Error(error.message || `Delete failed for ${local}`)
                    }
                    break // Success
                  } catch (err) {
                    lastError = err instanceof Error ? err : new Error(String(err))
                    if (attempt < SYNC_MAX_RETRIES - 1) {
                      await new Promise((resolve) =>
                        setTimeout(resolve, SYNC_RETRY_DELAY_MS * Math.pow(2, attempt))
                      )
                    }
                  }
                }

                if (lastError) {
                  console.error(
                    `Failed to delete from ${local} after ${SYNC_MAX_RETRIES} attempts:`,
                    lastError.message
                  )
                  return // Skip this item
                }
              }

              // Mark as synced
              await db.syncQueue.update(item.id, { synced: true })
            })
          )
        }
      }

      useSyncStore.getState().setLastSyncAt(new Date().toISOString())
      useSyncStore.getState().setError(null)
      useSyncStore.getState().setStatus("success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed"
      useSyncStore.getState().setError(message)
      useSyncStore.getState().setStatus("error")
      throw error
    }
  }

  // Pull remote changes from Supabase
  async pullFromRemote(): Promise<void> {
    if (!this.userId) {
      throw new Error("User not authenticated")
    }

    useSyncStore.getState().setStatus("syncing")

    try {
      const lastSync = useSyncStore.getState().lastSyncAt

      for (const { local, remote } of SYNC_TABLES) {
        let query = this.supabase.from(remote).select("*").eq("user_id", this.userId)

        // Only get records updated since last sync
        if (lastSync) {
          query = query.gt("updated_at", lastSync)
        }

        const { data, error } = await query

        if (error) {
          // Skip if table doesn't exist (error code 42P01)
          if (error.code === "42P01" || error.message?.includes("does not exist")) {
            console.log(`Table ${remote} not found, skipping`)
            continue
          }
          console.error(`Failed to pull from ${remote}:`, error.message || error)
          continue
        }

        if (!data || data.length === 0) continue

        // Get the Dexie table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const localTable = (db as any)[local]
        if (!localTable) continue

        // Upsert to local database with improved conflict resolution
        for (const record of data) {
          const localData = transformForLocal(record)

          // Check if record exists locally
          const existing = await localTable.get(record.id)

          if (existing) {
            // Improved conflict resolution: last-write-wins with local priority
            const localUpdated = new Date(existing.updated_at).getTime()
            const remoteUpdated = new Date(record.updated_at).getTime()
            const timeDiff = Math.abs(remoteUpdated - localUpdated)

            // If timestamps are very close (< SYNC_CONFLICT_THRESHOLD), prefer local version to avoid data loss
            if (timeDiff < SYNC_CONFLICT_THRESHOLD) {
              // Keep local version but update timestamp to prevent future conflicts
              await localTable.update(record.id, {
                ...existing,
                synced: true,
              })
            } else if (remoteUpdated > localUpdated) {
              // Remote is newer, use remote data
              await localTable.put(localData)
            }
            // Otherwise keep local version
          } else {
            await localTable.add(localData)
          }
        }
      }

      useSyncStore.getState().setLastSyncAt(new Date().toISOString())
      useSyncStore.getState().setError(null)
      useSyncStore.getState().setStatus("success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Pull failed"
      useSyncStore.getState().setError(message)
      useSyncStore.getState().setStatus("error")
      throw error
    }
  }

  // Full sync (bidirectional)
  async sync(): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      console.log("Supabase not configured, skipping sync")
      return { success: false, error: "Supabase не настроен" }
    }

    // Check if user is authenticated
    const userId = await this.checkAuth()
    if (!userId) {
      const error = "Необходимо войти в аккаунт для синхронизации"
      useSyncStore.getState().setError(error)
      useSyncStore.getState().setStatus("error")
      return { success: false, error }
    }

    try {
      // First push local changes
      await this.pushToRemote()

      // Then pull remote changes
      await this.pullFromRemote()

      // Update pending changes count
      const pending = await db.syncQueue.where("synced").equals(0).count()
      useSyncStore.getState().setPendingChanges(pending)

      return { success: true }
    } catch (error) {
      console.error("Sync failed:", error)
      throw error
    }
  }

  // Count pending changes
  async countPendingChanges(): Promise<number> {
    return await db.syncQueue.where("synced").equals(0).count()
  }

  // Clear sync queue
  async clearSyncQueue(): Promise<void> {
    await db.syncQueue.clear()
    useSyncStore.getState().setPendingChanges(0)
  }
}

// Singleton instance
let syncService: SyncService | null = null

export function getSyncService(): SyncService {
  if (!syncService) {
    syncService = new SyncService()
  }
  return syncService
}

// Hook for components
export function useSync() {
  const store = useSyncStore()
  const service = getSyncService()

  return {
    ...store,
    sync: () => service.sync(),
    pushToRemote: () => service.pushToRemote(),
    pullFromRemote: () => service.pullFromRemote(),
    countPendingChanges: () => service.countPendingChanges(),
    clearSyncQueue: () => service.clearSyncQueue(),
    initialize: (userId: string) => service.initialize(userId),
  }
}
