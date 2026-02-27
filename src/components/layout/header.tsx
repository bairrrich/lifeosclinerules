"use client"

import Link from "next/link"
import { Menu, Settings } from "@/lib/icons"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title?: string
  showMenu?: boolean
  onMenuClick?: () => void
}

export function Header({ title = "Life OS", showMenu = false, onMenuClick }: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top px-2 overflow-x-hidden">
      <header className="w-full max-w-[960px] border border-border rounded-b-2xl border-t-0 overflow-x-hidden">
        <div className="flex h-14 items-center px-4 overflow-x-hidden">
          {/* Left section */}
          <div className="flex items-center gap-2 w-24">
            {showMenu && (
              <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Открыть меню</span>
              </Button>
            )}
          </div>

          {/* Center section - title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          {/* Right section - settings icon */}
          <div className="flex items-center gap-2 w-24 justify-end">
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Настройки</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </div>
  )
}
