# Telegram Unified Messaging - Quick Start Guide

## Overview
Your system now supports **two ways** to send Telegram messages:
1. **Bot API** - For users who started a chat with your bot
2. **MTProto (Phone)** - For sending to phone numbers directly

---

## Setup in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Telegram Bot API
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy your bot token
4. Add to `.env`:
```
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Step 3: Configure MTProto (for phone number messaging)
1. Go to https://my.telegram.org/auth
2. Login → API Development Tools → Create Application
3. Copy your `api_id` and `api_hash`
4. Add to `.env`:
```
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_ADMIN_PHONE=+919751579617
TELEGRAM_SESSION_STRING=
```

### Step 4: First-Time Authentication
```bash
node server.js
```
- You'll be prompted to enter a code (sent to your Telegram)
- Enter 2FA password if enabled
- Copy the printed session string
- Paste it into `.env` under `TELEGRAM_SESSION_STRING`
- Restart server

### Step 5: Test It!
```bash
node server.js
```
Your system is ready!

---

## How to Use

### Scenario 1: Send to User Who Started Bot Chat
```javascript
POST /api/sendTelegramMessage
{
  "receiver": {
    "chatId": "123456789"
  },
  "message": "Hello!",
  "userId": "user_id"
}
```
✅ Sent via **Bot API**

### Scenario 2: Send to Phone Number
```javascript
POST /api/sendTelegramMessage
{
  "receiver": {
    "phoneNumber": "+918144779725"
  },
  "message": "Hello!",
  "userId": "user_id"
}
```
✅ Sent via **MTProto**

### Scenario 3: Let System Decide
```javascript
// Register user with phone number
POST /api/register
{
  "username": "John",
  "email": "john@example.com",
  "password": "pass123",
  "phoneNumber": "+918144779725"
}

// Send message - system auto-detects best method
POST /api/sendTelegramMessage
{
  "receiver": {
    "chatId": null,              // No chat started
    "phoneNumber": "+918144779725"
  },
  "message": "Hello!",
  "userId": "user_id"
}
```
✅ Sent via **MTProto** (since no chatId)

---

## Real-World Example

**Admin sends notification to registered user:**

1. User registers with phone: `+918144779725`
2. User hasn't started bot chat yet
3. Admin wants to notify user
4. Frontend calls:
```javascript
const user = await fetch('/api/user/userId');
const payload = {
  receiver: {
    chatId: user.telegram_chat_id || null,
    phoneNumber: user.phone_number || null
  },
  message: "Welcome to UMP!",
  userId: user._id
};
await fetch('/api/sendTelegramMessage', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(payload)
});
```
5. Message delivered to user's Telegram!

---

## Frontend Changes

### Registration Form
Now includes phone number field:
```html
<input type="tel" id="phone-number" placeholder="+919751579617">
```

### Messages Page
Automatically uses phone number if available:
```javascript
await loadCurrentUser();  // Loads phone_number and telegram_chat_id

// System picks right method automatically
await sendMessage(platform, message, recipientInfo, container);
```

---

## Decision Logic

```
IF chatId exists:
  → Use Bot API (faster, more reliable)
ELSE IF phoneNumber exists:
  → Use MTProto (works even without bot chat)
ELSE:
  → Return error
```

---

## Testing Checklist

- [ ] Register user with phone number
- [ ] Send message (should use MTProto)
- [ ] Start bot chat, update chatId
- [ ] Send message (should use Bot API)
- [ ] Check logs confirm correct method
- [ ] Verify message delivery in Telegram

---

## Security Notes

⚠️ **Important:**
- MTProto uses your personal Telegram account
- Keep `TELEGRAM_SESSION_STRING` secret
- Never commit `.env` to git
- Use MTProto only for trusted operations
- Prefer Bot API when possible

---

## Troubleshooting

### "Telegram Client not initialized"
→ Check `TELEGRAM_SESSION_STRING` in `.env`

### "Either chatId or phoneNumber must be provided"
→ Ensure receiver object has at least one field

### "Invalid phone number"
→ Use format: `+[country_code][number]` (e.g., `+919751579617`)

### Authentication fails
→ Delete old session and re-authenticate

---

## File Structure

```
/models/User.js                    - Added phone_number, telegram_chat_id
/utils/telegramIntegration.js     - Unified send logic
/utils/telegramClientService.js   - MTProto wrapper
/server.js                         - New /api/sendTelegramMessage endpoint
/public/register.html              - Phone number input
/public/messages.html              - Auto-detects send method
```

---

## API Reference

### Send Message
**POST** `/api/sendTelegramMessage`

Request:
```json
{
  "receiver": {
    "chatId": "123456789",        // Optional
    "phoneNumber": "+918144779725" // Optional
  },
  "message": "Hello!",
  "userId": "user_id"              // Optional
}
```

Response:
```json
{
  "success": true,
  "method": "bot_api",  // or "mtproto"
  "data": { ... }
}
```

### Register User
**POST** `/api/register`
```json
{
  "username": "John",
  "email": "john@example.com",
  "password": "pass123",
  "phoneNumber": "+918144779725"  // Optional
}
```

### Update User
**PUT** `/api/user/:userId`
```json
{
  "phoneNumber": "+918144779725",
  "telegramChatId": "123456789"
}
```

---

## Need More Details?

See: `TELEGRAM_UNIFIED_INTEGRATION_GUIDE.txt` for complete documentation.

---

## Support

If you encounter issues:
1. Check server logs
2. Verify `.env` configuration
3. Test with direct API calls (curl/Postman)
4. Review authentication flow

Happy messaging! 🚀
