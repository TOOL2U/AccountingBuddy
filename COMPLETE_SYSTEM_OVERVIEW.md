# Complete System Overview - AI & Data Flow

## 🎯 **Current System Architecture**

### **Environment Variables**
```
GOOGLE_SHEET_ID=1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec
SHEETS_WEBHOOK_SECRET=VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=
OPENAI_API_KEY=sk-proj-...
GOOGLE_VISION_KEY=AIzaSyCloPZlRjHB0-3c57WX7AN7uOnyODSOlc0
```

---

## 📊 **Data Sources**

### **1. Google Sheet: "Accounting Buddy P&L 2025"**
**Sheet ID:** `1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8`

**Structure:**
- **Header Row:** Row 6
- **Data Starts:** Row 7
- **Columns:**
  - A: (empty)
  - B: day
  - C: month
  - D: year
  - E: property (dropdown validation)
  - F: typeOfOperation (dropdown validation)
  - G: typeOfPayment (dropdown validation)
  - H: detail
  - I: ref
  - J: debit
  - K: credit

**Validation Ranges (from live sheet):**
- Property: `'P&L'!$B$2:$B$7` (6 options)
- Type of Operation: `'P&L'!$C$2:$C$29` (28 options)
- Type of Payment: `'P&L'!$D$2:$D$4` (3 options)

---

### **2. Local Config: `config/options.json`**
**Purpose:** Local cache of dropdown options + keyword mappings

**Structure:**
```json
{
  "properties": [6 items],
  "typeOfOperation": [28 items],
  "typeOfPayment": [3 items],
  "keywords": {
    "properties": { ... },
    "typeOfOperation": { ... },
    "typeOfPayment": { ... }
  }
}
```

**Total Keywords:** ~255 keyword mappings
- Properties: ~40 keywords
- Type of Operation: ~200 keywords
- Type of Payment: ~15 keywords

---

## 🔄 **Data Flow**

### **Upload Flow (OCR → AI → Review → Sheets)**

```
1. User uploads image
   ↓
2. /api/ocr (Google Vision API)
   → Extracts text from image
   ↓
3. /api/extract (OpenAI GPT-4o)
   → Uses HARDCODED prompt with keyword hints
   → Returns structured JSON
   ↓
4. /review page
   → User reviews/edits data
   → Dropdowns populated from config/options.json
   ↓
5. /api/sheets (Google Apps Script webhook)
   → Sends data to Google Sheet
   → Appends to row 7+
```

### **Manual Entry Flow (Text → Parser → Review → Sheets)**

```
1. User types command (e.g., "wall 5000 cash")
   ↓
2. utils/manualParse.ts
   → Uses utils/matchOption.ts
   → Matches keywords from config/options.json
   → Returns structured data
   ↓
3. /review page
   → User reviews/edits
   ↓
4. /api/sheets
   → Sends to Google Sheet
```

---

## 🤖 **AI Implementations**

### **1. Main AI Extraction** ✅ **ACTIVE**
**File:** `app/api/extract/route.ts`
**Model:** GPT-4o
**Temperature:** 0.1
**Max Tokens:** 800

**Prompt:** Hardcoded inline (lines 111-216)
**Keywords:** Hardcoded examples in prompt text
**Dropdown Options:** Injected from `getOptions()` (config/options.json)

**Current Behavior:**
- Fetches dropdown options from local config
- Uses hardcoded prompt with keyword examples
- Returns structured JSON with confidence scores

---

### **2. Enhanced Prompt Utility** ❌ **NOT USED**
**File:** `utils/enhancedPrompt.ts`
**Status:** Exported but never imported
**Recommendation:** DELETE or UPDATE

---

### **3. Manual Entry Parser** ✅ **ACTIVE**
**File:** `utils/manualParse.ts`
**Uses:** `utils/matchOption.ts`
**Keywords:** From `config/options.json`

**Functions:**
- `parseManualEntry(input)` - Main parser
- `extractProperty(input)` - Match property keywords
- `extractOperation(input)` - Match operation keywords
- `extractPayment(input)` - Match payment keywords

---

### **4. Keyword Matching Engine** ✅ **ACTIVE**
**File:** `utils/matchOption.ts`
**Algorithm:** Levenshtein distance + keyword matching

**Functions:**
- `matchProperty(input, comment?)` - Returns { value, confidence, matched }
- `matchTypeOfOperation(input, comment?)` - Returns { value, confidence, matched }
- `matchTypeOfPayment(input)` - Returns { value, confidence, matched }
- `matchKeywords(input, keywords[])` - Fuzzy matching with scoring

**Scoring:**
- Exact match: 1.0
- Contains match: 0.9
- Word boundary match: 0.95
- Fuzzy similarity (>0.8): 0.9 * similarity
- Threshold for "matched": 0.8

---

### **5. AI Test Console** ✅ **NEW**
**File:** `app/api/ai/test/route.ts`
**Model:** GPT-4o
**Prompt Source:** Google Sheets `AI_Prompts` named range (dynamic)

**Features:**
- Fetches prompt from Sheets before testing
- Supports custom prompts
- Returns response time and token usage

---

## 📋 **Google Apps Script V7.0**

**File:** `COMPLETE_APPS_SCRIPT_V6_FINAL.js`
**Deployment URL:** `https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec`

**Endpoints:**
1. `{ action: "webhook", ... }` - Append accounting data
2. `{ action: "getPnL", ... }` - Fetch P&L data
3. `{ action: "getInbox", ... }` - Fetch all entries
4. `{ action: "deleteEntry", rowNumber: X }` - Delete entry
5. `{ action: "list_named_ranges", ... }` - Discover named ranges
6. `{ action: "getPrompt", ... }` - Get AI prompt ✨ NEW
7. `{ action: "updatePrompt", prompt: "..." }` - Update AI prompt ✨ NEW
8. `{ action: "getRules", ... }` - Get keyword rules ✨ NEW
9. `{ action: "updateRules", rules: [...] }` - Update keyword rules ✨ NEW

**Named Ranges Required:**
- ✅ Existing: P&L metrics (Total_Expenses, Total_Revenue, etc.)
- ⚠️ **PENDING:** `AI_Prompts` (single cell with prompt text)
- ⚠️ **PENDING:** `AI_KeywordRules` (table: keyword | category | priority)

---

## 🎯 **Keyword Data Consistency**

### **Current State:**

**Source 1: `config/options.json`**
- ✅ 255+ keyword mappings
- ✅ Used by manual entry parser
- ✅ Used by fuzzy matching engine
- ✅ Synced from Google Sheet validation ranges

**Source 2: `app/api/extract/route.ts` (hardcoded prompt)**
- ⚠️ ~30 keyword examples hardcoded in prompt
- ⚠️ Some category names don't match options.json
- ⚠️ Not synced with options.json

**Source 3: Google Sheets (PENDING)**
- ⚠️ `AI_Prompts` named range - NOT YET CREATED
- ⚠️ `AI_KeywordRules` named range - NOT YET CREATED

---

## ✅ **Recommended Architecture**

### **Single Source of Truth: Google Sheets**

```
Google Sheets
├── AI_Prompts (named range)
│   └── Single cell with full AI extraction prompt
│
└── AI_KeywordRules (named range)
    └── Table: keyword | category | priority
        ├── wall | EXP - Construction - Wall | 100
        ├── salary | EXP - HR - Employees Salaries | 100
        └── ... (255+ rows)
```

### **Data Flow:**

```
Google Sheets (source of truth)
    ↓
app/api/ai/prompts (fetch prompt)
    ↓
app/api/extract (use dynamic prompt)
    ↓
OpenAI GPT-4o (extraction)
```

### **Benefits:**
- ✅ Single source of truth
- ✅ No code deployment needed to update keywords
- ✅ Editable from web UI (Admin → AI section)
- ✅ Consistent across all AI implementations
- ✅ Version controlled in Google Sheets (revision history)

---

## 📝 **Action Items**

### **High Priority:**

1. **Create `AI_Prompts` named range in Google Sheets**
   - Location: Any cell (e.g., Config sheet, cell A1)
   - Content: Full AI extraction prompt (see AI_IMPLEMENTATION_AUDIT.md)
   - Include dynamic dropdown injection placeholders

2. **Create `AI_KeywordRules` named range in Google Sheets**
   - Location: Config sheet, columns C:E
   - Headers: keyword | category | priority
   - Content: All 255+ keywords from `config/options.json`
   - Use `EXISTING_KEYWORDS_FOR_AI_RULES.md` as reference

3. **Update `app/api/extract/route.ts`**
   - Fetch prompt from Google Sheets before calling OpenAI
   - Add 60-second cache to avoid excessive API calls
   - Add fallback to hardcoded prompt if Sheets unavailable

4. **Test end-to-end**
   - Upload receipt → verify AI extraction uses new prompt
   - Manual entry → verify still works
   - Admin → AI → verify all tabs work

### **Medium Priority:**

5. **Delete `utils/enhancedPrompt.ts`** (not being used)
6. **Add prompt caching** (60-second TTL)
7. **Add validation** to ensure keywords map to valid categories

### **Low Priority:**

8. **Document** new prompt management system
9. **Add UI** to preview keyword usage in prompt
10. **Add analytics** to track keyword match rates

---

## 🔍 **Scripts Available**

**Sync from Google Sheets:**
- `scripts/fetch-live-dropdowns.js` - Fetch dropdown options from Sheet validation rules
- `scripts/sync-from-sheets.js` - Sync dropdown data to local config

**Testing:**
- `scripts/test-manual-parser.mjs` - Test manual entry parser
- `scripts/test-ai-training.js` - Test AI extraction
- `scripts/test-keywords-simple.js` - Test keyword matching

**Discovery:**
- `scripts/auto-discover-pnl.js` - Discover P&L named ranges
- `scripts/view-pnl-sheet.js` - View P&L sheet structure

---

## 🎯 **Next Steps**

1. **Review this document** - Confirm understanding
2. **Create named ranges** in Google Sheets
3. **Populate `AI_KeywordRules`** with existing keywords
4. **Update extract API** to use dynamic prompt
5. **Test thoroughly** with real receipts

---

**Status:** Ready to implement unified AI prompt system! 🚀

