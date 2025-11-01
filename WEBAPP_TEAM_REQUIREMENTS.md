# 🚨 URGENT: /api/options Endpoint Implementation Required

**To:** Webapp Team  
**From:** Mobile Team  
**Date:** November 1, 2025  
**Priority:** HIGH  
**Status:** ⚠️ **ENDPOINT NOT DEPLOYED** (Returns 404)

---

## 📋 Summary

The mobile app implementation for dynamic dropdown options is **100% complete** and ready to test. However, the `/api/options` endpoint is currently returning **HTTP 404**.

**Current Status:**
```bash
$ curl https://accounting.siamoon.com/api/options
# Returns: HTTP 404 (HTML page)
```

**Expected Status:**
```bash
$ curl https://accounting.siamoon.com/api/options
# Should return: HTTP 200 (JSON response)
```

---

## ✅ What Mobile Team Has Completed

1. ✅ API endpoint configuration (`/api/options`)
2. ✅ TypeScript types (`OptionsResponse` interface)
3. ✅ API service method (`getOptions()` with retry logic)
4. ✅ Caching system (AsyncStorage, 24h TTL)
5. ✅ Options context (React Context provider)
6. ✅ Fallback strategy (API → Cache → Hardcoded)
7. ✅ UI integration (ManualEntryScreen uses dynamic options)

**Mobile app is ready to go live as soon as the endpoint is deployed!**

---

## 🎯 What Webapp Team Needs to Do

### **Create `/api/options` Endpoint**

**File to Create:** `app/api/options/route.ts` (or equivalent in your Next.js structure)

**Endpoint Details:**
- **URL:** `https://accounting.siamoon.com/api/options`
- **Method:** `GET`
- **Authentication:** None (public endpoint)
- **Response Type:** `application/json`

---

## 📝 Required Response Format

### **Success Response (HTTP 200):**

```json
{
  "ok": true,
  "data": {
    "properties": [
      "Sia Moon - Land - General",
      "Alesia House",
      "Lanna House",
      "Parents House",
      "Shaun Ducker - Personal",
      "Maria Ren - Personal",
      "Family"
    ],
    "typeOfOperations": [
      "Revenue - Commision",
      "Revenue - Sales",
      "Revenue - Services",
      "Revenue - Rental Income",
      "EXP - Utilities - Gas",
      "EXP - Utilities - Water",
      "EXP - Utilities  - Electricity",
      "OVERHEAD EXPENSES",
      "EXP - Administration & General - License & Certificates",
      "EXP - Construction - Structure",
      "EXP - Construction - Overheads/General/Unclassified",
      "EXP - HR - Employees Salaries",
      "EXP - Administration & General - Legal",
      "EXP - Administration & General - Professional fees",
      "EXP - Administration & General - Office supplies",
      "EXP - Administration & General  - Subscription, Software & Membership",
      "EXP - Construction - Electric Supplies",
      "EXP - Appliances & Electronics",
      "EXP - Windows, Doors, Locks & Hardware",
      "EXP - Repairs & Maintenance  - Furniture & Decorative Items",
      "EXP - Repairs & Maintenance  - Waste removal",
      "EXP - Repairs & Maintenance - Tools & Equipment",
      "EXP - Repairs & Maintenance - Painting & Decoration",
      "EXP - Repairs & Maintenance - Electrical & Mechanical",
      "EXP - Repairs & Maintenance - Landscaping",
      "EXP - Sales & Marketing -  Professional Marketing Services",
      "EXP - Construction - Wall",
      "EXP - Other Expenses",
      "EXP - Personal - Massage",
      "EXP - Household - Alcohol",
      "EXP - Household - Groceries",
      "EXP - Household - Nappies",
      "EXP - Household - Toiletries"
    ],
    "typeOfPayments": [
      "Bank Transfer - Bangkok Bank - Shaun Ducker",
      "Bank Transfer - Bangkok Bank - Maria Ren",
      "Bank transfer - Krung Thai Bank - Family Account",
      "Cash"
    ]
  },
  "updatedAt": "2025-11-01T12:34:56.789Z",
  "cached": true
}
```

### **Error Response (HTTP 500):**

```json
{
  "ok": false,
  "error": "Failed to fetch dropdown options",
  "data": null
}
```

---

## 🔧 Implementation Options

### **Option 1: Read from Config File (Recommended)**

If you already have `config/live-dropdowns.json`:

```typescript
// app/api/options/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'config', 'live-dropdowns.json');
    const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    return NextResponse.json({
      ok: true,
      data: {
        properties: data.properties || [],
        typeOfOperations: data.typeOfOperations || [],
        typeOfPayments: data.typeOfPayments || [],
      },
      updatedAt: data.updatedAt || new Date().toISOString(),
      cached: true,
    });
  } catch (error) {
    console.error('Failed to read dropdown options:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch dropdown options',
        data: null,
      },
      { status: 500 }
    );
  }
}
```

---

### **Option 2: Fetch from Google Sheets API**

If you want real-time data from Google Sheets:

```typescript
// app/api/options/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Call your Apps Script webhook or Google Sheets API
    const response = await fetch(process.env.SHEETS_OPTIONS_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOptions',
        secret: process.env.SHEETS_WEBHOOK_SECRET,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'Failed to fetch from Google Sheets');
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      updatedAt: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Failed to fetch dropdown options:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch dropdown options',
        data: null,
      },
      { status: 500 }
    );
  }
}
```

---

### **Option 3: Hardcoded (Quick Test)**

For immediate testing:

```typescript
// app/api/options/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      properties: [
        "Sia Moon - Land - General",
        "Alesia House",
        "Lanna House",
        "Parents House",
        "Shaun Ducker - Personal",
        "Maria Ren - Personal",
        "Family"
      ],
      typeOfOperations: [
        "Revenue - Commision",
        "Revenue - Sales",
        "Revenue - Services",
        "Revenue - Rental Income",
        "EXP - Utilities - Gas",
        "EXP - Utilities - Water",
        "EXP - Utilities  - Electricity",
        "OVERHEAD EXPENSES",
        "EXP - Administration & General - License & Certificates",
        "EXP - Construction - Structure",
        "EXP - Construction - Overheads/General/Unclassified",
        "EXP - HR - Employees Salaries",
        "EXP - Administration & General - Legal",
        "EXP - Administration & General - Professional fees",
        "EXP - Administration & General - Office supplies",
        "EXP - Administration & General  - Subscription, Software & Membership",
        "EXP - Construction - Electric Supplies",
        "EXP - Appliances & Electronics",
        "EXP - Windows, Doors, Locks & Hardware",
        "EXP - Repairs & Maintenance  - Furniture & Decorative Items",
        "EXP - Repairs & Maintenance  - Waste removal",
        "EXP - Repairs & Maintenance - Tools & Equipment",
        "EXP - Repairs & Maintenance - Painting & Decoration",
        "EXP - Repairs & Maintenance - Electrical & Mechanical",
        "EXP - Repairs & Maintenance - Landscaping",
        "EXP - Sales & Marketing -  Professional Marketing Services",
        "EXP - Construction - Wall",
        "EXP - Other Expenses",
        "EXP - Personal - Massage",
        "EXP - Household - Alcohol",
        "EXP - Household - Groceries",
        "EXP - Household - Nappies",
        "EXP - Household - Toiletries"
      ],
      typeOfPayments: [
        "Bank Transfer - Bangkok Bank - Shaun Ducker",
        "Bank Transfer - Bangkok Bank - Maria Ren",
        "Bank transfer - Krung Thai Bank - Family Account",
        "Cash"
      ]
    },
    updatedAt: new Date().toISOString(),
    cached: true,
  });
}
```

---

## ✅ Verification Steps

After deploying the endpoint:

### **1. Test with cURL:**
```bash
curl https://accounting.siamoon.com/api/options
```

**Expected:** HTTP 200 with JSON response

---

### **2. Verify Response Structure:**
```bash
curl -s https://accounting.siamoon.com/api/options | jq '.ok'
# Should return: true

curl -s https://accounting.siamoon.com/api/options | jq '.data.properties | length'
# Should return: 7

curl -s https://accounting.siamoon.com/api/options | jq '.data.typeOfOperations | length'
# Should return: 33

curl -s https://accounting.siamoon.com/api/options | jq '.data.typeOfPayments | length'
# Should return: 4
```

---

### **3. Notify Mobile Team:**

Once deployed, send confirmation message:
```
✅ /api/options endpoint is live!
- URL: https://accounting.siamoon.com/api/options
- Status: HTTP 200
- Response: Valid JSON
- Ready for mobile testing
```

---

## 📊 Expected Impact

**Once deployed:**
- ✅ Mobile app will fetch options on launch
- ✅ Dropdowns will be populated with live data
- ✅ Changes in Google Sheets will sync to mobile (within 24h cache)
- ✅ No app rebuild needed for category changes

**Before deployment:**
- ⚠️ Mobile app uses hardcoded fallback values
- ⚠️ Console shows: "⚠️ Failed to fetch options from API"
- ⚠️ Console shows: "✅ Options loaded from hardcoded fallback"

---

## 🚨 Critical Notes

1. **CORS Headers:** Ensure endpoint allows requests from mobile app
2. **Response Format:** Must match exactly (field names are case-sensitive)
3. **Array Order:** Preserve exact spelling and spacing (e.g., "Revenue - Commision" not "Revenue - Commission")
4. **Performance:** Response should be < 500ms (mobile app has 30s timeout)

---

## 📞 Contact

**Mobile Team Lead:** Ready to test immediately upon deployment  
**Testing ETA:** < 1 hour after notification  
**Slack/Email:** Please notify when deployed

---

## 📝 Checklist for Webapp Team

- [ ] Create `app/api/options/route.ts` file
- [ ] Implement GET handler
- [ ] Return correct JSON format
- [ ] Test locally: `curl http://localhost:3000/api/options`
- [ ] Deploy to production
- [ ] Test production: `curl https://accounting.siamoon.com/api/options`
- [ ] Verify HTTP 200 response
- [ ] Verify JSON structure matches spec
- [ ] Notify mobile team

---

**Estimated Implementation Time:** 15-30 minutes  
**Deployment Time:** 5-10 minutes (Vercel auto-deploy)  
**Total Time to Live:** < 1 hour

---

**Thank you! Mobile team is standing by for testing.** 🚀

