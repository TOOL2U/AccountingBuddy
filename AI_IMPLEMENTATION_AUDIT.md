# AI Implementation Audit - Data Consistency Check

## 🎯 Objective

Ensure all AI implementations use the same keyword data that will be stored in Google Sheets `AI_KeywordRules`.

---

## 📊 Current AI Implementations Found

### **1. Main AI Extraction API** ✅ **ACTIVE**
**File:** `app/api/extract/route.ts`
**Status:** Currently in use for OCR → AI extraction
**Prompt Location:** Hardcoded inline (lines 111-216)
**Keywords:** Hardcoded in prompt text

**Keyword Examples from Prompt:**
```javascript
2. Operation Categories (prioritize more specific matches):
   - "electric supplies", "electrical supplies", "electric materials", "cable", "wire" → "EXP - Construction - Electric Supplies"
   - "electric bill", "electricity bill", "power bill" → "EXP - Utilities  - Electricity"
   - "wall", "materials", "construction" → "EXP - Construction - Wall"
   - "aircon", "air purifier", "electronics" → "EXP - Appliances & Electronics"
   - "door", "window", "lock", "hardware" → "EXP - Windows, Doors, Locks & Hardware"
   - "furniture", "decorative", "decor", "decoration" → "EXP - Repairs & Maintenance  - Furniture & Decorative Items"
   - "painting", "paint", "painter" → "EXP - Repairs & Maintenance - Painting & Decoration"
   - "salary", "salaries", "staff" → "EXP - HR - Employees Salaries"
```

**Data Source:** Uses `getOptions()` from `utils/matchOption.ts` to inject live dropdown values

---

### **2. Enhanced Prompt Utility** ❌ **NOT USED**
**File:** `utils/enhancedPrompt.ts`
**Status:** Exported but **NOT IMPORTED ANYWHERE**
**Function:** `ENHANCED_EXTRACTION_PROMPT()`

**Finding:** This file contains a similar prompt with keyword mappings, but it's **not being used** in the codebase. It appears to be legacy code or an alternative implementation that was never activated.

**Recommendation:** ⚠️ **DELETE or UPDATE** this file to avoid confusion.

---

### **3. Manual Entry Parser** ✅ **ACTIVE**
**File:** `utils/manualParse.ts`
**Status:** Currently in use for manual text entry
**Keywords:** Uses `matchTypeOfOperation()` from `utils/matchOption.ts`

**Data Source:** `config/options.json` → `keywords.typeOfOperation`

---

### **4. Keyword Matching System** ✅ **ACTIVE**
**File:** `utils/matchOption.ts`
**Status:** Core matching engine used by both AI and manual entry
**Functions:**
- `matchProperty()` - Matches property names
- `matchTypeOfOperation()` - Matches operation categories
- `matchTypeOfPayment()` - Matches payment methods

**Data Source:** `config/options.json` → `keywords` object

---

### **5. AI Test Console** ✅ **ACTIVE**
**File:** `app/api/ai/test/route.ts`
**Status:** New - uses prompt from Google Sheets
**Prompt Location:** Fetches from Google Sheets `AI_Prompts` named range

**Data Source:** Google Sheets (dynamic)

---

## 🔍 Data Source Analysis

### **Current Keyword Storage:**

```
config/options.json
└── keywords
    ├── properties (6 properties, ~40 keywords)
    ├── typeOfOperation (28 categories, ~200 keywords)
    └── typeOfPayment (3 methods, ~15 keywords)
```

**Total Keywords:** ~255 keyword mappings

---

## ⚠️ **INCONSISTENCY FOUND!**

### **Problem:**

The **main AI extraction API** (`app/api/extract/route.ts`) has **hardcoded keywords** in the prompt that are **similar but not identical** to the keywords in `config/options.json`.

### **Example Discrepancy:**

**In `app/api/extract/route.ts` (hardcoded):**
```javascript
- "pillow", "decor", "decoration", "elephant" → "EXP - Decor"
```

**In `config/options.json`:**
```json
"EXP - Repairs & Maintenance  - Furniture & Decorative Items": [
  "furniture", "decorative", "decor", "decoration", "pillow", ...
]
```

**Issue:** The hardcoded prompt uses `"EXP - Decor"` which **doesn't exist** in the dropdown options!

---

## ✅ **SOLUTION: Unified AI Prompt System**

### **Recommended Architecture:**

```
Google Sheets AI_Prompts (single source of truth)
    ↓
app/api/extract/route.ts (fetch prompt from Sheets)
    ↓
OpenAI API (uses dynamic prompt)
```

### **Implementation Steps:**

#### **Step 1: Update `app/api/extract/route.ts`**

**Current:** Hardcoded prompt inline
**New:** Fetch prompt from Google Sheets before calling OpenAI

**Pseudocode:**
```typescript
async function callOpenAI(text: string, comment?: string) {
  // Fetch prompt from Google Sheets
  const promptResponse = await fetch(process.env.SHEETS_WEBHOOK_URL!, {
    method: 'POST',
    body: JSON.stringify({
      action: 'getPrompt',
      secret: process.env.SHEETS_WEBHOOK_SECRET
    })
  });
  
  const { prompt: systemPrompt } = await promptResponse.json();
  
  // Use fetched prompt instead of hardcoded one
  const response = await fetch(OPENAI_API_URL, {
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]
    })
  });
}
```

#### **Step 2: Create Master Prompt for Google Sheets**

Use the prompt from `app/api/extract/route.ts` as the base, but:
1. ✅ Verify all category names match `config/options.json`
2. ✅ Include all keywords from `config/options.json`
3. ✅ Add dynamic dropdown injection (properties, operations, payments)
4. ✅ Store in Google Sheets `AI_Prompts` named range

#### **Step 3: Populate `AI_KeywordRules` from `config/options.json`**

Extract all keywords from `config/options.json` and populate the Google Sheets table.

**Already done!** See `EXISTING_KEYWORDS_FOR_AI_RULES.md`

---

## 📋 **Action Items**

### **High Priority:**

- [ ] **Update `app/api/extract/route.ts`** to fetch prompt from Google Sheets instead of using hardcoded prompt
- [ ] **Create master AI prompt** in Google Sheets `AI_Prompts` based on current prompt but with verified category names
- [ ] **Populate `AI_KeywordRules`** with all 130+ keywords from `config/options.json`
- [ ] **Delete or deprecate** `utils/enhancedPrompt.ts` (not being used)

### **Medium Priority:**

- [ ] **Add caching** to prompt fetching (60-second TTL) to avoid hitting Google Sheets on every extraction
- [ ] **Add fallback** to hardcoded prompt if Google Sheets is unavailable
- [ ] **Test** AI extraction with new dynamic prompt system

### **Low Priority:**

- [ ] **Document** the new prompt management system
- [ ] **Add UI** to preview how keywords will be used in the prompt
- [ ] **Add validation** to ensure all keywords map to valid categories

---

## 🎯 **Recommended Master Prompt for Google Sheets**

Based on the current `app/api/extract/route.ts` prompt, here's the corrected version:

```
You are an expert accounting data extraction AI trained on real Thai business transaction data. Extract structured accounting data in JSON for this text:

{RECEIPT_TEXT}

CRITICAL: Use EXACT values from these live dropdown options:

Properties:
- "Sia Moon - Land - General"
- "Alesia House"
- "Lanna House"
- "Parents House"
- "Shaun Ducker"
- "Maria Ren"

Type of Operation (choose one - match EXACTLY):
- "Revenue - Commision"
- "Revenue - Sales"
- "Revenue - Services"
- "Revenue - Rental Income"
- "EXP - Utilities - Gas"
- "EXP - Utilities - Water"
- "EXP - Utilities  - Electricity"
- "EXP - Construction - Structure"
- "EXP - Construction - Wall"
- "EXP - Construction - Electric Supplies"
- "EXP - HR - Employees Salaries"
- "EXP - Appliances & Electronics"
- "EXP - Windows, Doors, Locks & Hardware"
- "EXP - Repairs & Maintenance  - Furniture & Decorative Items"
- "EXP - Repairs & Maintenance - Painting & Decoration"
- "EXP - Repairs & Maintenance - Electrical & Mechanical"
- "EXP - Repairs & Maintenance - Landscaping"
- "EXP - Repairs & Maintenance - Tools & Equipment"
- "EXP - Repairs & Maintenance  - Waste removal"
- "EXP - Administration & General - Office supplies"
- "EXP - Administration & General - License & Certificates"
- "EXP - Administration & General - Legal"
- "EXP - Administration & General - Professional fees"
- "EXP - Administration & General  - Subscription, Software & Membership"
- "EXP - Sales & Marketing -  Professional Marketing Services"
- "EXP - Construction - Overheads/General/Unclassified"
- "EXP - Other Expenses"

Type of Payment:
- "Cash"
- "Bank transfer"
- "Credit card"

KEYWORD MATCHING RULES (use AI_KeywordRules from Google Sheets):
- Match keywords to categories based on the AI_KeywordRules table
- Higher priority keywords take precedence
- If multiple keywords match, use the highest priority match
- If no clear match, leave typeOfOperation as empty string ""

EXAMPLES:
[Include 3-5 real examples from your receipts]

OUTPUT FORMAT:
{
  "day": "<string: day number>",
  "month": "<string: 3-letter month>",
  "year": "<string: 4-digit year>",
  "property": "<exact property name from dropdown>",
  "typeOfOperation": "<exact operation from dropdown or empty string>",
  "typeOfPayment": "<exact payment method from dropdown>",
  "detail": "<transaction description>",
  "ref": "<reference number or empty>",
  "debit": <number: expense amount or 0>,
  "credit": <number: income amount or 0>
}

Return ONLY valid JSON, no additional text.
```

---

## 🔄 **Migration Path**

### **Phase 1: Setup (Current)**
- ✅ Create `AI_Prompts` named range in Google Sheets
- ✅ Create `AI_KeywordRules` named range in Google Sheets
- ✅ Populate with existing keywords from `config/options.json`

### **Phase 2: Update Extract API**
- [ ] Modify `app/api/extract/route.ts` to fetch prompt from Sheets
- [ ] Add caching layer (60-second TTL)
- [ ] Add fallback to hardcoded prompt
- [ ] Test with real receipts

### **Phase 3: Cleanup**
- [ ] Delete `utils/enhancedPrompt.ts` (unused)
- [ ] Update documentation
- [ ] Remove hardcoded keywords from extract API

---

## ✅ **Summary**

**Current State:**
- ✅ Keywords exist in `config/options.json` (130+ mappings)
- ⚠️ AI extraction uses hardcoded prompt with some incorrect category names
- ⚠️ `utils/enhancedPrompt.ts` exists but is not used
- ✅ Manual entry parser uses `config/options.json` correctly

**Target State:**
- ✅ Single source of truth: Google Sheets `AI_Prompts` + `AI_KeywordRules`
- ✅ AI extraction fetches prompt dynamically
- ✅ All category names match dropdown options exactly
- ✅ Keywords managed through UI (Admin → AI section)

**Next Action:**
Update `app/api/extract/route.ts` to use dynamic prompt from Google Sheets.

