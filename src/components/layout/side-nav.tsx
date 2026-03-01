"use client"

import { usePathname } from "@/lib/navigation"
import { Link } from "@/lib/navigation"
import { bottomNavItems } from "@/lib/navigation-config"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Settings, Search } from "@/lib/icons"
import { Button } from "@/components/ui/button"

export function SideNav() {
  const pathname = usePathname()
  const t = useTranslations("navigation")

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border/40 bg-background/80 backdrop-blur-sm z-30">
      {/* Logo / Title */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border/40">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Life OS
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => document.dispatchEvent(new Event("open-global-search"))}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Поиск</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-md")} />
                  <span>{t(item.translationKey)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-border/40 p-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
            pathname === "/settings"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>{t("settings")}</span>
        </Link>
      </div>
    </aside>
  )
}
