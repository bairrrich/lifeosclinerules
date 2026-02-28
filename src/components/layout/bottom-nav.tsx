"use client"

import { usePathname } from "@/lib/navigation"
import { Link } from "@/lib/navigation"
import { bottomNavItems } from "@/lib/navigation-config"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations("navigation")

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-2">
      <nav className="w-full max-w-[960px] border border-border rounded-t-2xl border-b-0 bg-background safe-bottom">
        <div className="flex h-16 items-center justify-around px-1 sm:px-2">
          {bottomNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl transition-colors",
                  "min-w-0 flex-1 py-2 px-1 sm:px-3",
                  "min-h-[48px]",
                  "active:scale-95",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium truncate max-w-full">
                  {t(item.translationKey)}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
