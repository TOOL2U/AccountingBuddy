# Quick Entry → Review Page Test URLs

## 🚀 Test Server Running
**Server URL:** http://localhost:3001

---

## 📋 Test Case 1: Revenue with Bangkok Bank - Shaun Ducker
**Test URL:**
```
http://localhost:3001/review/new?data=%7B%22day%22%3A%2215%22%2C%22month%22%3A%2210%22%2C%22year%22%3A%222025%22%2C%22property%22%3A%22Sia%20Moon%22%2C%22typeOfOperation%22%3A%22Revenue%20-%20Rooms%22%2C%22typeOfPayment%22%3A%22Bank%20Transfer%20-%20Bangkok%20Bank%20-%20Shaun%20Ducker%22%2C%22detail%22%3A%22Room%20booking%20payment%22%2C%22ref%22%3A%22REF-001%22%2C%22debit%22%3A%220%22%2C%22credit%22%3A%225000%22%7D
```

**Expected:**
- ✅ Category: "Revenue - Rooms"
- ✅ Payment: "Bank Transfer - Bangkok Bank - Shaun Ducker"
- ✅ Credit: 5000 THB
- ✅ Console: "[REVIEW] ✓ Valid typeOfPayment received from quick entry: Bank Transfer - Bangkok Bank - Shaun Ducker"

---

## 📋 Test Case 2: Expense with Cash
**Test URL:**
```
http://localhost:3001/review/new?data=%7B%22day%22%3A%2216%22%2C%22month%22%3A%2210%22%2C%22year%22%3A%222025%22%2C%22property%22%3A%22The%20Haven%22%2C%22typeOfOperation%22%3A%22Administrative%20expenses%22%2C%22typeOfPayment%22%3A%22Cash%22%2C%22detail%22%3A%22Office%20supplies%22%2C%22ref%22%3A%22REF-002%22%2C%22debit%22%3A%221500%22%2C%22credit%22%3A%220%22%7D
```

**Expected:**
- ✅ Category: "Administrative expenses"
- ✅ Payment: "Cash"
- ✅ Debit: 1500 THB
- ✅ Console: "[REVIEW] ✓ Valid typeOfPayment received from quick entry: Cash"

---

## 📋 Test Case 3: Expense with Bangkok Bank - Maria Ren
**Test URL:**
```
http://localhost:3001/review/new?data=%7B%22day%22%3A%2217%22%2C%22month%22%3A%2210%22%2C%22year%22%3A%222025%22%2C%22property%22%3A%22Coco%20View%22%2C%22typeOfOperation%22%3A%22Utilities%22%2C%22typeOfPayment%22%3A%22Bank%20Transfer%20-%20Bangkok%20Bank%20-%20Maria%20Ren%22%2C%22detail%22%3A%22Electricity%20bill%22%2C%22ref%22%3A%22REF-003%22%2C%22debit%22%3A%222300%22%2C%22credit%22%3A%220%22%7D
```

**Expected:**
- ✅ Category: "Utilities"
- ✅ Payment: "Bank Transfer - Bangkok Bank - Maria Ren"
- ✅ Debit: 2300 THB
- ✅ Console: "[REVIEW] ✓ Valid typeOfPayment received from quick entry: Bank Transfer - Bangkok Bank - Maria Ren"

---

## 📋 Test Case 4: Revenue with Krung Thai Bank
**Test URL:**
```
http://localhost:3001/review/new?data=%7B%22day%22%3A%2218%22%2C%22month%22%3A%2210%22%2C%22year%22%3A%222025%22%2C%22property%22%3A%22Sia%20Moon%22%2C%22typeOfOperation%22%3A%22Revenue%20-%20Restaurant%22%2C%22typeOfPayment%22%3A%22Bank%20transfer%20-%20Krung%20Thai%20Bank%20-%20Family%20Account%22%2C%22detail%22%3A%22Restaurant%20sales%22%2C%22ref%22%3A%22REF-004%22%2C%22debit%22%3A%220%22%2C%22credit%22%3A%228500%22%7D
```

**Expected:**
- ✅ Category: "Revenue - Restaurant"
- ✅ Payment: "Bank transfer - Krung Thai Bank - Family Account"
- ✅ Credit: 8500 THB
- ✅ Console: "[REVIEW] ✓ Valid typeOfPayment received from quick entry: Bank transfer - Krung Thai Bank - Family Account"

---

## 🔍 How to Test

### Option 1: Click Test URLs (Fastest)
1. Copy any of the test URLs above
2. Paste into your browser
3. Check the review page loads with all fields populated
4. Open browser console (F12 or Cmd+Option+I on Mac)
5. Look for the console log message confirming valid payment

### Option 2: Manual Quick Entry (Full Flow)
1. Go to http://localhost:3001/upload
2. Scroll to "Quick Entry (Manual Parse)" section
3. Fill in the form with test data
4. Select category from dropdown
5. Select payment type from dropdown
6. Click "Manual Parse & Review"
7. Verify all fields on review page

---

## ✅ Success Criteria

For each test, you should see:
- ✓ All form fields populated correctly
- ✓ Category dropdown shows the selected category
- ✓ Payment dropdown shows the selected payment
- ✓ No console errors
- ✓ Console log: "[REVIEW] ✓ Valid typeOfPayment received from quick entry: [payment type]"
- ✓ No "Maximum update depth exceeded" error
- ✓ No "Invalid typeOfPayment detected" warning

---

## ❌ Red Flags

If you see any of these, there's a problem:
- ❌ "[REVIEW] Invalid typeOfPayment detected: ..."
- ❌ "Maximum update depth exceeded"
- ❌ Payment field is empty when it should be populated
- ❌ Category field is empty when it should be populated
- ❌ Page keeps re-rendering/flickering

---

## 🎯 Quick Upload Page

**Upload/Quick Entry Page:** http://localhost:3001/upload
