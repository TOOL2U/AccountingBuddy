# P&L Sheet Update Guide - New Categories

## 📋 New Categories Added

### New Expense Categories:
1. **EXP - Personal - Massage** - Personal wellness expenses
2. **EXP - Construction - Electric Supplies** - Electrical materials and supplies
3. **EXP - Repairs & Maintenance - Furniture & Decorative Items** - Furniture and decor
4. **EXP - Repairs & Maintenance - Tools & Equipment** - Tools and equipment

### New Revenue Categories:
1. **Revenue - Commision** - Commission income
2. **Revenue - Sales** - Product/merchandise sales

### New Properties:
1. **Maria Ren** - Added as a property/person

### New Payment Types:
1. **Bank Transfer - Bangkok Bank - Shaun Ducker**
2. **Bank Transfer - Bangkok Bank - Maria Ren**
3. **Bank transfer - Krung Thai Bank - Family Account**
4. **Cash**

---

## 🔧 How to Update Your P&L Sheet

### Step 1: Add New Expense Categories to P&L Sheet

You need to add rows in your P&L sheet for the new expense categories. Here's where they should go:

#### In the "EXPENSES" section:

1. **Find the "EXP - Construction" subsection** and add:
   - `EXP - Construction - Electric Supplies`

2. **Find the "EXP - Repairs & Maintenance" subsection** and add:
   - `EXP - Repairs & Maintenance - Furniture & Decorative Items`
   - `EXP - Repairs & Maintenance - Tools & Equipment`

3. **Create or find the "EXP - Personal" subsection** and add:
   - `EXP - Personal - Massage`

#### In the "REVENUES" section:

Add these if they don't exist:
- `Revenue - Commision`
- `Revenue - Sales`

### Step 2: Update Named Ranges (if using them)

If your P&L uses named ranges for dynamic filtering, you'll need to:

1. Go to **Data > Named ranges** in Google Sheets
2. Find ranges like `expense_categories` or `revenue_categories`
3. Expand the range to include the new rows

### Step 3: Update Any SUMIF or Formulas

Check if you have formulas that sum expenses by category. For example:

```
=SUMIF(Transactions!$C:$C, "EXP - Personal - Massage", Transactions!$E:$E)
```

Make sure these formulas are updated to include the new categories.

### Step 4: Test the Integration

After updating the sheet:

1. **Submit a test transaction** with one of the new categories
2. **Check the P&L page** in your app to ensure it displays correctly
3. **Verify the numbers** match what's in your Google Sheet

---

## 🔄 Files Already Updated in Your App

The following files have been updated and are ready to use:

✅ **config/options.json** - Contains all 28 expense categories
✅ **config/live-dropdowns.json** - Synced with latest data
✅ **sync-from-sheets.js** - Now filters out headers automatically
✅ **utils/matchOption.ts** - Uses updated config automatically

---

## 🚀 Next Steps

### 1. Restart Your Dev Server (if running)
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Test the New Categories

Try creating a manual entry with:
- **Category**: "EXP - Personal - Massage"
- **Amount**: 500
- **Property**: "Shaun Ducker"
- **Payment**: "Cash"

This will verify that:
- ✅ New categories appear in dropdowns
- ✅ Form accepts the new values
- ✅ Data is saved to Google Sheets correctly

### 3. Update P&L Sheet Structure

Follow the steps above to add the new categories to your P&L sheet so they appear in the dashboard.

---

## 📊 Complete Category List

### Type of Operation (28 items):
1. Revenue - Commision 
2. Revenue - Sales 
3. Revenue - Services
4. Revenue - Rental Income
5. EXP - Utilities - Gas
6. EXP - Utilities - Water
7. EXP - Utilities  - Electricity
8. EXP - Administration & General - License & Certificates
9. EXP - Construction - Structure
10. EXP - Construction - Overheads/General/Unclassified
11. EXP - HR - Employees Salaries
12. EXP - Administration & General - Legal
13. EXP - Administration & General - Professional fees
14. EXP - Administration & General - Office supplies
15. EXP - Administration & General  - Subscription, Software & Membership
16. **EXP - Construction - Electric Supplies** 🆕
17. EXP - Appliances & Electronics
18. EXP - Windows, Doors, Locks & Hardware
19. **EXP - Repairs & Maintenance  - Furniture & Decorative Items** 🆕
20. EXP - Repairs & Maintenance  - Waste removal
21. **EXP - Repairs & Maintenance - Tools & Equipment** 🆕
22. EXP - Repairs & Maintenance - Painting & Decoration
23. EXP - Repairs & Maintenance - Electrical & Mechanical
24. EXP - Repairs & Maintenance - Landscaping
25. EXP - Sales & Marketing -  Professional Marketing Services
26. EXP - Construction - Wall
27. EXP - Other Expenses
28. **EXP - Personal - Massage** 🆕

### Properties (6 items):
1. Sia Moon - Land - General
2. Alesia House
3. Lanna House
4. Parents House
5. Shaun Ducker
6. **Maria Ren** 🆕

### Type of Payment (4 items):
1. **Bank Transfer - Bangkok Bank - Shaun Ducker** 🆕
2. **Bank Transfer - Bangkok Bank - Maria Ren** 🆕
3. **Bank transfer - Krung Thai Bank - Family Account** 🆕
4. **Cash** 🆕

---

## ⚠️ Important Notes

1. **Headers Filtered**: The sync script now automatically filters out headers like "FIXED COSTS", "EXPENSES", "PROPERTY", "TYPE OF PAYMENT"

2. **Keywords Added**: All new categories have appropriate keywords for AI matching:
   - "massage" → EXP - Personal - Massage
   - "electric supplies", "wire", "cable" → EXP - Construction - Electric Supplies
   - "furniture", "decor", "decorative" → Furniture & Decorative Items
   - "tools", "equipment", "drill" → Tools & Equipment

3. **Payment Types**: The app now has 4 specific payment types instead of being empty. Make sure your Google Sheet has these exact values in the validation dropdown.

---

## 🔍 Troubleshooting

### Categories Not Showing Up?
1. Check that `config/options.json` has the new categories
2. Restart the dev server
3. Hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### P&L Dashboard Not Showing New Categories?
1. Update the P&L sheet structure (add the new rows)
2. Update any named ranges
3. Refresh the P&L page in the app

### Getting "Invalid Category" Errors?
1. Make sure the category name matches exactly (including spaces and capitalization)
2. Check that the category exists in both `config/options.json` and your Google Sheet validation

---

## ✅ Verification Checklist

- [ ] `config/options.json` has 28 type of operations
- [ ] `config/options.json` has 6 properties
- [ ] `config/options.json` has 4 payment types
- [ ] All new categories have keywords defined
- [ ] Dev server restarted (if running)
- [ ] Browser cache cleared/hard refresh
- [ ] P&L sheet has new expense category rows
- [ ] P&L sheet formulas updated for new categories
- [ ] Test transaction submitted successfully
- [ ] P&L dashboard displays new categories

---

Generated: 2025-10-30
