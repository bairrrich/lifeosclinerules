# UI Component Standards - PageActions

## Component Location

`src/components/shared/page-actions.tsx`

## Overview

Unified action buttons component used across all pages and dialogs in the application. Provides consistent styling, sizing, and behavior for Cancel, Save, Edit, and Delete actions.

## Button Styles

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

Used for dialog modals (create/edit dialogs).

| Button          | Mobile | Desktop | Icon      | Text         |
| --------------- | ------ | ------- | --------- | ------------ |
| **Delete**      | 44×44  | 44×44   | Trash2    | No           |
| **Cancel/Back** | 44×44  | 160×44  | ArrowLeft | Desktop only |
| **Save/Edit**   | 160×44 | 160×44  | Save      | Always       |

**Alignment:** `justify-start` (left-aligned for both mobile and desktop)

## DeleteConfirmActions Component

Used for delete confirmation dialogs across all entities.

| Button     | Mobile | Desktop | Icon      | Text   | Alignment                         |
| ---------- | ------ | ------- | --------- | ------ | --------------------------------- |
| **Cancel** | 160×44 | 160×44  | ArrowLeft | Always | Center (mobile) / Right (desktop) |
| **Delete** | 160×44 | 160×44  | Trash2    | Always | Center (mobile) / Right (desktop) |

**Classes:**

- Container: `flex justify-center sm:justify-end gap-2`
- Buttons: `w-[160px] h-[44px] hover:!bg-primary/10`

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
<PageActions
  variant="dialog"
  onCancel={() => setIsDialogOpen(false)}
  onSimpleSave={handleSave}
  isSaving={isLoading}
/>
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

### Dialog Forms

- ✅ `body/page.tsx` (Add/Edit measurement dialogs)
- ✅ `mood/page.tsx` (Add/Edit mood dialogs)
- ✅ `sleep/page.tsx` (Add/Edit sleep dialogs)
- ✅ `habits/page.tsx` (Add/Edit habit dialogs)
- ✅ `goals/page.tsx` (Add/Edit goal dialogs)
- ✅ `reminders/page.tsx` (Add/Edit reminder dialogs)
- ✅ `templates/page.tsx` (Create/Edit template dialogs)

### Settings

- ✅ `settings/danger-zone.tsx` (Clear all data dialog)

## Key Styling Rules

1. **Height**: All buttons are `h-[44px]`
2. **Width**:
   - Save/Edit: Always `w-[160px]`
   - Cancel/Back: `w-[44px]` mobile, `w-[160px]` desktop
   - Delete: `size="icon"` (44×44)
3. **Hover**: All buttons use `hover:!bg-primary/10`
4. **Icons**: Always visible on all screen sizes
5. **Text**:
   - Save/Edit: Always visible
   - Cancel/Back: Hidden on mobile (`hidden sm:inline`)
   - Delete: Never (icon only)
6. **Alignment**:
   - Page variant: Default (left)
   - Dialog variant: `justify-start` (left)
   - DeleteConfirmActions: `justify-center sm:justify-end`

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

## Deprecated Patterns

❌ **DO NOT USE:**

- Native `confirm()` dialogs (use Dialog + DeleteConfirmActions)
- Custom button styles (use PageActions classes)
- `size="action-sm"` (removed)
- `justify-end` for dialog buttons (use `justify-start`)
- Adaptive width for Save/Edit buttons (always 160px)
- Icon-only Save/Edit buttons on mobile (always show text)

## Files to Update When Adding New Entity Pages

When creating new entity pages, update:

1. Import `PageActions` and `DeleteConfirmActions` from `@/components/shared/page-actions`
2. Replace custom button groups with `<PageActions variant="page" ... />` or `<PageActions variant="dialog" ... />`
3. Replace delete confirmation buttons with `<DeleteConfirmActions ... />`
4. Ensure all buttons use consistent classes: `w-[160px] h-[44px] hover:!bg-primary/10`
