# Fix: AlertDialog Module Not Found

## ❌ Error Yang Terjadi

```
Module not found: Can't resolve '@/components/ui/alert-dialog'
```

**Cause:** Komponen AlertDialog dari Shadcn UI belum diinstall.

---

## ✅ Solusi

### 1. Install AlertDialog Component

```bash
npx shadcn@latest add alert-dialog
```

**Output:**
```
✔ Checking registry.
✔ Installing dependencies.
✔ Created 1 file:
  - src/components/ui/alert-dialog.tsx
```

---

### 2. Verify Installation

**File Created:** `src/components/ui/alert-dialog.tsx`

**Exports Available:**
```typescript
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

---

### 3. Dependencies Installed

Shadcn CLI automatically installs required dependencies:
- `@radix-ui/react-alert-dialog` - Base component from Radix UI

---

## 📦 What is AlertDialog?

AlertDialog adalah komponen modal confirmation dari Radix UI yang di-wrap oleh Shadcn dengan styling Tailwind CSS.

**Features:**
- ✅ Accessible (ARIA compliant)
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Animations
- ✅ Customizable styling
- ✅ TypeScript support

---

## 🎨 Usage Example

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function DeleteConfirmation() {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## 🔧 Component Structure

```
AlertDialog (Root)
├─ AlertDialogPortal
│  ├─ AlertDialogOverlay (backdrop)
│  └─ AlertDialogContent
│     ├─ AlertDialogHeader
│     │  ├─ AlertDialogTitle
│     │  └─ AlertDialogDescription
│     └─ AlertDialogFooter
│        ├─ AlertDialogCancel
│        └─ AlertDialogAction
```

---

## 🎯 In User Management

**File:** `src/components/admin/user-management.tsx`

**Used For:**
- Delete user confirmation
- Display user details before deletion
- Prevent accidental deletions

**Features:**
```tsx
<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      {/* Warning Icon */}
      <div className="w-10 h-10 rounded-full bg-red-100">
        <AlertTriangle className="h-5 w-5 text-red-600" />
      </div>

      <AlertDialogTitle>Delete User</AlertDialogTitle>

      <AlertDialogDescription>
        Are you sure you want to delete this user?

        {/* User Preview Card */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p>Name: {userToDelete.name}</p>
          <p>Email: {userToDelete.email}</p>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleConfirmDelete}
        className="bg-red-600 hover:bg-red-700"
      >
        Delete User
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## ✅ Verification Steps

### 1. Check File Exists
```bash
ls -la src/components/ui/alert-dialog.tsx
```

**Expected Output:**
```
-rw-r--r-- 1 user group 3864 Oct 1 21:22 alert-dialog.tsx
```

### 2. Check Exports
```bash
grep "^export" src/components/ui/alert-dialog.tsx
```

**Expected Output:**
```typescript
export {
  AlertDialog,
  AlertDialogPortal,
  ...
}
```

### 3. Test Import
```typescript
import { AlertDialog } from "@/components/ui/alert-dialog"
// Should not throw error
```

### 4. Start Dev Server
```bash
npm run dev
```

**Expected:**
- ✅ No build errors
- ✅ Page loads successfully
- ✅ AlertDialog renders correctly

---

## 🚀 Testing the Fix

### 1. Navigate to User Management
```
http://localhost:3000/dashboard/users
```

### 2. Click Delete Button
- ✅ AlertDialog should open
- ✅ No "Module not found" error
- ✅ Dialog displays user info
- ✅ Cancel and Delete buttons work

### 3. Complete Delete Flow
- ✅ Click Delete User
- ✅ Loading toast appears
- ✅ Success toast shows
- ✅ User removed from list

---

## 📋 Troubleshooting

### Issue: Still getting "Module not found"

**Solution 1:** Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

**Solution 2:** Restart dev server
```bash
# Kill server (Ctrl+C)
npm run dev
```

**Solution 3:** Reinstall component
```bash
npx shadcn@latest add alert-dialog --overwrite
```

### Issue: Import error after installation

**Check:** Verify tsconfig paths
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Styling not working

**Check:** Tailwind config includes component
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/components/**/*.{ts,tsx}",
    // ...
  ]
}
```

---

## 🎉 Final Status

- ✅ AlertDialog component installed
- ✅ All exports verified
- ✅ No build errors
- ✅ User management page works
- ✅ Delete confirmation functional
- ✅ Toast notifications integrated
- ✅ Professional UI/UX

---

## 📚 Resources

- [Shadcn UI AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)
- [Radix UI AlertDialog](https://www.radix-ui.com/docs/primitives/components/alert-dialog)
- [Accessibility Guidelines](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)

---

**Fix Applied Successfully! ✅**
