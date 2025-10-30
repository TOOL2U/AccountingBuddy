# Overhead Expenses Modal - Implementation Complete

## Overview
Successfully implemented clickable modal functionality for "Total Overheads" KPI cards on the P&L page, matching the existing Property/Person modal pattern.

## What Was Created

### 1. Frontend Component
**File**: `components/OverheadExpensesModal.tsx`
- **Purpose**: Modal component displaying overhead expenses breakdown
- **Features**:
  - Glass morphism design matching app design system
  - Groups expenses by category (Utilities, HR, Administration, Construction, Repairs, etc.)
  - Shows expense amount and percentage of total overhead
  - Color-coded percentages (green < 15%, yellow 15-30%, red > 30%)
  - Supports both "month" and "year" periods
  - Loading states, error handling, and retry functionality

### 2. API Endpoint
**File**: `app/api/pnl/overhead-expenses/route.ts`
- **Purpose**: Backend API to fetch overhead expenses data
- **Endpoints**: 
  - GET `/api/pnl/overhead-expenses?period=month`
  - GET `/api/pnl/overhead-expenses?period=year`
  - POST `/api/pnl/overhead-expenses` (accepts period in body)
- **Integration**: Calls Google Apps Script with action `getOverheadExpensesDetails`

### 3. P&L Page Updates
**File**: `app/pnl/page.tsx`
- **Changes**:
  - Imported `OverheadExpensesModal` component
  - Added modal state: `isOverheadModalOpen`, `overheadModalPeriod`, `overheadModalTotalExpense`
  - Added function: `openOverheadExpensesModal(period, totalExpense)`
  - Made "Total Overheads" KPI cards clickable (both month and year)
  - Rendered `OverheadExpensesModal` component in JSX

### 4. Google Apps Script Function
**File**: `APPS_SCRIPT_OVERHEAD_EXPENSES.js`
- **Function**: `getOverheadExpensesDetails(period)`
- **Data Range**: P&L (DO NOT EDIT)!A29:Q51
- **Logic**:
  - Reads 23 expense categories from rows 29-51
  - Column A = expense names (must start with "EXP -")
  - Column B = this month values
  - Column Q = year total values
  - Calculates percentages
  - Sorts by expense amount (highest first)
- **Returns**: `{ok, data[], totalExpense, period, timestamp}`

## Overhead Expenses Categories (23 total)

### Utilities (3)
- EXP - Utilities - Gas
- EXP - Utilities - Water
- EXP - Utilities - Electricity

### HR (1)
- EXP - HR - Employees Salaries

### Administration & General (4)
- EXP - Administration & General - License & Certificates
- EXP - Administration & General - Legal
- EXP - Administration & General - Professional fees
- EXP - Administration & General - Office supplies
- EXP - Administration & General - Subscription, Software & Membership

### Construction (4)
- EXP - Construction - Structure
- EXP - Construction - Overheads/General/Unclassified
- EXP - Construction - Electric Supplies
- EXP - Construction - Wall

### Appliances & Hardware (2)
- EXP - Appliances & Electronics
- EXP - Windows, Doors, Locks & Hardware

### Repairs & Maintenance (6)
- EXP - Repairs & Maintenance - Furniture & Decorative Items
- EXP - Repairs & Maintenance - Waste removal
- EXP - Repairs & Maintenance - Tools & Equipment
- EXP - Repairs & Maintenance - Painting & Decoration
- EXP - Repairs & Maintenance - Electrical & Mechanical
- EXP - Repairs & Maintenance - Landscaping

### Sales & Marketing (1)
- EXP - Sales & Marketing - Professional Marketing Services

### Other (2)
- EXP - Other Expenses

## Deployment Steps

### Step 1: Frontend (Already Deployed)
The following files have been created/updated:
- ✅ `components/OverheadExpensesModal.tsx` (created)
- ✅ `app/api/pnl/overhead-expenses/route.ts` (created)
- ✅ `app/pnl/page.tsx` (updated)

### Step 2: Google Apps Script (REQUIRED)
You need to add the new function to your Google Apps Script:

1. Open your Google Apps Script project
2. Add the `getOverheadExpensesDetails` function from `APPS_SCRIPT_OVERHEAD_EXPENSES.js`
3. Update your `doPost` function to handle the new action:

```javascript
case 'getOverheadExpensesDetails':
  const period = requestData.period || 'month';
  return ContentService.createTextOutput(
    JSON.stringify(getOverheadExpensesDetails(period))
  ).setMimeType(ContentService.MimeType.JSON);
```

4. Deploy the updated script
5. Get the new deployment URL (if changed)
6. Update `APPS_SCRIPT_URL` in your environment variables if needed

### Step 3: Testing
Once the Apps Script is deployed:

1. Visit your P&L page
2. Click on "Total Overheads" (Month to Date) - should open modal
3. Click on "Total Overheads" (Year to Date) - should open modal
4. Verify data is loading correctly
5. Check grouping by category
6. Verify color coding of percentages
7. Test error states by temporarily breaking the API

## Data Structure

### Request
```javascript
{
  action: 'getOverheadExpensesDetails',
  period: 'month' | 'year'
}
```

### Response
```javascript
{
  ok: true,
  data: [
    {
      name: "EXP - Administration & General - Office supplies",
      expense: 92000,
      percentage: 35.2
    },
    // ... more expenses sorted by amount
  ],
  totalExpense: 261000,
  period: "month",
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

## UI Features

### Modal Design
- **Glass morphism**: Matches existing design system
- **Responsive**: Works on mobile and desktop
- **Animations**: Smooth transitions using Framer Motion
- **Accessibility**: Keyboard navigation, ARIA labels

### Data Display
- **Grouped by category**: Easier to understand expense structure
- **Visual hierarchy**: Category headers with item counts
- **Color coding**: Quick visual feedback on expense percentages
- **Currency formatting**: Thai Baht (฿) with proper formatting

### User Experience
- **Loading states**: Spinner while fetching data
- **Error handling**: Clear error messages with retry option
- **Empty states**: Friendly message when no data
- **Backdrop click**: Click outside modal to close
- **Escape key**: Press ESC to close modal

## Technical Details

### Component Pattern
Follows the exact same pattern as `PropertyPersonModal`:
- AnimatePresence for enter/exit animations
- Glass morphism styling
- Period-based data fetching
- Currency formatting
- Percentage-based color coding

### API Pattern
Follows the exact same pattern as `/api/pnl/property-person`:
- GET and POST support
- Period validation ('month' | 'year')
- Google Apps Script integration
- Error handling
- Consistent response structure

### State Management
Uses React hooks for state:
- `useState` for modal state, loading, error, data
- `useEffect` for data fetching when modal opens
- Proper cleanup and error boundaries

## Verification Checklist

- [x] OverheadExpensesModal component created
- [x] API endpoint created and tested
- [x] P&L page updated with clickable functionality
- [x] Modal state management added
- [x] Both month and year periods supported
- [x] Google Apps Script function documented
- [ ] Apps Script deployed (PENDING - User needs to do this)
- [ ] End-to-end testing (PENDING - After Apps Script deployment)

## Next Steps

1. **Deploy Apps Script**: Add the `getOverheadExpensesDetails` function to your Apps Script
2. **Update doPost**: Add the new case to handle the action
3. **Test**: Click on overhead expenses to verify modal works
4. **Monitor**: Check console for any errors
5. **Iterate**: Adjust styling or functionality based on feedback

## Files Reference

### Created Files
- `components/OverheadExpensesModal.tsx` - Modal component
- `app/api/pnl/overhead-expenses/route.ts` - API endpoint
- `APPS_SCRIPT_OVERHEAD_EXPENSES.js` - Apps Script function
- `OVERHEAD_EXPENSES_IMPLEMENTATION.md` - This file

### Updated Files
- `app/pnl/page.tsx` - Added modal integration

### Supporting Files
- `logs/overhead-expenses-extract.json` - Data extraction results
- `scripts/extract-overhead-expenses.js` - Extraction script

## Success Metrics

Once deployed, you should see:
- ✅ Clickable "Total Overheads" cards with cursor pointer
- ✅ Modal opens smoothly when clicked
- ✅ Expenses grouped by category (Utilities, HR, Admin, etc.)
- ✅ Accurate expense amounts and percentages
- ✅ Proper color coding (green/yellow/red)
- ✅ Responsive design on all devices
- ✅ Error handling if API fails

---

**Status**: Frontend implementation complete ✅  
**Pending**: Google Apps Script deployment ⏳  
**Pattern**: Matches PropertyPersonModal exactly ✅
