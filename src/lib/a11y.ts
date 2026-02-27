/**
 * Accessibility utilities for Life OS
 */

/**
 * Generates a unique ID for form elements
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Creates props for an accessible label
 */
export function getLabelProps(id: string) {
  return {
    htmlFor: id,
  }
}

/**
 * Creates props for an accessible input
 */
export function getInputProps(
  id: string,
  label: string,
  options?: {
    required?: boolean
    describedBy?: string
    errorMessage?: string
  }
) {
  return {
    id,
    "aria-label": label,
    "aria-required": options?.required,
    "aria-describedby": options?.describedBy,
    "aria-invalid": !!options?.errorMessage,
  }
}

/**
 * Creates props for an accessible button
 */
export function getButtonProps(
  label: string,
  options?: {
    pressed?: boolean
    expanded?: boolean
    controls?: string
    describedBy?: string
  }
) {
  return {
    "aria-label": label,
    "aria-pressed": options?.pressed,
    "aria-expanded": options?.expanded,
    "aria-controls": options?.controls,
    "aria-describedby": options?.describedBy,
  }
}

/**
 * Creates props for an accessible dialog
 */
export function getDialogProps(titleId: string, descriptionId?: string) {
  return {
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
    "aria-describedby": descriptionId,
  }
}

/**
 * Focus trap for modals and dialogs
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  return Array.from(elements).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
  )
}

/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab") return

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus()
        event.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus()
        event.preventDefault()
      }
    }
  }

  container.addEventListener("keydown", handleKeyDown)
  firstElement?.focus()

  return () => {
    container.removeEventListener("keydown", handleKeyDown)
  }
}

/**
 * Announce message to screen readers
 */
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const announcer = document.createElement("div")
  announcer.setAttribute("aria-live", priority)
  announcer.setAttribute("aria-atomic", "true")
  announcer.setAttribute("class", "sr-only")
  document.body.appendChild(announcer)

  // Small delay to ensure the element is in the DOM
  setTimeout(() => {
    announcer.textContent = message
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }, 100)
}

/**
 * Screen reader only class
 */
export const srOnlyClass =
  "sr-only absolute -mx-1 -my-1 h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]"
