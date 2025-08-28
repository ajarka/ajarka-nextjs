# Sistem Notifikasi Otomatis - Mentor & Student

Dokumentasi lengkap untuk sistem notifikasi otomatis yang menginformasikan student ketika mentor mengedit atau menghapus jadwal availability slots.

## 🔔 Fitur Notifikasi

### **1. Update Availability Slot**
- **Trigger:** Ketika mentor mengedit jadwal availability
- **Target:** Semua student (prioritas berbeda)
- **Jenis:**
  - **Student dengan booking existing:** Notifikasi prioritas tinggi
  - **Student lainnya:** Notifikasi informasi biasa

### **2. Delete Availability Slot**  
- **Trigger:** Ketika mentor menghapus jadwal availability
- **Target:** Semua student (urgent untuk yang sudah booking)
- **Jenis:**
  - **Student dengan booking existing:** Notifikasi DARURAT
  - **Student lainnya:** Notifikasi informasi

### **3. Schedule Creation**
- **Trigger:** Ketika mentor membuat jadwal baru
- **Target:** Semua student
- **Jenis:** Notifikasi informasi tentang ketersediaan baru

### **4. Booking & Meeting Links**
- **Trigger:** Ketika student booking atau meeting link di-generate
- **Target:** Mentor dan student terkait
- **Jenis:** Notifikasi konfirmasi dan link meeting

## 📋 Tipe Notifikasi

| Tipe | Deskripsi | Prioritas | Target |
|------|-----------|-----------|---------|
| `availability_updated` | Jadwal mentor diperbarui | Medium/High | All students |
| `availability_deleted` | Jadwal mentor dihapus | **HIGH/URGENT** | All students |
| `schedule_created` | Jadwal baru dibuat | Normal | All students |
| `booking_created` | Booking baru dibuat | Medium | Mentor |
| `meeting_link_generated` | Link meeting siap | Medium | Both |

## 🚀 Implementasi Teknis

### **Enhanced NotificationService**
```typescript
// Update availability
await NotificationService.notifyAvailabilityUpdated(
  mentorId: string,
  mentorName: string, 
  scheduleId: string,
  scheduleTitle: string,
  oldSlot: { dayOfWeek, startTime, endTime },
  newSlot: { dayOfWeek, startTime, endTime }
)

// Delete availability
await NotificationService.notifyAvailabilityDeleted(
  mentorId: string,
  mentorName: string,
  scheduleId: string, 
  scheduleTitle: string,
  deletedSlot: { dayOfWeek, startTime, endTime }
)
```

### **Automatic Integration**
- **Mentor Schedule Manager:** Otomatis trigger notifikasi saat update/delete
- **Calendar Component:** Visual feedback tentang notifikasi yang akan dikirim
- **Error Handling:** Graceful fallback jika notifikasi gagal
- **Logging:** Comprehensive logging untuk debugging

## 🎯 User Experience

### **Untuk Mentor**
1. **Visual Feedback:** Dialog menunjukkan bahwa notifikasi akan dikirim
2. **Warning Messages:** Peringatan khusus untuk aksi delete
3. **Non-blocking:** Proses tetap lanjut meski notifikasi gagal
4. **Clear Indication:** Ikon dan pesan yang jelas

### **Untuk Student**  
1. **Prioritized Notifications:** Student dengan booking existing mendapat prioritas
2. **Clear Messaging:** Pesan yang jelas tentang perubahan jadwal
3. **Actionable Info:** Informasi yang dapat ditindaklanjuti
4. **Urgency Levels:** Berbagai tingkat urgensi (normal, medium, high, urgent)

## 📱 Notifikasi Display

### **Notification Component**
- **Real-time Updates:** Auto-refresh notifikasi
- **Categorized Tabs:** All, Unread, Schedule, Booking
- **Priority Indicators:** Visual indicators untuk prioritas
- **Mark as Read:** Individual dan bulk mark as read
- **Rich Content:** Detailed information dan action buttons

### **Visual Indicators**
- 🟢 **Available/Created:** Hijau untuk ketersediaan baru
- 🟡 **Updated:** Kuning/orange untuk perubahan
- 🔴 **Deleted:** Merah untuk penghapusan (urgent)
- 🟣 **Meeting:** Purple untuk meeting links
- 🔵 **Booking:** Biru untuk booking activities

## 🧪 Testing & Quality Assurance

### **Test Pages Available**
1. **`/test-notifications`** - Comprehensive notification testing
2. **`/test-calendar`** - Calendar edit/delete functionality testing

### **Test Scenarios**
- ✅ Availability update notifications
- ✅ Availability delete notifications (urgent)
- ✅ Schedule creation notifications
- ✅ Booking notifications with meeting links
- ✅ Error handling and fallbacks
- ✅ Multiple user targeting
- ✅ Priority differentiation

## 💾 Database Schema

### **Notifications Table**
```json
{
  "id": "string",
  "recipientId": "string",
  "recipientType": "siswa|mentor|admin", 
  "senderId": "string",
  "senderType": "siswa|mentor|admin",
  "type": "availability_updated|availability_deleted|...",
  "title": "string",
  "message": "string", 
  "data": {
    "scheduleId": "string",
    "mentorName": "string",
    "scheduleTitle": "string", 
    "oldSlot": {...},
    "newSlot": {...},
    "affectsExistingBooking": boolean,
    "urgency": "normal|medium|high"
  },
  "read": boolean,
  "createdAt": "ISO string"
}
```

## 🔧 API Endpoints

### **Notification Management**
- `GET /notifications?recipientId=:id` - Get user notifications
- `GET /notifications?recipientId=:id&read=false` - Get unread count
- `POST /notifications` - Create new notification
- `PATCH /notifications/:id` - Mark as read
- `GET /bookings?scheduleId=:id` - Get affected bookings

### **Calendar Integration**
- `PUT /mentor_availability/:id` - Update with notifications
- `DELETE /mentor_availability/:id` - Delete with notifications
- `POST /mentor_schedules` - Create with notifications

## 🎛️ Configuration & Customization

### **Notification Settings**
- **Auto-send:** Enabled by default
- **Fallback Mode:** Continue operation if notifications fail
- **Batch Processing:** Efficient bulk notification sending
- **Rate Limiting:** Prevent notification spam

### **Message Templates**
- **Bahasa Indonesia:** Native language support
- **Dynamic Content:** Personalized messages
- **Rich Formatting:** HTML and markdown support
- **Urgency Levels:** Different templates for different priorities

## 🚨 Error Handling

### **Graceful Degradation**
1. **Primary Action Success:** Calendar updates always succeed
2. **Notification Failure:** Logged but doesn't block main action  
3. **Retry Mechanism:** Automatic retry for failed notifications
4. **User Feedback:** Clear indication of notification status

### **Monitoring & Logging**
- **Success Tracking:** Log successful notifications
- **Error Logging:** Detailed error information
- **Performance Metrics:** Notification delivery times
- **User Engagement:** Read rates and interactions

## 🔄 Future Enhancements

### **Planned Features**
- **Email Notifications:** Send email for urgent notifications
- **Push Notifications:** Browser/mobile push notifications  
- **SMS Integration:** Critical notifications via SMS
- **Notification Preferences:** User-configurable settings
- **Bulk Operations:** Mass availability changes
- **Notification Templates:** Customizable message templates

### **Advanced Features**
- **Smart Scheduling:** AI-powered notification timing
- **Conflict Detection:** Automatic booking conflict resolution
- **Integration APIs:** Third-party calendar integration
- **Analytics Dashboard:** Notification performance metrics

## 📞 Support & Troubleshooting

### **Common Issues**
1. **Notifications Not Appearing:** Check JSON server connection
2. **Wrong Recipients:** Verify user roles and IDs
3. **Missing Data:** Check notification data structure
4. **Performance Issues:** Monitor batch notification processing

### **Debug Tools**
- **Test Pages:** Use test pages for debugging
- **Console Logs:** Comprehensive logging throughout system
- **API Testing:** Direct API endpoint testing
- **Database Inspection:** Check notification records

---

## 🎉 Hasil Akhir

Sistem notifikasi sekarang **100% OTOMATIS** dan memberikan experience yang sangat baik untuk mentor dan student:

- ✅ **Otomatis:** Tidak perlu manual notification
- ✅ **Intelligent:** Prioritas berbeda untuk different scenarios  
- ✅ **Professional:** UI/UX yang clean dan user-friendly
- ✅ **Reliable:** Error handling dan fallback mechanisms
- ✅ **Comprehensive:** Complete coverage untuk semua mentor actions
- ✅ **Testable:** Built-in testing tools dan pages

**Student tidak akan pernah ketinggalan informasi tentang perubahan jadwal mentor lagi!** 🚀