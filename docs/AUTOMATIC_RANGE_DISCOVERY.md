# Automatic Named Range Discovery

## 🎯 Overview

The P&L Dashboard uses **automatic named range discovery** to fetch KPI data from your Google Sheet. This means:

✅ **No manual configuration** - Just create named ranges in your sheet  
✅ **Flexible naming** - System handles variations automatically  
✅ **Future-proof** - Add new KPIs without code changes  
✅ **Self-healing** - Gracefully handles missing or renamed ranges  

---

## 🔍 How It Works

### 1. **Automatic Discovery**

When you request P&L data, the system:
1. Fetches all named ranges from your Google Sheet
2. Uses fuzzy matching to find relevant KPIs
3. Caches results for 60 seconds for performance
4. Returns data with warnings for missing ranges

### 2. **Fuzzy Matching Strategies**

The system tries multiple strategies to find your named ranges:

**Strategy 1: Exact Match**
- Looks for exact name: `Month_Total_Revenue`

**Strategy 2: Normalized Match**
- Removes underscores/spaces/dashes
- `Month_Total_Revenue` = `MonthTotalRevenue` = `month-total-revenue`

**Strategy 3: Partial Match**
- Checks if names contain each other
- `MonthRevenue` matches `Month_Total_Revenue`

**Strategy 4: Levenshtein Distance**
- Finds closest match by edit distance
- `Monthly_Revenue` matches `Month_Total_Revenue` (distance: 2)

### 3. **Supported Naming Patterns**

The system recognizes these patterns for each metric:

#### **Month Revenue**
- `Month_Total_Revenue` ✅ (recommended)
- `MonthRevenue`
- `Month_Revenue`
- `Monthly_Revenue`
- `month_total_revenue`
- `monthrevenue`

#### **Year Revenue**
- `Year_Total_Revenue` ✅ (recommended)
- `YearRevenue`
- `Year_Revenue`
- `Yearly_Revenue`
- `YTD_Revenue`
- `year_total_revenue`

#### **Month Overheads/Expenses**
- `Month_Total_Overheads` ✅ (recommended)
- `MonthOverheads`
- `Month_Overheads`
- `Monthly_Overheads`
- `Month_Expenses`
- `MonthExpenses`
- `Monthly_Expenses`

#### **Year Overheads/Expenses**
- `Year_Total_Overheads` ✅ (recommended)
- `YearOverheads`
- `Year_Overheads`
- `Yearly_Overheads`
- `Year_Expenses`
- `YearExpenses`
- `YTD_Expenses`

#### **Month GOP (Gross Operating Profit)**
- `Month_GOP` ✅ (recommended)
- `MonthGOP`
- `Month_Profit`
- `Monthly_Profit`
- `Month_Gross_Operating_Profit`
- `MonthGrossOperatingProfit`

#### **Year GOP**
- `Year_GOP` ✅ (recommended)
- `YearGOP`
- `Year_Profit`
- `Yearly_Profit`
- `Year_Gross_Operating_Profit`
- `YTD_Profit`

#### **Month EBITDA Margin** (Optional)
- `Month_EBITDA_Margin` ✅ (recommended)
- `MonthEBITDA`
- `Month_EBITDA`
- `Monthly_EBITDA`
- `MonthEBITDAMargin`

*If not provided, system computes: `(GOP / Revenue) × 100`*

#### **Year EBITDA Margin** (Optional)
- `Year_EBITDA_Margin` ✅ (recommended)
- `YearEBITDA`
- `Year_EBITDA`
- `Yearly_EBITDA`
- `YTD_EBITDA`

*If not provided, system computes: `(GOP / Revenue) × 100`*

---

## 📝 How to Add a New KPI

### **Step 1: Create Named Range in Google Sheet**

1. Open your Google Sheet
2. Click on the cell with the KPI value (e.g., `B5`)
3. Click **Data** → **Named ranges**
4. Click **+ Add a range**
5. Enter a recognizable name (e.g., `Month_Total_Revenue`)
6. Click **Done**

### **Step 2: That's It!**

The system will automatically:
- Discover the new named range within 60 seconds
- Match it to the appropriate KPI using fuzzy matching
- Display it in the P&L Dashboard

**No code changes needed!** 🎉

---

## 🔧 Admin Tools

### **Discovery Endpoint**

View all named ranges in your sheet:

```bash
# In browser or API client
GET http://localhost:3000/api/pnl/namedRanges
```

**Response:**
```json
{
  "ok": true,
  "totalRanges": 15,
  "pnlRelatedCount": 8,
  "ranges": [
    {
      "name": "Month_Total_Revenue",
      "sheet": "P&L",
      "a1": "B5",
      "value": 50000,
      "type": "number"
    },
    ...
  ],
  "pnlRelated": [...],
  "suggestions": [...]
}
```

### **Force Refresh**

Clear cache and fetch fresh data:

```bash
POST http://localhost:3000/api/pnl/namedRanges
```

---

## ⚠️ Warnings & Fallbacks

### **Missing Ranges**

If a required range is not found, the system:
- Logs a warning in the response
- Returns `0` for that metric
- Continues processing other metrics
- **Does not crash** ✅

**Example Response:**
```json
{
  "ok": true,
  "data": {
    "month": {
      "revenue": 50000,
      "overheads": 0,
      "gop": 20000,
      "ebitdaMargin": 40
    }
  },
  "warnings": [
    "Missing: Month Overheads (tried: Month_Total_Overheads, MonthOverheads, ...)"
  ]
}
```

### **Computed Fallbacks**

If EBITDA margins are missing, the system computes them:

**Example Response:**
```json
{
  "ok": true,
  "data": {
    "month": {
      "revenue": 50000,
      "overheads": 30000,
      "gop": 20000,
      "ebitdaMargin": 40
    }
  },
  "computedFallbacks": [
    "Month EBITDA Margin (computed: 40.00%)"
  ]
}
```

---

## 🚀 Performance

### **Caching Strategy**

The system uses two levels of caching:

**1. Named Range Map Cache (60s)**
- Caches the list of all named ranges
- Reduces API calls to Google Sheets
- Managed by Apps Script `CacheService`

**2. P&L Data Cache (60s)**
- Caches the computed P&L response
- Reduces processing time
- Managed by Apps Script `CacheService`

**Cache Behavior:**
- First request: ~2-3 seconds (fetches from Sheet)
- Cached requests: <500ms (returns cached data)
- After 60s: Automatically refreshes

### **Manual Cache Clear**

To force a fresh fetch:
```bash
POST http://localhost:3000/api/pnl/namedRanges
```

Or in Apps Script editor:
```javascript
clearAllCaches();
```

---

## 🐛 Debugging

### **Check What Ranges Were Found**

1. Open browser console (F12)
2. Navigate to `/pnl` page
3. Check the response in Network tab
4. Look for `matchInfo` field:

```json
{
  "matchInfo": {
    "monthRevenue": {
      "name": "Month_Total_Revenue",
      "type": "exact"
    },
    "yearRevenue": {
      "name": "YearRevenue",
      "type": "normalized"
    }
  }
}
```

**Match Types:**
- `exact` - Perfect match
- `normalized` - Match after removing underscores/spaces
- `partial` - Substring match
- `levenshtein` - Closest match by edit distance

### **View All Named Ranges**

```bash
GET http://localhost:3000/api/pnl/namedRanges
```

This shows:
- All named ranges in your sheet
- Which ones are P&L-related
- Their current values
- Suggestions for missing ranges

### **Apps Script Logs**

1. Open Apps Script editor
2. Run `testPnLEndpoint()` function
3. View → Logs (or Cmd+Enter)
4. Check for:
   - `✓` Success messages
   - `⚠` Warnings
   - `→` Computed fallbacks

---

## 📊 Example Setup

### **Recommended Named Ranges**

Create these 6 required ranges:

| Named Range | Cell | Description |
|------------|------|-------------|
| `Month_Total_Revenue` | `'P&L'!B5` | Current month revenue |
| `Year_Total_Revenue` | `'P&L'!C5` | Year-to-date revenue |
| `Month_Total_Overheads` | `'P&L'!B10` | Current month expenses |
| `Year_Total_Overheads` | `'P&L'!C10` | Year-to-date expenses |
| `Month_GOP` | `'P&L'!B15` | Current month profit |
| `Year_GOP` | `'P&L'!C15` | Year-to-date profit |

**Optional (will be computed if missing):**
- `Month_EBITDA_Margin` → `'P&L'!B20`
- `Year_EBITDA_Margin` → `'P&L'!C20`

---

## ✅ Benefits

### **1. No Manual Configuration**
- Just create named ranges in your sheet
- System discovers them automatically
- No code changes needed

### **2. Flexible Naming**
- Use any naming convention you prefer
- System handles variations automatically
- Case-insensitive matching

### **3. Future-Proof**
- Add new KPIs anytime
- Rename existing ranges without breaking
- System adapts automatically

### **4. Self-Healing**
- Missing ranges don't crash the system
- Warnings help you identify issues
- Computed fallbacks for EBITDA

### **5. Easy Debugging**
- Admin endpoint shows all ranges
- Match info shows how ranges were found
- Clear warnings and suggestions

---

## 🎓 Best Practices

### **1. Use Recommended Names**
For best performance, use the recommended naming pattern:
- `Month_Total_Revenue`
- `Year_Total_Revenue`
- etc.

This ensures exact matches (fastest).

### **2. Keep Names Descriptive**
Include keywords like:
- `Month` or `Year` for period
- `Revenue`, `Overheads`, `GOP`, `EBITDA` for metric type
- `Total` for clarity

### **3. Test After Creating Ranges**
1. Create named range
2. Wait 60 seconds (cache expiry)
3. Refresh `/pnl` page
4. Check if value appears

### **4. Use Discovery Endpoint**
Before deploying, verify all ranges:
```bash
GET http://localhost:3000/api/pnl/namedRanges
```

---

## 🆘 Troubleshooting

### **Issue: Range not found**

**Solution:**
1. Check range exists: Data → Named ranges
2. Check spelling matches patterns above
3. Use discovery endpoint to see all ranges
4. Check `matchInfo` to see what was found

### **Issue: Wrong value displayed**

**Solution:**
1. Check named range points to correct cell
2. Check cell contains numeric value
3. Clear cache: `POST /api/pnl/namedRanges`
4. Refresh page

### **Issue: Slow performance**

**Solution:**
- First load is always slow (~2-3s)
- Subsequent loads use cache (<500ms)
- Cache expires after 60s
- This is normal behavior

---

## 📚 Related Documentation

- [PNL_NAMED_RANGES.md](PNL_NAMED_RANGES.md) - Manual setup guide
- [PNL_FEATURE_REPORT.md](../PNL_FEATURE_REPORT.md) - Feature overview
- [APPS_SCRIPT_DEPLOYMENT_GUIDE.md](../APPS_SCRIPT_DEPLOYMENT_GUIDE.md) - Deployment instructions

---

**Last Updated:** October 26, 2025  
**Version:** 5.0 - Automatic Discovery

