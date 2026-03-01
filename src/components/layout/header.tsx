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
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center md:hidden bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-gradient-to-b supports-[backdrop-filter]:from-background/95 supports-[backdrop-filter]:to-background/80 safe-top px-2 overflow-x-hidden">
      <header className="w-full max-w-[960px] border border-border/40 rounded-b-2xl overflow-x-hidden bg-background/50 backdrop-blur-sm">
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
          <div className="flex-1 flex justify-center px-2">
            <h1 className="text-lg font-bold truncate max-w-[180px] sm:max-w-none bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>

          {/* Right section - settings icon */}
          <div className="flex items-center gap-2 w-24 justify-end">
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 hover:text-primary transition-colors"
              >
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
