# P&L Dashboard Setup Instructions

## 🎯 Current Status

✅ **Apps Script V5 deployed** - Automatic discovery working  
✅ **Sheet structure discovered** - Found your P&L data layout  
⏳ **Named ranges needed** - 8 ranges to create  

---

## 📊 Discovered P&L Structure

Your "P&L " sheet has the following structure:

| Metric | This Month | Year Total | Description |
|--------|-----------|------------|-------------|
| **Total Revenue** | `B10` | `Q10` | Revenue from all sources |
| **Total Overhead Expense** | `B37` | `Q37` | All operating expenses |
| **Gross Operating Profit** | `B40` | `Q40` | Revenue - Expenses |
| **EBITDA Margin** | `B41` | `Q41` | Profit margin percentage |

**Column Layout:**
- **Column B** = "This Month" (current month data)
- **Column Q** = "TOTAL" (year-to-date data)
- **Columns E-P** = Individual months (JAN-DEC)

---

## 🚀 Quick Setup (2 Minutes)

### **Option 1: Automatic (Recommended)**

1. **Open Apps Script**
   - Go to: https://script.google.com
   - Open your "Accounting Buddy" project

2. **Add the Code**
   - Open file: `CREATE_PNL_NAMED_RANGES.gs`
   - Copy ALL the code
   - Paste at the bottom of your Apps Script

3. **Run the Function**
   - Select function: `createPnLNamedRanges`
   - Click **Run** button
   - Authorize if prompted
   - Check **Execution log** (View → Logs)

4. **Verify**
   - You should see: "✅ Done! Created: 8 named ranges"
   - Run `verifyPnLNamedRanges()` to double-check

5. **Test**
   - Run `testDiscovery()` - Should show 8 ranges
   - Run `testPnLEndpoint()` - Should return P&L data
   - Visit: http://localhost:3000/pnl

---

### **Option 2: Manual (5 Minutes)**

If you prefer to create named ranges manually:

#### **Month (This Month) Ranges:**

1. **Month_Total_Revenue**
   - Click cell `B10`
   - Data → Named ranges → + Add a range
   - Name: `Month_Total_Revenue`
   - Click Done

2. **Month_Total_Overheads**
   - Click cell `B37`
   - Data → Named ranges → + Add a range
   - Name: `Month_Total_Overheads`
   - Click Done

3. **Month_GOP**
   - Click cell `B40`
   - Data → Named ranges → + Add a range
   - Name: `Month_GOP`
   - Click Done

4. **Month_EBITDA_Margin**
   - Click cell `B41`
   - Data → Named ranges → + Add a range
   - Name: `Month_EBITDA_Margin`
   - Click Done

#### **Year (Year Total) Ranges:**

5. **Year_Total_Revenue**
   - Click cell `Q10`
   - Data → Named ranges → + Add a range
   - Name: `Year_Total_Revenue`
   - Click Done

6. **Year_Total_Overheads**
   - Click cell `Q37`
   - Data → Named ranges → + Add a range
   - Name: `Year_Total_Overheads`
   - Click Done

7. **Year_GOP**
   - Click cell `Q40`
   - Data → Named ranges → + Add a range
   - Name: `Year_GOP`
   - Click Done

8. **Year_EBITDA_Margin**
   - Click cell `Q41`
   - Data → Named ranges → + Add a range
   - Name: `Year_EBITDA_Margin`
   - Click Done

---

## ✅ Verification

### **1. Check Named Ranges in Google Sheets**

1. Open your Google Sheet
2. Click **Data** → **Named ranges**
3. You should see 8 ranges listed:
   - Month_Total_Revenue → 'P&L '!B10
   - Month_Total_Overheads → 'P&L '!B37
   - Month_GOP → 'P&L '!B40
   - Month_EBITDA_Margin → 'P&L '!B41
   - Year_Total_Revenue → 'P&L '!Q10
   - Year_Total_Overheads → 'P&L '!Q37
   - Year_GOP → 'P&L '!Q40
   - Year_EBITDA_Margin → 'P&L '!Q41

### **2. Test Apps Script Discovery**

In Apps Script editor:
```javascript
// Run this function
testDiscovery();

// Check logs - should show:
// ✓ Discovered 8 named ranges (8 P&L-related)
```

### **3. Test P&L Endpoint**

In Apps Script editor:
```javascript
// Run this function
testPnLEndpoint();

// Check logs - should show:
// ✓ P&L data fetched successfully
// Month Revenue: [value]
// Year Revenue: [value]
// etc.
```

### **4. Test Next.js API**

In terminal:
```bash
curl http://localhost:3000/api/pnl/namedRanges
```

Should return:
```json
{
  "ok": true,
  "totalRanges": 8,
  "pnlRelatedCount": 8,
  "ranges": [...]
}
```

### **5. View in Browser**

1. Open: http://localhost:3000/pnl
2. Should see 8 KPI cards with real data
3. Check browser console (F12) for:
   - Match info (how ranges were found)
   - No warnings (all ranges found)
   - No errors

---

## 🎨 Expected Result

Once setup is complete, your P&L Dashboard will show:

### **Month to Date (MTD)**
- 💰 Total Revenue: ฿X,XXX.XX
- 💸 Total Overheads: ฿X,XXX.XX
- 📈 Gross Operating Profit: ฿X,XXX.XX
- 📊 EBITDA Margin: XX.XX%

### **Year to Date (YTD)**
- 💰 Total Revenue: ฿X,XXX.XX
- 💸 Total Overheads: ฿X,XXX.XX
- 📈 Gross Operating Profit: ฿X,XXX.XX
- 📊 EBITDA Margin: XX.XX%

**Features:**
- ✨ Live data from Google Sheets
- 🔄 Refresh button to update
- ⚡ 60-second caching for performance
- 📱 Mobile-responsive design
- 🌙 Dark theme with glass morphism

---

## 🐛 Troubleshooting

### **Issue: "0 named ranges found"**

**Solution:**
1. Check that you created all 8 named ranges
2. Run `verifyPnLNamedRanges()` in Apps Script
3. Make sure names match exactly (case-sensitive)

### **Issue: "Sheet 'P&L' not found"**

**Solution:**
- Your sheet name has a trailing space: "P&L "
- The code accounts for this automatically
- If you renamed the sheet, update the code

### **Issue: Values showing as 0**

**Solution:**
1. Check that cells B10, B37, B40, B41, Q10, Q37, Q40, Q41 have formulas
2. Make sure formulas are calculating correctly
3. Check for #DIV/0! errors (especially in EBITDA margin)
4. Clear cache: `POST http://localhost:3000/api/pnl/namedRanges`

### **Issue: EBITDA showing #DIV/0!**

**Solution:**
- This happens when revenue is 0
- The system will compute EBITDA automatically if the named range has an error
- Or you can fix the formula in your sheet to handle division by zero:
  ```
  =IF(B10=0, 0, B40/B10*100)
  ```

---

## 📚 Files Created

- **`CREATE_PNL_NAMED_RANGES.gs`** - Apps Script code to create ranges
- **`scripts/auto-discover-pnl.js`** - Node.js discovery script
- **`scripts/view-pnl-sheet.js`** - View sheet data
- **`APPS_SCRIPT_V5_DEPLOYMENT_GUIDE.md`** - V5 deployment guide
- **`docs/AUTOMATIC_RANGE_DISCOVERY.md`** - How automatic discovery works

---

## 🎉 Next Steps

After setup is complete:

1. ✅ **Test the dashboard** - Visit http://localhost:3000/pnl
2. 📊 **Add more KPIs** - Just create new named ranges in your sheet
3. 🔄 **Keep data updated** - Dashboard refreshes every 60 seconds
4. 📱 **Use on mobile** - Fully responsive design
5. 🚀 **Deploy to production** - When ready, deploy to Vercel/Netlify

---

## 💡 Tips

- **Naming Convention:** Use `Month_` or `Year_` prefix for clarity
- **Fuzzy Matching:** System handles variations like `MonthRevenue`, `Month_Revenue`
- **Add New KPIs:** Just create a named range, system discovers it automatically
- **Cache:** Data is cached for 60 seconds for performance
- **Refresh:** Click the refresh button (↻) to force update

---

**Last Updated:** October 26, 2025  
**Status:** Ready for Setup 🚀

