# P&L Dashboard - Property/Person Section Update

**Date:** October 28, 2025  
**Update:** Added Property/Person expense tracking to P&L Dashboard

---

## 🆕 What's New

Added **Property/Person expense tracking** to the P&L Dashboard, displaying both monthly and yearly totals for property-specific and person-specific expenses.

### **New KPI Cards Added:**
- **Property/Person Expense (MTD)** - Monthly property and person expenses
- **Property/Person Expense (YTD)** - Year-to-date property and person expenses

---

## 📊 Updated P&L Structure

The P&L Dashboard now displays **5 KPI cards** per period (instead of 4):

### **Month to Date Section:**
1. Total Revenue
2. Total Overheads  
3. **Property/Person Expense** ← NEW
4. Gross Operating Profit
5. EBITDA Margin

### **Year to Date Section:**
1. Total Revenue
2. Total Overheads
3. **Property/Person Expense** ← NEW  
4. Gross Operating Profit
5. EBITDA Margin

---

## 🏠 Property/Person Items Tracked

Based on the Google Sheets "P&L" sheet structure:

| Property/Person Item | Type | Row |
|---------------------|------|-----|
| **Sia Moon - Land - General** | Property | 14 |
| **Alesia House** | Property | 15 |
| **Lanna House** | Property | 16 |
| **Parents House** | Property | 17 |
| **Shaun Ducker** | Person | 18 |
| **Maria Ren** | Person | 19 |
| **Total Property or Person Expense** | Summary | 20 |

---

## 🔧 Technical Changes Made

### **1. Frontend Updates (app/pnl/page.tsx)**
- Updated `PnLPeriodData` interface to include `propertyPersonExpense: number`
- Added new KPI cards for Property/Person expenses
- Changed grid layout from `lg:grid-cols-4` to `lg:grid-cols-5` to accommodate new cards
- Updated both Month and Year sections

### **2. API Updates (app/api/pnl/route.ts)** 
- Updated `PnLPeriodData` interface to include `propertyPersonExpense: number`
- API now expects and returns the new property/person expense data

### **3. Apps Script Updates (APPS_SCRIPT_CODE_V5_DYNAMIC_PNL.js)**
- Added new fuzzy matching patterns for Property/Person expenses:
  - `monthPropertyPerson`: Multiple naming variations for monthly data
  - `yearPropertyPerson`: Multiple naming variations for yearly data
- Updated discovery logic to find and validate Property/Person ranges
- Added warnings for missing Property/Person ranges
- Updated return data structure to include `propertyPersonExpense` fields

### **4. Named Ranges Updates (CREATE_PNL_NAMED_RANGES.gs)**
- **Updated existing ranges** to reflect new row positions after Property/Person section:
  - `Month_Total_Revenue`: B10 → **B11**
  - `Month_Total_Overheads`: B37 → **B46** 
  - `Month_GOP`: B40 → **B49**
  - `Month_EBITDA_Margin`: B41 → **B50**
  - `Year_Total_Revenue`: Q10 → **Q11**
  - `Year_Total_Overheads`: Q37 → **Q46**
  - `Year_GOP`: Q40 → **Q49** 
  - `Year_EBITDA_Margin`: Q41 → **Q50**

- **Added new ranges** for Property/Person section:
  - `Month_Property_Person_Expense`: **B20** (This Month total)
  - `Year_Property_Person_Expense`: **Q20** (Year Total)

---

## 🚀 Deployment Steps

### **1. Update Named Ranges in Google Sheets**
```javascript
// Run this in Apps Script to create/update all named ranges:
createPnLNamedRanges()
```

### **2. Deploy Updated Apps Script**
- Copy the updated `APPS_SCRIPT_CODE_V5_DYNAMIC_PNL.js` 
- Paste into your existing Apps Script project
- Deploy the changes (URL stays the same)

### **3. Deploy Frontend Changes**
```bash
npm run build
git add .
git commit -m "feat: add Property/Person expense tracking to P&L dashboard"
git push
# Deploy to Vercel (automatic)
```

---

## ✅ Expected Results

After deployment, the P&L Dashboard will show:

- **5 KPI cards** per period (Month/Year)
- **Property/Person expense totals** alongside other financial metrics
- **Responsive grid layout** that works on mobile and desktop
- **Live data** from Google Sheets Property/Person section totals
- **Proper error handling** and warnings for missing data

---

## 🔍 Testing

1. **Visit P&L Dashboard:** `/pnl` route
2. **Verify 5 cards** are displayed in each section
3. **Check Property/Person values** show current totals from row 20
4. **Test responsive layout** on different screen sizes
5. **Verify API response** includes `propertyPersonExpense` fields

---

## 📈 Business Impact

This update provides **enhanced financial visibility** by separating:
- **Property-specific expenses** (real estate, land, houses)
- **Person-specific expenses** (individual costs)
- **General overhead expenses** (utilities, admin, etc.)

This granular tracking enables better:
- **Cost allocation** across properties and individuals
- **ROI analysis** for each property
- **Personal expense tracking** for family members
- **Comprehensive financial reporting** with detailed breakdowns

The P&L Dashboard now provides a **complete financial overview** with all major expense categories clearly separated and tracked! 🎉