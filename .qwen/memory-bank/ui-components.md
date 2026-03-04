# UI Component Standards - PageActions & Dialogs

## Component Locations

- **PageActions**: `src/components/shared/page-actions.tsx`
- **Dialogs**: `src/components/dialogs/` (individual files)

## Overview

Unified action buttons and dialog components used across all pages. Provides consistent styling, sizing, and behavior for all user interactions.

---

## PageActions Button Styles

### Page Variant (`variant="page"`)

Used for full page forms (create/edit pages).

| Button          | Mobile | Desktop | Icon      | Text         |
| --------------- | ------ | ------- | --------- | ------------ |
| **Delete**      | 44×44  | 44×44   | Trash2    | No           |
| **Cancel/Back** | 44×44  | 160×44  | ArrowLeft | Desktop only |
| **Save/Edit**   | 160×44 | 160×44  | Save      | Always       |

**Classes:**

- Cancel: `sm:w-[160px] w-[44px] h-[44px] hover:!bg-primary/10`
- Save/Edit: `w-[160px] h-[44px] hover:!bg-primary/10`
- Delete: `size="icon"`

### Dialog Variant (`variant="dialog"`)

Used for dialog modals (create/edit dialogs) in `src/components/dialogs/`.

| Button          | Mobile | Desktop | Icon      | Text   | Alignment |
| --------------- | ------ | ------- | --------- | ------ | --------- |
| **Delete**      | 44×44  | 44×44   | Trash2    | No     | Center    |
| **Cancel/Back** | 160×44 | 160×44  | ArrowLeft | Always | Center    |
| **Save/Edit**   | 160×44 | 160×44  | Save      | Always | Center    |

**Classes:**

- Container: `flex justify-center gap-2`
- Cancel: `w-[160px] h-[44px] hover:!bg-primary/10`
- Save/Edit: `w-[160px] h-[44px] hover:!bg-primary/10`
- Delete: `size="icon"`

**Note:** Dialogs in `src/components/dialogs/` use centered alignment on both mobile and desktop, with text always visible. Other dialogs in the app may use different alignment and text visibility.

---

## DeleteConfirmActions Component

Used for delete confirmation dialogs across all entities.

| Button     | Mobile | Desktop | Icon      | Text   | Alignment      |
| ---------- | ------ | ------- | --------- | ------ | -------------- |
| **Cancel** | 160×44 | 160×44  | ArrowLeft | Always | Center / Right |
| **Delete** | 160×44 | 160×44  | Trash2    | Always | Center / Right |

**Classes:**

- Container: `flex justify-center sm:justify-end gap-2`
- Buttons: `w-[160px] h-[44px] hover:!bg-primary/10`

---

## Dialog Component Standards

All dialog components follow unified styling:

### Dialog Width

- **Mobile**: `w-full max-w-sm` (320px)
- **Desktop**: `sm:max-w-md` (448px)

### Dialog Structure

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="w-full sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 py-2">{/* Form fields */}</div>

    <DialogFooter>
      <PageActions
        variant="dialog"
        onCancel={() => onOpenChange(false)}
        onSimpleSave={handleSave}
        isSaving={isLoading}
      />
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Dialog Files

All dialogs are in separate files under `src/components/dialogs/`:

| Dialog          | File                         | Usage              |
| --------------- | ---------------------------- | ------------------ |
| Quick Mood      | `quick-mood-dialog.tsx`      | FAB mood tracking  |
| Add Sleep       | `add-sleep-dialog.tsx`       | Sleep log creation |
| Add Measurement | `add-measurement-dialog.tsx` | Body measurement   |
| Add Habit       | `add-habit-dialog.tsx`       | Habit creation     |
| Add Goal        | `add-goal-dialog.tsx`        | Goal creation      |
| Add Reminder    | `add-reminder-dialog.tsx`    | Reminder creation  |

---

## Usage Examples

### Page Create/Edit Form

```tsx
<PageActions
  variant="page"
  onCancel={() => router.back()}
  onSimpleSave={handleSubmit(onSubmit)}
  isSaving={isLoading}
  isInForm={true}
/>
```

### Dialog Create/Edit

```tsx
<DialogFooter>
  <PageActions
    variant="dialog"
    onCancel={() => setIsDialogOpen(false)}
    onSimpleSave={handleSave}
    isSaving={isLoading}
  />
</DialogFooter>
```

### Delete Confirmation Dialog

```tsx
<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete entry?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DeleteConfirmActions
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Custom Dialog Component

```tsx
export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      // Save logic
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">{/* Form fields */}</div>

        <DialogFooter>
          <PageActions
            variant="dialog"
            onCancel={() => onOpenChange(false)}
            onSimpleSave={handleSave}
            isSaving={isSaving}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Key Styling Rules

1. **Height**: All buttons are `h-[44px]`
2. **Width**:
   - Save/Edit: Always `w-[160px]`
   - Cancel/Back: `w-[44px]` mobile, `w-[160px]` desktop (for page variant)
   - Delete: `size="icon"` (44×44)
3. **Hover**: All buttons use `hover:!bg-primary/10`
4. **Icons**: Always visible on all screen sizes
5. **Text**:
   - Save/Edit: Always visible
   - Cancel/Back (Dialog): Hidden on mobile (`hidden sm:inline`)
   - Cancel/Back (Page): Hidden on mobile (`hidden sm:inline`)
   - Delete: Never (icon only)
6. **Alignment**:
   - Page variant: Default (left)
   - Dialog variant: `justify-start` (left)
   - DeleteConfirmActions: `justify-center sm:justify-end`
7. **Dialog Width**:
   - Mobile: `w-full max-w-sm`
   - Desktop: `sm:max-w-md`

---

## Pages Using PageActions

### Create Pages

- ✅ `logs/[type]/new/page.tsx`
- ✅ `books/new/page.tsx`
- ✅ `items/[type]/new/page.tsx`

### Edit Pages

- ✅ `logs/[type]/[id]/edit/page.tsx`
- ✅ `books/[id]/edit/page.tsx`
- ✅ `recipes/[id]/edit/page.tsx`
- ✅ `items/[type]/[id]/edit/page.tsx`
- ✅ `content/[type]/[id]/edit/page.tsx`

### Detail Pages (Delete Dialogs)

- ✅ `logs/[type]/[id]/page.tsx`
- ✅ `books/[id]/page.tsx`
- ✅ `recipes/[id]/page.tsx`
- ✅ `items/[type]/[id]/page.tsx`

### Dialog Components

- ✅ `components/dialogs/quick-mood-dialog.tsx`
- ✅ `components/dialogs/add-sleep-dialog.tsx`
- ✅ `components/dialogs/add-measurement-dialog.tsx`
- ✅ `components/dialogs/add-habit-dialog.tsx`
- ✅ `components/dialogs/add-goal-dialog.tsx`
- ✅ `components/dialogs/add-reminder-dialog.tsx`

### Settings

- ✅ `settings/danger-zone.tsx` (Clear all data dialog)

---

## Toast Notifications

For settings actions (DangerZone), use toast notifications:

```tsx
const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

const showToast = (type: "success" | "error", message: string) => {
  setToast({ type, message })
  setTimeout(() => setToast(null), 3000)
}

// Usage
showToast("success", tCommon("success"))
```

Toast position: `fixed bottom-24 left-1/2 -translate-x-1/2 z-50`

---

## Deprecated Patterns

❌ **DO NOT USE:**

- Native `confirm()` dialogs (use Dialog + DeleteConfirmActions)
- Custom button groups in dialogs (use PageActions)
- `size="action-sm"` (removed)
- `justify-end` for dialog buttons (use `justify-start`)
- Adaptive width for Save/Edit buttons in dialogs (always 160px)
- Icon-only Save/Edit buttons on mobile (always show text)
- Custom DialogContent widths (use `w-full sm:max-w-md`)
- Inline dialog components (create separate files in `components/dialogs/`)

---

## Files to Update When Adding New Entity Pages

When creating new entity pages, update:

1. Import `PageActions` and `DeleteConfirmActions` from `@/components/shared/page-actions`
2. Replace custom button groups with `<PageActions variant="page" ... />` or `<PageActions variant="dialog" ... />`
3. Replace delete confirmation buttons with `<DeleteConfirmActions ... />`
4. Ensure all buttons use consistent classes: `w-[160px] h-[44px] hover:!bg-primary/10`
5. For new dialogs, create a separate file in `src/components/dialogs/`
6. Use `DialogContent className="w-full sm:max-w-md"` for consistent dialog width
