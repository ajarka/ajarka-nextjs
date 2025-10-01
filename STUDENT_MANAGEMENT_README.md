# Student Management Feature - Ajarka Platform

## 📋 Overview

Fitur lengkap untuk mengelola siswa di platform Ajarka dengan **Convex DB** sebagai database backend. Termasuk fitur **bulk import** untuk menambahkan banyak siswa sekaligus menggunakan file CSV atau JSON.

---

## ✨ Features

### 1. **Single Student Registration**
- Form registrasi siswa individual
- Auto-generate password
- Field validation
- Avatar otomatis dengan initial nama
- Support untuk:
  - Basic info (email, password, name, phone)
  - Demographics (age, location)
  - Learning preferences (level, interests, study goals)

### 2. **Bulk Import (CSV/JSON)**
- Import multiple students sekaligus
- Download template CSV/JSON
- Real-time import progress
- Error handling dengan detail
- Success/Failed statistics

### 3. **User Management Dashboard**
- View semua users (Admin, Mentor, Student)
- Search by name/email
- Filter by role
- Statistics overview
- Delete user functionality

---

## 🚀 Quick Start

### Access URLs

**Admin Only Access:**

1. **Add Single Student:**
   ```
   http://localhost:3000/dashboard/tambah-siswa
   ```

2. **Add Single Mentor:**
   ```
   http://localhost:3000/dashboard/tambah-mentor
   ```

3. **User Management:**
   ```
   http://localhost:3000/dashboard/users
   ```

4. **Admin Dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

### Login Credentials (Admin)
```
Email: admin@ajarka.com
Password: admin123
```

---

## 📂 File Structure

```
src/
├── app/(dashboard)/dashboard/
│   ├── tambah-siswa/
│   │   └── page.tsx                    # Student registration page
│   ├── tambah-mentor/
│   │   └── page.tsx                    # Mentor registration page (existing)
│   └── users/
│       └── page.tsx                    # User management page
│
├── components/admin/
│   ├── add-student-form.tsx            # Student form component
│   ├── add-mentor-form.tsx             # Mentor form (existing)
│   └── user-management.tsx             # User list & management
│
└── convex/
    └── users.ts                        # Convex DB functions
```

---

## 💾 Database Schema (Convex)

### Users Table

```typescript
interface User {
  _id: Id<"users">
  email: string
  name: string
  password: string
  role: "admin" | "mentor" | "siswa"
  avatar?: string
  phone?: string
  provider?: string
  emailVerified?: boolean

  // Mentor fields
  bio?: string
  skills?: string[]
  rating?: number
  totalStudents?: number
  experienceYears?: number
  specialization?: string[]

  // Student fields
  level?: string
  interests?: string[]
  studyGoals?: string[]
  age?: number
  location?: string

  createdAt: string
  updatedAt: string
}
```

---

## 📥 Bulk Import Guide

### CSV Template Format

Download template dari halaman "Bulk Import" atau gunakan format ini:

```csv
email,password,name,phone,age,location,level,interests,studyGoals
student1@example.com,password123,John Doe,+6281234567890,25,Jakarta,Beginner,"Web Development|Mobile Development","Career Change|Skill Enhancement"
student2@example.com,password456,Jane Smith,+6281234567891,22,Bandung,Intermediate,"UI/UX Design|Frontend Development","Job Preparation|Personal Project"
```

**Important Notes:**
- Use pipe (`|`) separator for arrays (interests, studyGoals)
- Wrap arrays with quotes if they contain commas
- Required fields: email, password, name, phone
- Optional: age, location, level, interests, studyGoals

### JSON Template Format

```json
[
  {
    "email": "student1@example.com",
    "password": "password123",
    "name": "John Doe",
    "phone": "+6281234567890",
    "age": 25,
    "location": "Jakarta",
    "level": "Beginner",
    "interests": ["Web Development", "Mobile Development"],
    "studyGoals": ["Career Change", "Skill Enhancement"]
  }
]
```

---

## 🔐 Authentication Flow

### Student Registration by Admin

1. Admin logs in with admin credentials
2. Navigate to "Tambah Siswa"
3. Fill form or upload bulk file
4. System creates user in Convex DB with:
   - Hashed password (handled by NextAuth)
   - Auto-generated avatar
   - Default `emailVerified: false`
   - Role: `siswa`
5. Admin receives login credentials to share

### Student Login

1. Student uses credentials provided by admin
2. Login at `/login`
3. NextAuth validates against Convex DB
4. Redirects to student dashboard

---

## 🎨 UI/UX Features

### Professional Design Elements

1. **Tab Navigation:**
   - Single Student vs Bulk Import
   - Clean separation of concerns

2. **Real-time Feedback:**
   - Loading states
   - Success/Error messages
   - Progress indicators

3. **Template Downloads:**
   - One-click CSV/JSON template download
   - Clear format examples

4. **Import Results:**
   - Visual success/failure counts
   - Detailed error messages per row
   - Color-coded cards (green/red/yellow)

5. **User Management:**
   - Search functionality
   - Role-based filtering
   - User statistics cards
   - Quick delete with confirmation

---

## 🔧 Technical Implementation

### Convex Integration

All user operations use **Convex DB** via mutations and queries:

```typescript
// Create student
const createUser = useMutation(api.users.create)

// Get all users
const allUsers = useQuery(api.users.getAll)

// Delete user
const deleteUser = useMutation(api.users.remove)
```

### Key Functions

**Single Student Creation:**
```typescript
await createUser({
  email: formData.email,
  password: formData.password,
  role: 'siswa',
  name: formData.name,
  phone: formData.phone,
  level: formData.level,
  interests: formData.interests,
  studyGoals: formData.studyGoals,
  // ... other fields
})
```

**Bulk Import (CSV):**
```typescript
const handleCSVImport = async (file) => {
  const text = await file.text()
  const rows = text.split('\n').slice(1) // Skip header

  for (let row of rows) {
    const [email, password, name, ...] = row.split(',')
    await createUser({ email, password, name, role: 'siswa' })
  }
}
```

---

## 📊 Data Flow

```
Admin Dashboard
    ↓
[Tambah Siswa] or [Bulk Import]
    ↓
Form Validation
    ↓
Convex DB Mutation (api.users.create)
    ↓
Success Response
    ↓
User Created in Convex
    ↓
Credentials Displayed
```

---

## ✅ Testing Checklist

### Single Student Registration
- [ ] Form validation works
- [ ] Password generation works
- [ ] Can add interests and goals
- [ ] User created in Convex DB
- [ ] Can login with created credentials

### Bulk Import
- [ ] CSV template downloads correctly
- [ ] JSON template downloads correctly
- [ ] CSV import works with valid data
- [ ] JSON import works with valid data
- [ ] Error handling for duplicate emails
- [ ] Error handling for invalid data
- [ ] Import results display correctly

### User Management
- [ ] All users display correctly
- [ ] Search functionality works
- [ ] Role filter works
- [ ] Delete user works
- [ ] Statistics are accurate

---

## 🐛 Common Issues & Solutions

### Issue: "User already exists"
**Solution:** Check Convex DB for existing email, or use different email

### Issue: Bulk import fails
**Solution:**
- Verify CSV/JSON format matches template
- Check for special characters in data
- Ensure all required fields are present

### Issue: Cannot login after creation
**Solution:**
- Verify user was created in Convex
- Check password was not modified
- Ensure `emailVerified` status if required

---

## 🔮 Future Enhancements

1. **Email Verification Flow:**
   - Send verification email on creation
   - Auto-verify link

2. **Advanced Filters:**
   - By date created
   - By location
   - By level

3. **Export Users:**
   - Download all students as CSV
   - Filtered export

4. **Batch Operations:**
   - Bulk delete
   - Bulk email verification
   - Bulk password reset

5. **Analytics:**
   - Student growth charts
   - Registration trends
   - Demographics visualization

---

## 👨‍💻 Developer Notes

### Adding New Fields

1. Update Convex schema in `convex/schema.ts`
2. Update `users.ts` mutation args
3. Update form components
4. Update CSV/JSON templates

### Customization

**Change password generation length:**
```typescript
// In add-student-form.tsx
const generatePassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < 16; i++) { // Change 12 to 16
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  setFormData({ ...formData, password })
}
```

**Add new interest option:**
```typescript
const INTEREST_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'Your New Interest', // Add here
  // ...
]
```

---

## 📞 Support

For issues or questions:
- Check Convex dashboard for data verification
- Review console logs for detailed errors
- Test with minimal data first before bulk import

---

**Built with ❤️ using:**
- Next.js 15
- Convex DB
- TypeScript
- Tailwind CSS
- Shadcn/ui
