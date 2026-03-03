import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn(
      "Supabase not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    // Return a mock client that throws descriptive errors on usage
    return {
      from: () => ({
        select: () => Promise.reject(new Error("Supabase not configured")),
        insert: () => Promise.reject(new Error("Supabase not configured")),
        update: () => Promise.reject(new Error("Supabase not configured")),
        delete: () => Promise.reject(new Error("Supabase not configured")),
      }),
      auth: {
        getUser: () => Promise.reject(new Error("Supabase not configured")),
        signIn: () => Promise.reject(new Error("Supabase not configured")),
        signOut: () => Promise.reject(new Error("Supabase not configured")),
      },
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}

// Singleton instance
let client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    client = createClient()
  }
  return client
}

// Types for sync
export type SyncStatus = "idle" | "syncing" | "error" | "success"

export interface SyncState {
  status: SyncStatus
  lastSyncAt: string | null
  error: string | null
  pendingChanges: number
}
