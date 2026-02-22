import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// Theme Store
// ============================================

interface ThemeState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'life-os-theme',
    }
  )
)

// ============================================
// Settings Store
// ============================================

interface SettingsState {
  language: string
  currency: string
  firstDayOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
  dateFormat: string
  notifications: boolean
  setLanguage: (language: string) => void
  setCurrency: (currency: string) => void
  setFirstDayOfWeek: (day: 0 | 1) => void
  setDateFormat: (format: string) => void
  setNotifications: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ru',
      currency: 'RUB',
      firstDayOfWeek: 1,
      dateFormat: 'dd.MM.yyyy',
      notifications: true,
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setFirstDayOfWeek: (day) => set({ firstDayOfWeek: day }),
      setDateFormat: (format) => set({ dateFormat: format }),
      setNotifications: (enabled) => set({ notifications: enabled }),
    }),
    {
      name: 'life-os-settings',
    }
  )
)

// ============================================
// Sync Store
// ============================================

interface SyncState {
  isOnline: boolean
  lastSync: string | null
  pendingChanges: number
  setOnline: (online: boolean) => void
  setLastSync: (date: string) => void
  setPendingChanges: (count: number) => void
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      isOnline: true,
      lastSync: null,
      pendingChanges: 0,
      setOnline: (online) => set({ isOnline: online }),
      setLastSync: (date) => set({ lastSync: date }),
      setPendingChanges: (count) => set({ pendingChanges: count }),
    }),
    {
      name: 'life-os-sync',
    }
  )
)

// ============================================
// UI Store
// ============================================

interface UIState {
  isLoading: boolean
  activeTab: string
  isSidebarOpen: boolean
  setLoading: (loading: boolean) => void
  setActiveTab: (tab: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  isLoading: false,
  activeTab: 'dashboard',
  isSidebarOpen: false,
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))