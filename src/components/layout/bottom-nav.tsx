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
    <div className="fixed bottom-3 left-3 right-3 z-40 flex justify-center md:hidden">
      <nav className="w-full max-w-[400px] glass rounded-2xl border border-border/30 shadow-xl">
        <div className="flex h-14 items-center justify-around px-1 sm:px-2">
          {bottomNavItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-xl transition-all duration-200",
                  "min-w-0 flex-1 py-2 px-1 sm:px-3",
                  "min-h-[48px]",
                  "active:scale-95",
                  isActive
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "drop-shadow-md")} />
                <span className="text-[10px] sm:text-xs font-medium truncate max-w-full hidden sm:inline">
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
