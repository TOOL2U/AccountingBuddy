# Security Guide — Accounting Buddy

This document outlines security best practices, API key management, and data privacy considerations for Accounting Buddy.

---

## 🔐 Security Overview

**Security Principles:**
- ✅ API keys stored in environment variables (never in code)
- ✅ Webhook authentication with secret tokens
- ✅ HTTPS required for all external API calls
- ✅ Input validation and sanitization
- ✅ No sensitive data in error messages
- ✅ No client-side storage of API keys

**Threat Model:**
- **Protected Against:** Unauthorized webhook access, API key exposure, injection attacks
- **Not Protected Against:** Physical access to server, compromised API keys (user responsibility)

---

## 🔑 API Key Management

### **Required API Keys**

Accounting Buddy requires the following API keys:

1. **Google Cloud Vision API Key** (`GOOGLE_VISION_KEY`)
   - **Purpose:** OCR text extraction from receipt images
   - **Permissions:** Cloud Vision API access
   - **Cost:** Pay-per-use (see Google Cloud pricing)

2. **OpenAI API Key** (`OPENAI_API_KEY`)
   - **Purpose:** AI-powered structured data extraction
   - **Permissions:** GPT-4o model access
   - **Cost:** Pay-per-token (see OpenAI pricing)

3. **Google Sheets Webhook URL** (`SHEETS_WEBHOOK_URL`)
   - **Purpose:** Google Apps Script webhook endpoint
   - **Format:** `https://script.google.com/macros/s/{SCRIPT_ID}/exec`
   - **Security:** Must use HTTPS

4. **Google Sheets Webhook Secret** (`SHEETS_WEBHOOK_SECRET`)
   - **Purpose:** Authenticate requests to webhook
   - **Format:** Random 32+ character string
   - **Generation:** `openssl rand -base64 32`

### **API Key Storage Best Practices**

#### **Local Development**

1. **Never commit API keys to Git:**
   ```bash
   # .env.local is already in .gitignore
   # Always use .env.local for local development
   ```

2. **Use `.env.local` file:**
   ```bash
   # Copy template
   cp .env.example .env.local
   
   # Add your keys
   GOOGLE_VISION_KEY=your_google_vision_key_here
   OPENAI_API_KEY=your_openai_key_here
   SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   SHEETS_WEBHOOK_SECRET=your_generated_secret_here
   ```

3. **Verify `.env.local` is in `.gitignore`:**
   ```bash
   # Check .gitignore contains:
   .env*.local
   .env.local
   ```

4. **Never share `.env.local` file:**
   - Do not email, Slack, or share via any communication channel
   - Do not commit to version control
   - Do not store in cloud storage without encryption

#### **Production Deployment (Vercel)**

1. **Use Vercel Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add each variable individually
   - Select appropriate environment (Production, Preview, Development)

2. **Use Vercel CLI for secure deployment:**
   ```bash
   # Add environment variables via CLI
   vercel env add GOOGLE_VISION_KEY production
   vercel env add OPENAI_API_KEY production
   vercel env add SHEETS_WEBHOOK_URL production
   vercel env add SHEETS_WEBHOOK_SECRET production
   ```

3. **Never expose in client-side code:**
   - Only use `NEXT_PUBLIC_*` prefix for truly public variables
   - API keys should NEVER have `NEXT_PUBLIC_` prefix
   - All API calls should go through Next.js API routes (server-side)

### **API Key Rotation**

**When to Rotate API Keys:**
- Immediately if key is exposed or committed to Git
- Every 90 days as a best practice
- When team member with access leaves
- After security incident

**How to Rotate:**
1. Generate new API key from provider (Google Cloud, OpenAI)
2. Update environment variables in Vercel
3. Redeploy application
4. Verify new key works
5. Revoke old API key from provider

---

## 🔒 Webhook Security

### **Google Apps Script Webhook Authentication**

The webhook uses a shared secret for authentication to prevent unauthorized data submission.

#### **Setup Webhook Secret**

1. **Generate a secure secret:**
   ```bash
   # Generate 32-byte random string
   openssl rand -base64 32
   
   # Example output:
   # 8xK9mP2nQ5rT7vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8q
   ```

2. **Add secret to both locations:**
   - **Google Apps Script:** Update `const secret = "YOUR_SECRET_HERE";` in webhook code
   - **Environment Variables:** Add `SHEETS_WEBHOOK_SECRET=your_secret_here` to `.env.local` and Vercel

3. **Verify authentication:**
   - Webhook checks `x-webhook-secret` header in every request
   - Requests without valid secret are rejected with 401 Unauthorized

#### **Webhook Security Best Practices**

1. **Always use HTTPS:**
   - Google Apps Script webhooks use HTTPS by default
   - Never use HTTP for webhook URLs

2. **Validate webhook URL:**
   ```typescript
   // Webhook URL must start with https://
   if (!process.env.SHEETS_WEBHOOK_URL?.startsWith('https://')) {
     throw new Error('Webhook URL must use HTTPS');
   }
   ```

3. **Keep webhook URL private:**
   - Do not share webhook URL publicly
   - Do not commit to public repositories
   - Treat as sensitive as API keys

4. **Monitor webhook logs:**
   - Check Google Apps Script logs for unauthorized attempts
   - Set up alerts for failed authentication attempts

---

## 🛡️ Input Validation & Sanitization

### **File Upload Validation**

```typescript
// File type validation
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// File size validation
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  throw new Error('File too large');
}
```

### **Data Validation**

All data is validated before sending to Google Sheets:

```typescript
// Payload validation in /utils/validatePayload.ts
- Required fields checked
- Data types validated (string, number)
- Dropdown values normalized to canonical options
- Numeric fields sanitized (remove currency symbols, commas)
```

### **SQL Injection Prevention**

- **Not Applicable:** Application does not use SQL database
- **Future Consideration:** When adding database in Phase 2, use parameterized queries or ORM

### **XSS Prevention**

- **React Default Protection:** React escapes all user input by default
- **No `dangerouslySetInnerHTML`:** Application does not use this feature
- **Content Security Policy:** Consider adding CSP headers in Phase 2

---

## 🔍 Data Privacy

### **Data Collection**

**What Data is Collected:**
- Receipt images (temporarily processed, not stored)
- Extracted text from OCR
- Structured accounting data (10 fields)
- User comments (optional)

**What Data is NOT Collected:**
- User personal information (no authentication in Phase 1)
- IP addresses (not logged)
- Browser fingerprints
- Analytics data (unless Sentry is configured)

### **Data Storage**

**Local Development:**
- Receipt images: Not stored (processed in memory)
- Extracted data: Not stored (sent directly to Google Sheets)
- Vendor cache: Stored in browser localStorage (user's device only)

**Production:**
- Receipt images: Not stored (processed in memory, discarded after extraction)
- Extracted data: Stored in user's Google Sheet (user controls access)
- No database storage in Phase 1

### **Data Transmission**

**All data transmission uses HTTPS:**
- ✅ Google Cloud Vision API: HTTPS
- ✅ OpenAI API: HTTPS
- ✅ Google Apps Script Webhook: HTTPS
- ✅ Vercel deployment: HTTPS enforced

### **Third-Party Data Sharing**

**Data is shared with:**
1. **Google Cloud Vision API:** Receipt images for OCR processing
2. **OpenAI API:** Extracted text for structured data extraction
3. **Google Sheets:** Final structured data for storage

**Data is NOT shared with:**
- Analytics providers (unless user configures Sentry)
- Advertising networks
- Any other third parties

### **GDPR Compliance Considerations**

**For Phase 2 (when adding user accounts):**
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Implement data export functionality
- [ ] Implement data deletion functionality
- [ ] Add cookie consent banner (if using cookies)
- [ ] Document data retention policies

---

## 🚨 Rate Limiting

### **API Rate Limits**

**Google Cloud Vision API:**
- Default: 1,800 requests per minute
- Recommendation: Implement client-side rate limiting if processing many receipts
- Cost consideration: Each request costs money

**OpenAI API:**
- Default: Varies by account tier
- Recommendation: Monitor usage in OpenAI dashboard
- Cost consideration: Each token costs money

**Google Apps Script Webhook:**
- Default: 20,000 requests per day per script
- Recommendation: Should be sufficient for single-user application

### **Implementing Rate Limiting (Phase 2)**

For multi-user deployment, consider:
- Rate limiting per user (e.g., 100 receipts per day)
- Queue system for batch processing
- Caching to reduce API calls

---

## 🔧 Security Headers

### **Recommended Headers (Phase 2)**

Add security headers in `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

---

## 🐛 Error Handling & Logging

### **Error Messages**

**User-Facing Errors:**
- ✅ Generic, user-friendly messages
- ❌ No stack traces exposed
- ❌ No API keys or secrets in error messages
- ❌ No internal system details

**Example:**
```typescript
// Good ✅
throw new Error('Failed to process receipt. Please try again.');

// Bad ❌
throw new Error(`OpenAI API error: ${apiKey} invalid at ${endpoint}`);
```

### **Error Logging**

**Local Development:**
- Errors logged to console
- Full stack traces available for debugging

**Production:**
- Consider using Sentry or similar error tracking
- Configure `NEXT_PUBLIC_SENTRY_DSN` environment variable
- Ensure no sensitive data in error logs

---

## 🔐 Incident Response

### **If API Key is Compromised**

1. **Immediate Actions:**
   - Revoke compromised API key from provider immediately
   - Generate new API key
   - Update environment variables in Vercel
   - Redeploy application
   - Monitor API usage for unauthorized activity

2. **Investigation:**
   - Check Git history for accidental commits
   - Review access logs
   - Identify how key was exposed

3. **Prevention:**
   - Review security practices
   - Update team training
   - Implement additional safeguards

### **If Webhook is Compromised**

1. **Immediate Actions:**
   - Generate new webhook secret
   - Update Google Apps Script webhook code
   - Update environment variables
   - Redeploy application

2. **Investigation:**
   - Check Google Apps Script logs for unauthorized requests
   - Review Google Sheet for unauthorized data

3. **Prevention:**
   - Ensure webhook URL is not public
   - Consider adding IP whitelist in Phase 2

---

## ✅ Security Checklist

Before deploying to production:

- [ ] All API keys stored in environment variables
- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys committed to Git
- [ ] Webhook secret is strong (32+ characters)
- [ ] Webhook authentication is enabled
- [ ] All external API calls use HTTPS
- [ ] Input validation is implemented
- [ ] Error messages don't expose sensitive data
- [ ] File upload validation is working
- [ ] Dropdown validation prevents injection
- [ ] No `NEXT_PUBLIC_` prefix on sensitive variables
- [ ] Environment variables configured in Vercel
- [ ] Production deployment uses HTTPS

---

## 📞 Security Contact

**For security issues or questions:**
- **Email:** shaunducker1@gmail.com
- **GitHub:** @TOOL2U

**Please report security vulnerabilities privately before public disclosure.**

---

**Last Updated:** 2025-10-24  
**Version:** 1.0.0-final  
**Status:** Production-ready security guidelines

