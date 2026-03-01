"use client"

import { useEffect } from "react"

export function DisableRightClick({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu on input, textarea, and contenteditable elements
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }
      e.preventDefault()
    }

    // Disable mouse wheel change for number inputs
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLInputElement
      if (target.tagName === "INPUT" && target.type === "number") {
        target.blur()
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("wheel", handleWheel, { passive: true, capture: true })

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("wheel", handleWheel, { capture: true })
    }
  }, [])

  return <>{children}</>
}
