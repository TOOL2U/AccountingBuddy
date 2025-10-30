# 🚀 Quick Start: Overhead Expenses Modal

## ✅ What's Been Done

1. **Created** `components/OverheadExpensesModal.tsx` - Modal component
2. **Created** `app/api/pnl/overhead-expenses/route.ts` - API endpoint
3. **Updated** `app/pnl/page.tsx` - Made overhead cards clickable
4. **Created** `APPS_SCRIPT_OVERHEAD_EXPENSES.js` - Google Apps Script function

## ⚠️ What You Need to Do (5 minutes)

### Step 1: Open Google Apps Script
Go to your Google Apps Script project for the accounting app.

### Step 2: Add the Function
Copy the `getOverheadExpensesDetails` function from `APPS_SCRIPT_OVERHEAD_EXPENSES.js` and paste it into your Apps Script.

### Step 3: Update doPost
Find your `doPost` function and add this case to the switch statement:

```javascript
case 'getOverheadExpensesDetails':
  const period = requestData.period || 'month';
  return ContentService.createTextOutput(
    JSON.stringify(getOverheadExpensesDetails(period))
  ).setMimeType(ContentService.MimeType.JSON);
```

### Step 4: Deploy
Deploy the updated Apps Script (New deployment or Update existing).

### Step 5: Test
1. Go to your P&L page (`/pnl`)
2. Click on "Total Overheads" (Month to Date)
3. Modal should open showing 23 overhead expenses grouped by category
4. Click on "Total Overheads" (Year to Date)
5. Modal should show year totals

## 🎯 What You'll See

**When you click "Total Overheads":**
- Modal opens instantly with smooth animation
- 23 overhead expenses displayed
- Grouped into 8 categories:
  - Utilities (Gas, Water, Electricity)
  - HR (Employee Salaries)
  - Administration & General (5 items)
  - Construction (4 items)
  - Appliances & Hardware (2 items)
  - Repairs & Maintenance (6 items)
  - Sales & Marketing (1 item)
  - Other Expenses (1 item)
- Each expense shows:
  - Name
  - Amount in Thai Baht (฿)
  - Percentage of total overhead
  - Color coding (green/yellow/red)

## 📊 Data Source

**Google Sheet**: "P&L (DO NOT EDIT)"  
**Range**: Rows 29-51 (23 expense categories)  
**Columns**:
- Column A: Expense names (starting with "EXP -")
- Column B: This Month values (for monthly modal)
- Column Q: Year Total values (for yearly modal)

## 🔧 Troubleshooting

**Modal doesn't open?**
- Check browser console for errors
- Verify Apps Script is deployed
- Check APPS_SCRIPT_URL environment variable

**No data showing?**
- Check Apps Script logs for errors
- Verify sheet name is exactly "P&L (DO NOT EDIT)"
- Verify rows 29-51 contain expense data

**API errors?**
- Check Apps Script execution logs
- Verify doPost has the new case
- Check network tab in browser DevTools

## 📁 Files Created

```
components/
  OverheadExpensesModal.tsx ·········· Modal UI component

app/api/pnl/overhead-expenses/
  route.ts ························ API endpoint

APPS_SCRIPT_OVERHEAD_EXPENSES.js ···· Apps Script function
OVERHEAD_EXPENSES_IMPLEMENTATION.md · Full documentation
OVERHEAD_EXPENSES_SUMMARY.md ········ Quick summary
overhead-implementation-diagram.txt · Visual architecture
QUICK_START_OVERHEAD.md ············· This file
```

## ✨ Result

Now both KPI cards have clickable modals:
- ✅ Property/Person Expense (already working)
- ✅ Total Overheads (newly added)

Both follow the same pattern and design system!

---

**Ready?** Deploy the Apps Script and test! 🚀
