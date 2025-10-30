# Running Balance Tracking Feature

**Date:** October 29, 2025  
**Status:** ✅ **IMPLEMENTED & READY FOR TESTING**

---

## 🎯 **Objective**

Implement automatic balance tracking that:
1. **Starts with uploaded bank balance** (e.g., ฿10,000 from screenshot)
2. **Automatically adds revenues** (e.g., +฿5,000 rental income) → Balance becomes ฿15,000
3. **Automatically deducts expenses** (e.g., -฿2,000 for construction) → Balance becomes ฿13,000
4. **Tracks each bank/cash account separately**
5. **Shows variance** (change since last upload)

---

## 💡 **How It Works**

### **Formula:**
```
Current Balance = Uploaded Balance + Total Revenues - Total Expenses
```

### **Example:**
```
1. User uploads bank screenshot: ฿10,000 (Bangkok Bank - Shaun Ducker)
2. User adds expense: -฿2,000 (construction, paid via Bangkok Bank - Shaun Ducker)
3. User adds revenue: +฿5,000 (rental income, received to Bangkok Bank - Shaun Ducker)
4. Current Balance = ฿10,000 + ฿5,000 - ฿2,000 = ฿13,000
5. Variance = +฿3,000 (change since upload)
```

---

## 🏗️ **Architecture**

### **1. Data Storage (Google Sheets)**

**Sheet:** "Bank & Cash Balance"

**New Structure (V8):**
```
Column A: timestamp (ISO 8601)
Column B: bankName (e.g., "Cash", "Bank Transfer - Bangkok Bank - Shaun Ducker")
Column C: balance (number)
Column D: note (optional)
```

**Example Data:**
```
timestamp                    | bankName                                      | balance | note
2025-10-29T10:00:00.000Z    | Bank Transfer - Bangkok Bank - Shaun Ducker  | 10000   | Screenshot upload
2025-10-29T11:00:00.000Z    | Cash                                          | 5000    | Manual entry
2025-10-29T12:00:00.000Z    | Bank Transfer - Bangkok Bank - Maria Ren     | 8000    | Screenshot upload
```

### **2. API Endpoints**

#### **POST /api/balance/save**
**Purpose:** Save balance for a specific bank/cash account

**Request Body (NEW FORMAT):**
```json
{
  "bankName": "Bank Transfer - Bangkok Bank - Shaun Ducker",
  "balance": 10000,
  "note": "Screenshot upload"
}
```

**Old Format (Still Supported):**
```json
{
  "bankBalance": 10000,  // Defaults to "Bank Transfer - Bangkok Bank - Shaun Ducker"
  "cashBalance": 5000    // Defaults to "Cash"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Balance saved successfully",
  "timestamp": "2025-10-29T10:00:00.000Z",
  "bankName": "Bank Transfer - Bangkok Bank - Shaun Ducker",
  "balance": 10000
}
```

#### **POST /api/balance/by-property**
**Purpose:** Calculate running balances for all banks/cash accounts

**Process:**
1. Fetch latest uploaded balance for each bank from "Bank & Cash Balance" sheet
2. Fetch all transactions from inbox
3. Filter transactions by `typeOfPayment` (bank name)
4. Calculate: `currentBalance = uploadedBalance + revenues - expenses`
5. Return calculated balances with breakdown

**Response:**
```json
{
  "ok": true,
  "success": true,
  "propertyBalances": [
    {
      "property": "Bank Transfer - Bangkok Bank - Shaun Ducker",
      "balance": 13000,
      "uploadedBalance": 10000,
      "uploadedDate": "2025-10-29T10:00:00.000Z",
      "totalRevenue": 5000,
      "totalExpense": 2000,
      "transactionCount": 2,
      "variance": 3000
    },
    {
      "property": "Cash",
      "balance": 4500,
      "uploadedBalance": 5000,
      "uploadedDate": "2025-10-29T11:00:00.000Z",
      "totalRevenue": 0,
      "totalExpense": 500,
      "transactionCount": 1,
      "variance": -500
    }
  ],
  "summary": {
    "totalBalance": 17500,
    "totalRevenue": 5000,
    "totalExpense": 2500,
    "propertyCount": 2,
    "transactionCount": 3
  },
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

### **3. Google Apps Script (V8)**

**Function:** `handleBalancesAppend(payload)`

**Changes:**
- **OLD:** Saved `bankBalance` and `cashBalance` as separate columns
- **NEW:** Saves `bankName` and `balance` for individual bank tracking

**Code:**
```javascript
function handleBalancesAppend(payload) {
  const bankName = payload.bankName;  // NEW
  const balance = payload.balance;    // NEW
  const note = payload.note || '';
  
  // Validate
  if (!bankName || typeof balance !== 'number') {
    return createErrorResponse('Invalid bankName or balance');
  }
  
  // Append row
  const timestamp = new Date().toISOString();
  balancesSheet.appendRow([timestamp, bankName, balance, note]);
  
  return { ok: true, bankName, balance, timestamp };
}
```

---

## 🎨 **UI Changes**

### **1. Bank Balance Card**

**Added:**
- **Bank selector dropdown** - Choose which bank account to upload balance for
- Options: Bangkok Bank - Shaun Ducker, Bangkok Bank - Maria Ren, Krung Thai Bank - Family Account

**Before:**
```
[Upload Screenshot]
Or enter manually: [____]
[Save Bank Balance]
```

**After:**
```
Select bank account: [Bangkok Bank - Shaun Ducker ▼]
[Upload Screenshot]
Enter balance amount: [____]
[Save Bank Balance]
```

### **2. Running Balances Section**

**Title:** "Running Balances"  
**Subtitle:** "Uploaded balance + revenues - expenses"

**Card Layout:**
```
┌─────────────────────────────────────────┐
│ 💳 Bank Transfer - Bangkok Bank -      │
│    Shaun Ducker                    2 txns│
│                                          │
│ Current Balance                          │
│ ฿13,000                                  │
│                                          │
│ ─────────────────────────────────────   │
│ Uploaded Balance          ฿10,000        │
│ + Revenues               +฿5,000         │
│ - Expenses               -฿2,000         │
│ ─────────────────────────────────────   │
│ Change                   +฿3,000         │
│ Last upload: 10/29/2025                  │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Shows current calculated balance (large, color-coded)
- ✅ Shows uploaded balance (starting point)
- ✅ Shows revenues added (green)
- ✅ Shows expenses deducted (red)
- ✅ Shows variance/change (green if positive, red if negative)
- ✅ Shows last upload date
- ✅ Shows transaction count

---

## 📊 **Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS BALANCE                                     │
│    - Select bank: "Bangkok Bank - Shaun Ducker"            │
│    - Enter amount: ฿10,000                                  │
│    - Click "Save Bank Balance"                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SAVE TO GOOGLE SHEETS                                    │
│    POST /api/balance/save                                   │
│    → Apps Script: handleBalancesAppend()                    │
│    → Append row: [timestamp, bankName, balance, note]       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USER ADDS TRANSACTION                                    │
│    - Upload receipt: "฿2,000 construction Alesia House"    │
│    - AI extracts: debit=2000, typeOfPayment="Bangkok Bank" │
│    - Save to inbox                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CALCULATE RUNNING BALANCE                                │
│    POST /api/balance/by-property                            │
│    → Fetch uploaded balance: ฿10,000                        │
│    → Fetch transactions: 1 expense (฿2,000)                 │
│    → Calculate: ฿10,000 - ฿2,000 = ฿8,000                   │
│    → Return: { balance: 8000, variance: -2000 }             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. DISPLAY ON BALANCE PAGE                                  │
│    - Current Balance: ฿8,000 (red, negative)                │
│    - Uploaded Balance: ฿10,000                              │
│    - Expenses: -฿2,000                                      │
│    - Change: -฿2,000 (red)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Files Modified**

| File | Changes | Lines |
|------|---------|-------|
| `app/api/balance/save/route.ts` | Updated to support `bankName + balance` format | 84 |
| `app/api/balance/by-property/route.ts` | Complete rewrite for running balance calculation | 256 |
| `app/balance/page.tsx` | Added bank selector, updated UI cards | 815 |
| `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` | Updated `handleBalancesAppend()` for V8 structure | 1402 |

---

## ✅ **Build Status**

```bash
npm run build
```

**Result:** ✅ **SUCCESS**

- ✅ Compiled successfully in 5.6s
- ✅ No TypeScript errors
- ✅ 2 ESLint warnings (unrelated)
- ✅ All routes generated successfully

---

## 🧪 **Testing Guide**

### **Step 1: Deploy Updated Apps Script**

1. Open Google Apps Script editor
2. Replace code with `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js`
3. Deploy as new version
4. Test the endpoint:
```bash
curl -X POST <APPS_SCRIPT_URL> \
  -H "Content-Type: application/json" \
  -d '{
    "action": "balancesAppend",
    "secret": "YOUR_SECRET",
    "bankName": "Bank Transfer - Bangkok Bank - Shaun Ducker",
    "balance": 10000,
    "note": "Test upload"
  }'
```

### **Step 2: Update Google Sheet Structure**

1. Open "Bank & Cash Balance" sheet
2. Update header row:
   - Column A: `timestamp`
   - Column B: `bankName`
   - Column C: `balance`
   - Column D: `note`
3. Clear old data (if any)

### **Step 3: Test Balance Upload**

1. Open http://localhost:3001/balance
2. Enter PIN: `1234`
3. Select bank: "Bank Transfer - Bangkok Bank - Shaun Ducker"
4. Enter amount: `10000`
5. Click "Save Bank Balance"
6. Verify success toast
7. Check Google Sheet for new row

### **Step 4: Add Transaction**

1. Go to http://localhost:3001/upload
2. Upload receipt with text: "2000 construction alesia house bangkok bank shaun"
3. Verify AI extraction
4. Save to inbox

### **Step 5: Verify Running Balance**

1. Return to http://localhost:3001/balance
2. Scroll to "Running Balances" section
3. Verify card shows:
   - Current Balance: ฿8,000
   - Uploaded Balance: ฿10,000
   - Expenses: -฿2,000
   - Change: -฿2,000

---

## 🎉 **Summary**

**Status:** ✅ **COMPLETE & READY**

**What Was Built:**
- ✅ Individual bank balance tracking (not just "bank" and "cash")
- ✅ Running balance calculation (uploaded + revenues - expenses)
- ✅ Automatic variance tracking
- ✅ Bank selector dropdown
- ✅ Enhanced UI with detailed breakdown
- ✅ Backward compatibility with old API format

**Key Features:**
- Track unlimited banks/cash accounts
- Automatic balance updates as transactions are added
- Visual breakdown of revenues, expenses, and changes
- Color-coded positive/negative balances
- Transaction count per bank
- Last upload date tracking

**Next Steps:**
1. Deploy updated Apps Script (V8)
2. Update Google Sheet structure
3. Test balance upload
4. Test transaction addition
5. Verify running balance calculation

**The system now provides complete automatic balance tracking for each individual bank and cash account!** 🚀

