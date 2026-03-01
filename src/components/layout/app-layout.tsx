"use client"

import { ReactNode } from "react"
import { Header } from "./header"
import { BottomNav } from "./bottom-nav"
import { SideNav } from "./side-nav"
import { GlobalSearch } from "@/components/shared/global-search"
import { FAB } from "@/components/shared/fab"

interface AppLayoutProps {
  children: ReactNode
  title?: string
  showNav?: boolean
}

export function AppLayout({ children, title, showNav = true }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {/* Desktop Sidebar */}
      <SideNav />

      {/* Mobile Header */}
      <Header title={title} />

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-0 w-full max-w-[960px] md:max-w-none mx-auto px-2 md:px-8 pt-14 md:pt-4 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      {showNav && <BottomNav />}

      {/* Global Search (Cmd+K) */}
      <GlobalSearch />

      {/* Floating Action Button */}
      {showNav && <FAB />}
    </div>
  )
}
