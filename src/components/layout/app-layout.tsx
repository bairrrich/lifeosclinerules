"use client"

import { ReactNode } from "react"
import { Header } from "./header"
import { BottomNav } from "./bottom-nav"

interface AppLayoutProps {
  children: ReactNode
  title?: string
  showNav?: boolean
}

export function AppLayout({ children, title, showNav = true }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header title={title} />

      <main className="flex-1 pb-20 w-full max-w-[960px] mx-auto px-2 pt-14 overflow-x-hidden">
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  )
}
