# Ajarka Payment System API Specification

## Overview
Complete API specification for Ajarka's payment gateway integration with Midtrans, including transaction management, mentor payouts, and automated fee distribution.

## Architecture
- **Frontend:** Next.js 15 with TypeScript
- **Payment Gateway:** Midtrans (Snap API)
- **Backend (Future):** Go with database integration
- **Current:** JSON Server for development

## API Endpoints

### Payment Transactions

#### POST /payment_transactions
Create a new payment transaction
```json
{
  "id": "AJARKA-{timestamp}-{studentId}",
  "orderId": "AJARKA-{timestamp}-{studentId}",
  "studentId": number,
  "mentorId": number,
  "scheduleId": number,
  "sessionTitle": string,
  "amount": number,
  "mentorFee": number,
  "adminFee": number,
  "status": "pending" | "paid" | "failed" | "cancelled" | "expired",
  "paymentMethod": string,
  "midtransTransactionId": string,
  "midtransToken": string,
  "paidAt": string (ISO 8601),
  "expiredAt": string (ISO 8601),
  "bookingDetails": {
    "date": string,
    "time": string,
    "duration": number,
    "meetingType": "online" | "offline",
    "materials": string[],
    "notes": string
  },
  "createdAt": string (ISO 8601),
  "updatedAt": string (ISO 8601)
}
```

#### GET /payment_transactions
Get all transactions with optional filters
- Query params: `studentId`, `mentorId`, `status`, `startDate`, `endDate`

#### GET /payment_transactions/{transactionId}
Get specific transaction by ID

#### PATCH /payment_transactions/{transactionId}
Update transaction (used for payment notifications)

### Mentor Payouts

#### POST /mentor_payouts
Create monthly mentor payout
```json
{
  "id": "PAYOUT-{mentorId}-{YYYY-MM}",
  "mentorId": number,
  "mentorName": string,
  "month": string, // YYYY-MM format
  "totalSessions": number,
  "totalEarnings": number,
  "transactions": string[], // Array of transaction IDs
  "status": "pending" | "processing" | "paid" | "failed",
  "processedAt": string (ISO 8601),
  "transferDetails": {
    "bankName": string,
    "accountNumber": string,
    "accountName": string,
    "transferId": string
  },
  "createdAt": string (ISO 8601),
  "updatedAt": string (ISO 8601)
}
```

#### GET /mentor_payouts
Get all payouts with optional filters
- Query params: `mentorId`, `month`, `status`

#### PATCH /mentor_payouts/{payoutId}
Update payout status (process payment)

### Bookings

#### POST /bookings
Create booking after successful payment
```json
{
  "id": "BOOKING-{transactionId}",
  "studentId": number,
  "mentorId": number,
  "scheduleId": number,
  "transactionId": string,
  "sessionTitle": string,
  "date": string,
  "time": string,
  "duration": number,
  "meetingType": "online" | "offline",
  "materials": string[],
  "notes": string,
  "status": "confirmed" | "completed" | "cancelled",
  "meetingLink": string,
  "createdAt": string (ISO 8601),
  "updatedAt": string (ISO 8601)
}
```

## Midtrans Integration

### Payment Flow
1. **Create Transaction**
   - Frontend calls `/payment_transactions` with payment details
   - System generates unique order ID
   - Call Midtrans Snap API to get payment token
   - Return payment token to frontend

2. **Payment Page**
   - Frontend redirects to Midtrans Snap payment page
   - User completes payment with chosen method
   - Midtrans processes payment

3. **Payment Notification**
   - Midtrans sends webhook to `/webhook/payment`
   - System updates transaction status
   - If successful, create booking record
   - Send notifications to mentor and student

### Midtrans Snap API Integration
```javascript
// Create payment token
const parameter = {
  "transaction_details": {
    "order_id": orderId,
    "gross_amount": amount
  },
  "customer_details": {
    "first_name": studentName,
    "email": studentEmail,
    "phone": studentPhone
  },
  "item_details": [{
    "id": scheduleId,
    "price": amount,
    "quantity": 1,
    "name": sessionTitle
  }]
}

// Call Midtrans API
const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${btoa(SERVER_KEY + ':')}`
  },
  body: JSON.stringify(parameter)
})
```

### Webhook Handler
```javascript
// POST /webhook/payment
app.post('/webhook/payment', (req, res) => {
  const notification = req.body
  
  // Verify signature (security)
  const signature = crypto
    .createHash('sha512')
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest('hex')
  
  if (signature === notification.signature_key) {
    // Update transaction status
    updateTransactionStatus(notification)
    
    // Create booking if payment successful
    if (notification.transaction_status === 'settlement') {
      createBookingRecord(notification.order_id)
    }
  }
  
  res.status(200).send('OK')
})
```

## Fee Distribution Logic

### Automatic Calculation
- **Student pays:** Total session price (based on admin pricing rules)
- **Mentor receives:** 70% of session price (configurable)
- **Admin keeps:** 30% of session price (configurable)

### Monthly Payout Process
1. **Generate Payouts** (End of month)
   - Calculate total earnings per mentor
   - Group all paid transactions by mentor
   - Create payout records with status "pending"

2. **Process Payouts**
   - Admin reviews and approves payouts
   - Enter bank transfer details
   - Execute bank transfer (manual or automated)
   - Update payout status to "paid"

3. **Payout Tracking**
   - All payouts tracked with transfer details
   - Monthly reports for accounting
   - Mentor earnings statements

## Security Considerations

### Payment Security
- All amounts stored in smallest currency unit (cents/rupiah)
- Signature verification for all Midtrans webhooks
- SSL/TLS encryption for all API calls
- Transaction status validation

### Data Protection
- Bank details encrypted in database
- PCI DSS compliance for credit card processing
- Audit logs for all payment operations
- Secure API key management

## Error Handling

### Payment Failures
```json
{
  "error": "PAYMENT_FAILED",
  "message": "Payment could not be processed",
  "details": {
    "transaction_id": "AJARKA-123456",
    "status": "failed",
    "reason": "Insufficient funds"
  }
}
```

### Common Error Codes
- `PAYMENT_FAILED` - Payment processing failed
- `TRANSACTION_EXPIRED` - Payment window expired
- `INVALID_AMOUNT` - Amount validation failed
- `MENTOR_NOT_FOUND` - Invalid mentor ID
- `SCHEDULE_NOT_AVAILABLE` - Schedule no longer available

## Testing & Development

### Test Data
```javascript
// Test transactions
const testTransaction = {
  studentId: 3,
  mentorId: 2,
  amount: 200000,
  mentorFee: 140000,
  adminFee: 60000
}

// Test payout
const testPayout = {
  mentorId: 2,
  month: "2024-03",
  totalEarnings: 140000,
  totalSessions: 1
}
```

### Development URLs
- **Frontend:** `http://localhost:3002`
- **API:** `http://localhost:3001`
- **Midtrans Sandbox:** `https://app.sandbox.midtrans.com`

## Migration to Go Backend

### Required Tables
```sql
-- payment_transactions
CREATE TABLE payment_transactions (
  id VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE,
  student_id INT NOT NULL,
  mentor_id INT NOT NULL,
  schedule_id INT NOT NULL,
  session_title VARCHAR(255),
  amount INT NOT NULL,
  mentor_fee INT NOT NULL,
  admin_fee INT NOT NULL,
  status ENUM('pending', 'paid', 'failed', 'cancelled', 'expired'),
  payment_method VARCHAR(50),
  midtrans_transaction_id VARCHAR(100),
  midtrans_token VARCHAR(500),
  paid_at TIMESTAMP NULL,
  expired_at TIMESTAMP,
  booking_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- mentor_payouts
CREATE TABLE mentor_payouts (
  id VARCHAR(100) PRIMARY KEY,
  mentor_id INT NOT NULL,
  mentor_name VARCHAR(100),
  month VARCHAR(7), -- YYYY-MM
  total_sessions INT,
  total_earnings INT,
  transactions JSON, -- Array of transaction IDs
  status ENUM('pending', 'processing', 'paid', 'failed'),
  processed_at TIMESTAMP NULL,
  transfer_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- booking_records
CREATE TABLE bookings (
  id VARCHAR(100) PRIMARY KEY,
  student_id INT NOT NULL,
  mentor_id INT NOT NULL,
  schedule_id INT NOT NULL,
  transaction_id VARCHAR(100),
  session_title VARCHAR(255),
  booking_date DATE,
  booking_time TIME,
  duration INT,
  meeting_type ENUM('online', 'offline'),
  materials JSON,
  notes TEXT,
  status ENUM('confirmed', 'completed', 'cancelled'),
  meeting_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Go Implementation Notes
- Use Gin framework for REST API
- GORM for database operations
- Implement middleware for authentication/authorization
- Add request validation with go-playground/validator
- Implement proper logging and monitoring
- Use environment variables for sensitive configuration

This API specification is ready for backend implementation and provides a complete payment flow with Midtrans integration.