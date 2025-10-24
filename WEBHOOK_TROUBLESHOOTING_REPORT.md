# 🔧 Google Sheets Webhook Integration - Technical Troubleshooting Report

**Date:** October 25, 2025  
**Engineer:** Claude (AI Assistant)  
**Issue:** Google Apps Script webhook authentication failure  
**Status:** ESCALATED TO LEAD ENGINEER  

---

## 📋 Executive Summary

The Accounting Buddy application is experiencing persistent authentication failures when attempting to send data to Google Sheets via Google Apps Script webhook. Despite multiple troubleshooting attempts and different authentication approaches, the webhook consistently returns "Unauthorized" responses.

## 🔍 Problem Description

### **Primary Error:**
```
Error Type: Console Error
Error Message: Unexpected response from Google Sheets webhook.
Location: handleSubmit (Next.js frontend)
```

### **Server-Side Logs:**
```
[SHEETS] Sending to webhook...
[SHEETS] Webhook response: Unauthorized
[SHEETS] Response is not JSON, parsing as text
[✖] Unexpected webhook response: Unauthorized
POST /api/sheets 500 in 4.5s
```

## 🧬 Root Cause Analysis

### **Primary Issue:**
Google Apps Script webhook is rejecting all authentication attempts, consistently returning "Unauthorized" regardless of authentication method used.

### **Potential Causes:**
1. **Apps Script Deployment Configuration Issues**
   - Incorrect execution permissions ("Execute as: Me" vs other options)
   - Wrong access permissions ("Anyone" vs "Anyone with Google account")
   - Deployment version not updating properly
   - Apps Script caching issues

2. **Authentication Method Incompatibility**
   - Google Apps Script may not properly support Authorization headers
   - Query parameter authentication may have URL encoding issues
   - Secret format incompatibility with Apps Script expectations

3. **Google Cloud Platform Issues**
   - Apps Script execution context limitations
   - CORS or cross-origin request restrictions
   - Google infrastructure-level authentication issues

## 🛠 Troubleshooting Steps Attempted

### **1. Environment Configuration**
✅ **Verified environment variables:**
- `SHEETS_WEBHOOK_URL`: Valid Google Apps Script deployment URL
- `SHEETS_WEBHOOK_SECRET`: 43-character Base64 secret properly generated

### **2. Authentication Method Changes**

#### **Attempt 1: Query Parameter Authentication**
```typescript
// Next.js API Route
const webhookUrl = `${SHEETS_WEBHOOK_URL}?secret=${SHEETS_WEBHOOK_SECRET}`;
```
```javascript
// Apps Script
const incomingSecret = e.parameter.secret;
```
**Result:** Unauthorized

#### **Attempt 2: URL-Encoded Query Parameters**
```typescript
// Next.js API Route  
const webhookUrl = `${SHEETS_WEBHOOK_URL}?secret=${encodeURIComponent(SHEETS_WEBHOOK_SECRET)}`;
```
```javascript
// Apps Script
const incomingSecret = decodeURIComponent(e.parameter.secret || '');
```
**Result:** Unauthorized

#### **Attempt 3: Authorization Header (Current)**
```typescript
// Next.js API Route
const response = await fetch(SHEETS_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SHEETS_WEBHOOK_SECRET}`,
  },
  body: JSON.stringify(normalizedData),
});
```
```javascript
// Apps Script
const authHeader = e.headers ? e.headers.Authorization : null;
const incomingSecret = authHeader ? authHeader.replace('Bearer ', '') : '';
```
**Result:** Unauthorized

### **3. Apps Script Testing**
- Multiple deployment attempts with "New version" option
- Verified deployment settings (Web app, Execute as: Me, Access: Anyone)
- Added comprehensive logging to Apps Script
- Created minimal test functions

### **4. Direct Testing**
- cURL tests directly to Apps Script endpoint
- All attempts resulted in HTML redirects or "Unauthorized" responses
- No successful authentication achieved through any method

## 📁 Files Modified

### **1. `/app/api/sheets/route.ts`**
**Current State:** Uses Authorization header authentication
**Key Changes:**
- Added `encodeURIComponent()` for URL parameter method (reverted)
- Switched to Authorization header approach
- Enhanced response parsing (JSON + text fallback)
- Improved error handling for authorization failures

### **2. `.env.local`**
**Current Configuration:**
```bash
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbzn3OH9kbJWJWX7hUd5GqoApeVUNFZzLYfLFVjEhGKf_2qXwHfX9pnImZV-I1n2X_M/exec
SHEETS_WEBHOOK_SECRET=VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=
```

### **3. Google Apps Script Code**
**Latest Version Provided:**
```javascript
function doGet(e) {
  return ContentService
    .createTextOutput("Apps Script is working - GET request received")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const secret = "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=";
    
    // Authorization header approach
    const authHeader = e.headers ? e.headers.Authorization : null;
    const incomingSecret = authHeader ? authHeader.replace('Bearer ', '') : '';
    
    console.log('Expected secret:', secret);
    console.log('Authorization header:', authHeader);
    console.log('Incoming secret:', incomingSecret);
    console.log('Secrets match:', incomingSecret === secret);
    
    if (incomingSecret !== secret) {
      console.error('Authentication failed - invalid or missing secret');
      return ContentService
        .createTextOutput("Unauthorized")
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    if (!e.postData || !e.postData.contents) {
      throw new Error('No POST data received');
    }
    
    const params = JSON.parse(e.postData.contents);
    console.log('Received data:', JSON.stringify(params));
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const dateStr = `${params.day}/${params.month}/${params.year}`;
    
    const rowData = [
      dateStr,
      params.property || '',
      params.typeOfOperation || '',
      params.typeOfPayment || '',
      params.detail || '',
      params.ref || '',
      params.debit || '',
      params.credit || ''
    ];
    
    sheet.appendRow(rowData);
    console.log('Data appended successfully:', rowData);
    
    return ContentService
      .createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('Apps Script Error:', error);
    return ContentService
      .createTextOutput("Error: " + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
```

## 🔬 Technical Evidence

### **1. Server Logs Show:**
- Next.js API successfully receives and validates data
- Webhook URL and secret are properly configured
- HTTP request is successfully sent to Google Apps Script
- Google Apps Script consistently returns "Unauthorized"

### **2. Network Behavior:**
- Direct cURL tests to Apps Script return HTML redirects
- No successful POST requests to Apps Script achieved
- GET requests return "Script function not found: doGet" initially

### **3. Authentication Verification:**
- Secret matches exactly between `.env.local` and Apps Script
- Multiple encoding/decoding approaches attempted
- Header and query parameter methods both fail

## 🎯 Recommended Next Steps for Lead Engineer

### **1. Google Apps Script Deployment Verification**
- Manually verify Apps Script deployment settings in Google Cloud Console
- Check execution logs in Apps Script Editor for actual incoming requests
- Verify deployment URL is correctly pointing to latest version

### **2. Alternative Authentication Approaches**
- **Option A:** Remove authentication entirely for testing
- **Option B:** Use Google Apps Script Web App with public access
- **Option C:** Implement Google OAuth2 flow instead of secret-based auth

### **3. Google Cloud Platform Investigation**
- Check if Google Apps Script has service restrictions
- Verify Google Workspace/Google Cloud account permissions
- Investigate if CORS policies are blocking requests

### **4. Debug Strategy**
```javascript
// Minimal Apps Script for debugging
function doPost(e) {
  console.log('Headers:', JSON.stringify(e.headers || {}));
  console.log('Parameters:', JSON.stringify(e.parameter || {}));
  console.log('Post Data:', e.postData ? e.postData.contents : 'No post data');
  
  return ContentService
    .createTextOutput("Debug: " + JSON.stringify({
      hasHeaders: !!e.headers,
      hasAuth: !!(e.headers && e.headers.Authorization),
      hasParams: !!e.parameter,
      hasSecret: !!(e.parameter && e.parameter.secret),
      hasPostData: !!(e.postData && e.postData.contents)
    }))
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## 🚨 Critical Information

### **Working Components:**
✅ Google Cloud Vision API (OCR) - Fully functional  
✅ OpenAI API (Data extraction) - Fully functional  
✅ Next.js application - All routes working  
✅ Environment configuration - Properly loaded  

### **Failing Component:**
❌ Google Apps Script webhook - Authentication failure

### **Impact:**
- Users cannot save extracted data to Google Sheets
- Manual data entry required as workaround
- Core application functionality blocked

## 📊 System Status

| Component | Status | Notes |
|-----------|--------|-------|
| OCR API | ✅ Working | Google Vision API authenticated |
| AI Extraction | ✅ Working | OpenAI GPT-4o processing receipts |
| Next.js Server | ✅ Working | All APIs functional except sheets |
| Google Sheets Webhook | ❌ Failing | Persistent authentication issues |
| Frontend UI | ✅ Working | Full receipt processing flow |

---

**RECOMMENDATION:** Focus investigation on Google Apps Script deployment configuration and consider alternative integration methods if current approach proves incompatible with Google's infrastructure limitations.