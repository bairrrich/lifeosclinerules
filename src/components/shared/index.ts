/**
 * Баррель-экспорт переиспользуемых компонентов
 */

// Form components
export * from "./forms"

// Standalone components
export { CrudManager } from "./crud-manager"
export type { CrudManagerProps } from "./crud-manager"

export { StatsGrid } from "./stats-grid"
export type { StatsGridProps, StatItem } from "./stats-grid"

export { ConfirmationDialog } from "./confirmation-dialog"
export type { ConfirmationDialogProps } from "./confirmation-dialog"

export { EmptyState } from "./empty-state"
export type { EmptyStateProps } from "./empty-state"

export { LoadingState } from "./loading-state"
export type { LoadingStateProps } from "./loading-state"

export { EntityTranslations } from "./entity-translations"
export type { EntityTranslationsProps } from "./entity-translations"
