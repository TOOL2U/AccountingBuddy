# Revenue Auto-Credit Feature

## Overview
Implemented automatic credit detection for all Revenue type operations. When any "Revenue" option is selected or detected, the amount is automatically moved to the credit field instead of debit.

## Implementation Date
October 29, 2025

## Changes Made

### 1. Review Page (`app/review/[id]/page.tsx`)
**Location**: Line 96-120

**What it does**: When user manually selects a Revenue option from the dropdown, the current amount (whether in debit or credit) is automatically moved to the credit field and debit is set to 0.

**Code**:
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  
  // Clear category error when user selects a valid category
  if (name === 'typeOfOperation' && value && value !== '') {
    setCategoryError(false);
    
    // AUTOMATIC CREDIT DETECTION: If Revenue option selected, automatically use credit
    if (value.startsWith('Revenue')) {
      const currentAmount = parseFloat(formData.debit || formData.credit || '0');
      console.log(`[AUTO] Revenue detected: "${value}" - Moving amount to credit: ${currentAmount}`);
      setFormData({
        ...formData,
        [name]: value,
        credit: currentAmount.toString(),
        debit: '0',
      });
      return;
    }
  }
  
  setFormData({
    ...formData,
    [name]: value,
  });
};
```

**User Experience**:
- User uploads receipt or enters quick entry
- On review page, user selects any Revenue option (e.g., "Revenue - Sales", "Revenue - Rental Income")
- Amount automatically moves from debit to credit field
- Console logs the change for debugging

---

### 2. AI Extraction API (`app/api/extract/route.ts`)

#### 2a. Updated AI Prompt (Line 204-209)
**What it does**: Instructs AI to automatically detect Revenue categories and use credit field.

**Code**:
```typescript
5. Amount: Remove ฿, commas, "baht". **CRITICAL: If typeOfOperation starts with "Revenue" → use credit field and set debit to 0**. For all other expenses → use debit field and set credit to 0.
```

#### 2b. Post-Processing Logic (Line 295-303)
**What it does**: After AI extraction and normalization, double-checks if the category is Revenue and ensures amount is in credit.

**Code**:
```typescript
// CRITICAL: Auto-detect Revenue categories and ensure they use credit
if (extracted.typeOfOperation && extracted.typeOfOperation.startsWith('Revenue')) {
  const totalAmount = (extracted.debit || 0) + (extracted.credit || 0);
  if (totalAmount > 0) {
    console.log(`[AUTO-CREDIT] Revenue category detected: "${extracted.typeOfOperation}" - Moving amount ${totalAmount} to credit`);
    extracted.credit = totalAmount;
    extracted.debit = 0;
  }
}
```

**When it triggers**:
- After OCR extraction from receipt
- After AI categorizes the transaction
- Before sending to review page

---

### 3. Manual Entry Parse (`utils/manualParse.ts`)
**Location**: Line 276-285

**What it does**: When parsing manual text entry (quick entry), detects if the operation is Revenue and automatically switches from debit to credit.

**Code**:
```typescript
// CRITICAL: Auto-detect Revenue categories and use credit instead of debit
if (operation.startsWith('Revenue')) {
  if (transactionType === 'debit' && amount !== null) {
    console.log(`[MANUAL AUTO-CREDIT] Revenue category detected: "${operation}" - Moving amount ${amount} to credit`);
    data.credit = amount;
    data.debit = 0;
    reasons.push('Revenue → Auto-switched to credit');
  }
}
```

**User Experience**:
- User types: "revenue sales 5000 cash alesia"
- Parser detects "Revenue - Sales"
- Even if user typed "debit" or amount defaulted to debit
- System automatically moves to credit
- Console shows reason: "Revenue → Auto-switched to credit"

---

### 4. Upload Page - Manual Entry (`app/upload/page.tsx`)
**Location**: Line 178-198

**What it does**: After manual parse and AI enhancement, ensures Revenue categories always use credit.

**Code**:
```typescript
// CRITICAL: Auto-detect Revenue categories and ensure they use credit
if (dataToPass.typeOfOperation && dataToPass.typeOfOperation.startsWith('Revenue')) {
  const totalAmount = (dataToPass.debit || 0) + (dataToPass.credit || 0);
  if (totalAmount > 0 && (dataToPass.debit || 0) > 0) {
    console.log(`[MANUAL AUTO-CREDIT] Revenue category detected: "${dataToPass.typeOfOperation}" - Moving amount ${totalAmount} to credit`);
    dataToPass.credit = totalAmount;
    dataToPass.debit = 0;
  }
} else {
  // For non-Revenue, keep existing debit logic
  ...
}
```

**When it triggers**:
- After manual text entry is parsed
- After AI enhancement (if enabled)
- Before navigating to review page

---

### 5. Upload Page - File Upload (`app/upload/page.tsx`)
**Location**: Line 325-345

**What it does**: After receipt OCR and AI extraction, ensures Revenue categories always use credit.

**Code**:
```typescript
// CRITICAL: Auto-detect Revenue categories and ensure they use credit
if (dataToPass.typeOfOperation && dataToPass.typeOfOperation.startsWith('Revenue')) {
  const totalAmount = (dataToPass.debit || 0) + (dataToPass.credit || 0);
  if (totalAmount > 0 && (dataToPass.debit || 0) > 0) {
    console.log(`[FILE AUTO-CREDIT] Revenue category detected: "${dataToPass.typeOfOperation}" - Moving amount ${totalAmount} to credit`);
    dataToPass.credit = totalAmount;
    dataToPass.debit = 0;
  }
} else {
  // For non-Revenue, keep existing debit logic
  ...
}
```

**When it triggers**:
- After receipt image is processed via OCR
- After AI extraction categorizes the transaction
- Before navigating to review page

---

## Revenue Options Covered

All options starting with "Revenue" are automatically detected:

1. ✅ **Revenue - Commision**
2. ✅ **Revenue - Sales**
3. ✅ **Revenue - Services**
4. ✅ **Revenue - Rental Income**

Any future Revenue options added will also be automatically covered (as long as they start with "Revenue").

---

## User Flows

### Flow 1: Receipt Upload with Revenue
1. User uploads invoice for services rendered
2. OCR extracts text: "Invoice #123 Services 10000 baht"
3. AI detects: typeOfOperation = "Revenue - Services", amount = 10000
4. **Auto-credit triggers**: Moves 10000 to credit field
5. Review page shows: Credit = 10000, Debit = 0
6. User submits → Google Sheets receives credit entry

### Flow 2: Manual Entry with Revenue
1. User types: "rental income 5000 alesia"
2. Parser detects: "Revenue - Rental Income"
3. **Auto-credit triggers**: Moves amount to credit
4. Review page shows: Credit = 5000, Debit = 0
5. User submits → Google Sheets receives credit entry

### Flow 3: Manual Category Selection
1. User uploads expense receipt
2. AI categorizes as "EXP - Construction"
3. Review page shows: Debit = 2000
4. User changes dropdown to "Revenue - Sales"
5. **Auto-credit triggers on dropdown change**
6. Amount moves: Debit 0 → Credit 2000
7. User submits → Google Sheets receives credit entry

---

## Console Logging

For debugging, all auto-credit triggers log to console:

```
[AUTO] Revenue detected: "Revenue - Sales" - Moving amount to credit: 5000
[AUTO-CREDIT] Revenue category detected: "Revenue - Sales" - Moving amount 5000 to credit
[MANUAL AUTO-CREDIT] Revenue category detected: "Revenue - Rental Income" - Moving amount 5000 to credit
[FILE AUTO-CREDIT] Revenue category detected: "Revenue - Services" - Moving amount 10000 to credit
```

---

## Testing Checklist

### Receipt Upload
- [ ] Upload invoice with "Revenue" keyword → Should auto-detect and use credit
- [ ] Upload service receipt → Should auto-detect "Revenue - Services" and use credit
- [ ] Upload rental receipt → Should auto-detect "Revenue - Rental Income" and use credit

### Manual Entry
- [ ] Type "revenue sales 5000" → Should use credit
- [ ] Type "rental income 3000" → Should use credit
- [ ] Type "commission 1000" → Should use credit
- [ ] Type "debit revenue 2000" → Should override to credit (even if "debit" typed)

### Review Page
- [ ] Select "Revenue - Sales" from dropdown → Amount should move to credit
- [ ] Change from "EXP" to "Revenue" → Amount should move from debit to credit
- [ ] Change from "Revenue" to "EXP" → Amount stays in current field (no auto-move back)

---

## Edge Cases Handled

1. **Amount in both debit and credit**: Uses total amount and puts in credit
2. **No amount**: Doesn't trigger (waits for user input)
3. **User manually types in debit**: Still moves to credit (Revenue always wins)
4. **Category changed after amount entered**: Re-evaluates and moves if Revenue selected
5. **AI confidence low**: Still applies auto-credit if Revenue detected

---

## Future Enhancements

Possible improvements:
- Add visual indicator (badge) when auto-credit triggers
- Add confirmation dialog: "This is revenue, should we use credit?" (opt-in)
- Add setting to disable auto-credit (for advanced users)
- Support custom rules (e.g., "INC - " prefix also triggers credit)

---

## Rollback Instructions

If this feature needs to be rolled back:

1. **Review Page**: Remove lines 103-113 (auto-credit on dropdown change)
2. **Extract API**: Remove lines 295-303 (post-processing) and revert line 208
3. **Manual Parse**: Remove lines 280-285 (auto-switch to credit)
4. **Upload Page**: Revert changes at lines 178-198 and 325-345

---

## Related Files
- `/app/review/[id]/page.tsx` - Review page with dropdown handler
- `/app/api/extract/route.ts` - AI extraction with auto-credit logic
- `/utils/manualParse.ts` - Manual parse with Revenue detection
- `/app/upload/page.tsx` - Upload page with both file and manual entry
- `/config/options.json` - Dropdown options (Revenue categories)

---

## Keywords for Future Search
- Revenue auto credit
- Automatic credit detection
- Income to credit field
- Revenue category detection
- Debit vs credit automation
