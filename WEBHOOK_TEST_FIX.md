# Webhook Test Fix - Header Values Issue

**Date:** October 29, 2025  
**Issue:** Admin webhook test was using "EXPENSES" (a header) instead of a valid category  
**Status:** ✅ **FIXED**

---

## 🐛 **Problem**

The admin panel's webhook test was sending:
```json
{
  "typeOfOperation": "EXPENSES"
}
```

**Error received:**
```json
{
  "success": false,
  "error": "Invalid operation type \"EXPENSES\". Please select a valid category from the dropdown."
}
```

### **Root Cause**

`"EXPENSES"` is a **header** in the Google Sheets validation range, not a selectable option. Headers are used to organize categories but should never be selected by users or AI.

**Headers (NOT selectable):**
- `REVENUES`
- `Fixed Costs`
- `EXPENSES`
- `Property`

**Valid options (selectable):**
- `Revenue - Commision`
- `Revenue - Sales`
- `Revenue - Services`
- `EXP - Utilities - Gas`
- `EXP - Construction - Wall`
- `EXP - Other Expenses`
- etc.

---

## ✅ **Solution**

### **File Changed:** `app/admin/page.tsx`

**Before (Line 133):**
```typescript
typeOfOperation: 'EXPENSES',
```

**After (Line 133):**
```typescript
typeOfOperation: 'EXP - Other Expenses',
```

### **Why "EXP - Other Expenses"?**

This is a valid catch-all category for miscellaneous expenses, perfect for test entries.

---

## 🔍 **Validation System**

The app has multiple layers of validation to prevent header values from being used:

### **1. Sync Script Filtering**
`scripts/sync-sheet-dropdowns.js` automatically filters out headers when syncing from Google Sheets:

```javascript
const HEADERS_TO_EXCLUDE = [
  'REVENUES',
  'Fixed Costs', 
  'EXPENSES',
  'Property'
];
```

### **2. Config Files**
Both `config/options.json` and `config/live-dropdowns.json` only contain valid selectable options (no headers).

### **3. Server-Side Validation**
`utils/validatePayload.ts` checks against the valid options list:

```typescript
if (!options.typeOfOperation.includes(typeOfOperation)) {
  return {
    isValid: false,
    error: `Invalid operation type "${typeOfOperation}". Please select a valid category from the dropdown.`,
  };
}
```

### **4. Client-Side Dropdowns**
All dropdowns (`CommandSelect`, `Select` components) only show valid options from `config/options.json`.

---

## 🧪 **Testing**

### **Test the Fix:**

1. **Navigate to Admin Panel:**
   ```
   http://localhost:3001/admin
   ```

2. **Enter PIN:** `1234`

3. **Click "Test Webhook"**

4. **Expected Result:**
   ```json
   {
     "ok": true,
     "success": true,
     "message": "Data appended successfully",
     "row": 123,
     "timestamp": "2025-10-29T..."
   }
   ```

5. **Check Google Sheets:**
   - New row should appear in "Daily accounting" sheet
   - `typeOfOperation` column should show: `EXP - Other Expenses`

---

## 📋 **Valid Categories Reference**

### **Revenue Categories (4)**
- `Revenue - Commision`
- `Revenue - Sales`
- `Revenue - Services`
- `Revenue - Rental Income`

### **Expense Categories (23)**
- `EXP - Utilities - Gas`
- `EXP - Utilities - Water`
- `EXP - Utilities  - Electricity`
- `EXP - Administration & General - License & Certificates`
- `EXP - Construction - Structure`
- `EXP - Construction - Overheads/General/Unclassified`
- `EXP - HR - Employees Salaries`
- `EXP - Administration & General - Legal`
- `EXP - Administration & General - Professional fees`
- `EXP - Administration & General - Office supplies`
- `EXP - Administration & General  - Subscription, Software & Membership`
- `EXP - Construction - Electric Supplies`
- `EXP - Appliances & Electronics`
- `EXP - Windows, Doors, Locks & Hardware`
- `EXP - Repairs & Maintenance  - Furniture & Decorative Items`
- `EXP - Repairs & Maintenance  - Waste removal`
- `EXP - Repairs & Maintenance - Tools & Equipment`
- `EXP - Repairs & Maintenance - Painting & Decoration`
- `EXP - Repairs & Maintenance - Electrical & Mechanical`
- `EXP - Repairs & Maintenance - Landscaping`
- `EXP - Sales & Marketing -  Professional Marketing Services`
- `EXP - Construction - Wall`
- `EXP - Other Expenses` ← **Used for test**

---

## 🛡️ **Prevention**

To prevent this issue in the future:

### **1. Always Use Valid Options**
When creating test payloads, use actual category names from `config/options.json`:

```typescript
// ✅ GOOD
typeOfOperation: 'EXP - Other Expenses'

// ❌ BAD
typeOfOperation: 'EXPENSES'
```

### **2. Check Options List**
Before hardcoding any category, verify it exists:

```bash
cat config/options.json | grep "typeOfOperation" -A 30
```

### **3. Use Sync Script**
After updating Google Sheets validation ranges, always run:

```bash
node scripts/sync-sheet-dropdowns.js
```

This ensures headers are filtered out and only valid options are synced.

### **4. Test Webhook**
After any changes to categories or validation, test the webhook:

```bash
# Admin panel → Test Webhook
# OR
curl -X POST http://localhost:3001/api/sheets \
  -H "Content-Type: application/json" \
  -d '{
    "day": "29",
    "month": "Oct",
    "year": "2025",
    "property": "Lanna House",
    "typeOfOperation": "EXP - Other Expenses",
    "typeOfPayment": "Cash",
    "detail": "Test entry",
    "debit": 100
  }'
```

---

## 📊 **Summary**

| Item | Status |
|------|--------|
| Issue Identified | ✅ Complete |
| Root Cause Found | ✅ Complete |
| Fix Applied | ✅ Complete |
| Validation Verified | ✅ Complete |
| Documentation Updated | ✅ Complete |
| Testing Guide Created | ✅ Complete |

---

## 🔗 **Related Files**

- `app/admin/page.tsx` - Admin panel (webhook test fixed)
- `utils/validatePayload.ts` - Server-side validation
- `config/options.json` - Valid dropdown options
- `config/live-dropdowns.json` - Live sync reference
- `scripts/sync-sheet-dropdowns.js` - Sync script with header filtering
- `DROPDOWN_SYNC_GUIDE.md` - Dropdown sync documentation

---

**Fix completed at:** 2025-10-29  
**Fixed by:** Augment Agent  
**Result:** ✅ **Webhook test now uses valid category**

