import { getSupabaseClient, type SyncStatus, type SyncState } from "./client"
import { db } from "@/lib/db"
import { create } from "zustand"
import { persist } from "zustand/middleware"

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

  // Push local changes to Supabase
  async pushToRemote(): Promise<void> {
    if (!this.userId) {
      throw new Error("User not authenticated")
    }

    useSyncStore.getState().setStatus("syncing")

    try {
      for (const { local, remote } of SYNC_TABLES) {
        // Get unsynced items from syncQueue
        const unsyncedItems = await db.syncQueue
          .where("table_name")
          .equals(local)
          .and((item) => !item.synced)
          .toArray()

        if (unsyncedItems.length === 0) continue

        for (const item of unsyncedItems) {
          const table = this.supabase.from(remote)

          if (item.action === "create" || item.action === "update") {
            const data = transformForSupabase(item.data as Record<string, unknown>, this.userId)

            const { error } = await table.upsert(data, {
              onConflict: "id",
            })

            if (error) {
              // Skip if table doesn't exist
              if (error.code === "42P01" || error.message?.includes("does not exist")) {
                console.log(`Table ${remote} not found, skipping`)
                continue
              }
              console.error(`Failed to sync ${local}:`, error.message || error)
              continue
            }
          } else if (item.action === "delete") {
            const { error } = await table.delete().eq("id", item.record_id)

            if (error) {
              // Skip if table doesn't exist
              if (error.code === "42P01" || error.message?.includes("does not exist")) {
                continue
              }
              console.error(`Failed to delete from ${local}:`, error.message || error)
              continue
            }
          }

          // Mark as synced
          await db.syncQueue.update(item.id, { synced: true })
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

        // Upsert to local database
        for (const record of data) {
          const localData = transformForLocal(record)

          // Check if record exists locally
          const existing = await localTable.get(record.id)

          if (existing) {
            // Conflict resolution: last-write-wins
            const localUpdated = new Date(existing.updated_at).getTime()
            const remoteUpdated = new Date(record.updated_at).getTime()

            if (remoteUpdated > localUpdated) {
              await localTable.put(localData)
            }
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
