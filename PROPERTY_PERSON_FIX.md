# Property/Person Endpoint Fix

**Date:** October 29, 2025  
**Issue:** 405 Method Not Allowed  
**Status:** ✅ **FIXED**

---

## 🐛 **Problem**

The Property/Person test in the admin panel was failing with a **405 Method Not Allowed** error:

```
POST /api/pnl/property-person 405 in 210ms
```

**Root Cause:**
- The endpoint only had a `GET` handler
- The admin panel test was sending a `POST` request
- HTTP 405 = Method Not Allowed

---

## ✅ **Solution**

Added a `POST` handler to `/api/pnl/property-person/route.ts`:

### **Before:**
```typescript
export async function GET(request: NextRequest) {
  // ... implementation
}
```

### **After:**
```typescript
// Shared logic extracted to helper function
async function fetchPropertyPersonData(period: string) {
  // ... implementation
}

// GET handler (for query params)
export async function GET(request: NextRequest) {
  const period = searchParams.get('period') || 'month';
  const result = await fetchPropertyPersonData(period);
  return NextResponse.json(result);
}

// POST handler (for JSON body)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const period = body.period || 'month';
  const result = await fetchPropertyPersonData(period);
  return NextResponse.json(result);
}
```

---

## 🔧 **Changes Made**

### **1. Extracted Shared Logic**
Created `fetchPropertyPersonData()` helper function to avoid code duplication:
- Validates environment variables
- Calls Apps Script endpoint
- Handles errors
- Returns formatted response

### **2. Updated GET Handler**
- Simplified to use helper function
- Reads `period` from query params
- Returns JSON response

### **3. Added POST Handler**
- Reads `period` from request body
- Uses same helper function
- Returns JSON response
- Matches admin panel's request format

---

## ✅ **Testing**

### **Build Test:**
```bash
npm run build
```
**Result:** ✅ **SUCCESS**
- ✓ Compiled successfully in 1828ms
- ✓ No TypeScript errors
- ✓ No ESLint errors

### **Runtime Test:**
The admin panel Property/Person test should now work correctly:
1. Navigate to `/admin`
2. Enter PIN: `1234`
3. Scroll to "Property/Person Test" card
4. Select period (Month or Year)
5. Click "Test"
6. Should receive JSON response with property/person breakdown

---

## 📊 **Expected Response Format**

```json
{
  "ok": true,
  "success": true,
  "data": [
    {
      "name": "Lanna House",
      "expense": 12500.50,
      "percentage": 65.2
    },
    {
      "name": "John Doe",
      "expense": 6700.25,
      "percentage": 34.8
    }
  ],
  "period": "month",
  "totalExpense": 19200.75,
  "timestamp": "2025-10-29T08:15:00.000Z"
}
```

---

## 🎯 **Summary**

**Issue:** Property/Person test failing with 405 error  
**Cause:** Missing POST handler  
**Fix:** Added POST handler with shared logic  
**Status:** ✅ **RESOLVED**

**Files Modified:**
- `app/api/pnl/property-person/route.ts` (+37 lines)

**Build Status:** ✅ **SUCCESS**

---

**The Property/Person test should now work correctly in the admin panel!** 🚀

