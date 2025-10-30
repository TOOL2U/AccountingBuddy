# Admin Page Test Coverage Analysis

**Date:** October 29, 2025  
**Current Version:** Admin Panel with PIN Gate  
**Status:** ⚠️ **Missing Several Important Tests**

---

## 📊 **Current API Endpoints (10 Total)**

### **Core Endpoints**
1. `/api/ocr` - Google Vision OCR
2. `/api/extract` - OpenAI extraction
3. `/api/sheets` - Google Sheets webhook (POST data)
4. `/api/inbox` - Fetch all entries (GET) + Delete entry (DELETE)
5. `/api/pnl` - P&L data endpoint

### **P&L Sub-Endpoints**
6. `/api/pnl/namedRanges` - List all named ranges
7. `/api/pnl/property-person` - Property/Person expense details

### **Balance Endpoints (NEW)**
8. `/api/balance/ocr` - Bank screenshot OCR
9. `/api/balance/save` - Save balances to Sheets
10. `/api/balance/get` - Fetch latest balances

---

## ✅ **Current Tests in Admin Page**

### **1. Webhook Test** ✅
- **Endpoint:** `/api/sheets` (POST)
- **What it tests:** Google Sheets integration
- **Payload:** Full accounting entry
- **Status:** ✅ Working (fixed header issue)

### **2. API Health Check** ✅
- **Endpoints tested:**
  - `/api/inbox` (GET)
  - `/api/pnl` (GET)
  - `/api/sheets` (GET - health check)
- **What it tests:** Response time and availability
- **Status:** ✅ Working

### **3. Named Ranges Discovery** ✅
- **Endpoint:** `/api/pnl/namedRanges`
- **What it tests:** P&L named ranges from Google Sheets
- **Status:** ✅ Working

### **4. Export Data** ✅
- **Endpoint:** `/api/inbox` (GET)
- **What it tests:** Data retrieval and JSON export
- **Status:** ✅ Working

### **5. Refresh Stats** ✅
- **Endpoint:** `/api/inbox` (GET)
- **What it tests:** Inbox data fetching
- **Status:** ✅ Working

---

## ❌ **Missing Tests**

### **1. OCR Test** ❌
- **Endpoint:** `/api/ocr`
- **Purpose:** Test Google Vision API integration
- **Why needed:** Verify OCR is working before users upload receipts
- **Test payload:** Upload a sample image
- **Expected:** Extracted text response

### **2. AI Extraction Test** ❌
- **Endpoint:** `/api/extract`
- **Purpose:** Test OpenAI GPT-4o extraction
- **Why needed:** Verify AI can extract accounting data
- **Test payload:** Sample OCR text
- **Expected:** Structured accounting data (JSON)

### **3. Balance OCR Test** ❌
- **Endpoint:** `/api/balance/ocr`
- **Purpose:** Test bank screenshot OCR
- **Why needed:** Verify balance extraction works
- **Test payload:** Sample bank screenshot
- **Expected:** Extracted balance amount

### **4. Balance Save Test** ❌
- **Endpoint:** `/api/balance/save`
- **Purpose:** Test balance saving to Sheets
- **Why needed:** Verify balance feature works end-to-end
- **Test payload:** `{ bankBalance: 50000, cashBalance: 5000 }`
- **Expected:** Success response

### **5. Balance Get Test** ❌
- **Endpoint:** `/api/balance/get`
- **Purpose:** Test balance retrieval
- **Why needed:** Verify balance data can be fetched
- **Test payload:** None (GET request)
- **Expected:** Latest balance + reconciliation data

### **6. Property/Person Details Test** ❌
- **Endpoint:** `/api/pnl/property-person`
- **Purpose:** Test property/person expense breakdown
- **Why needed:** Verify P&L sub-reports work
- **Test payload:** `{ period: 'month' }` or `{ period: 'year' }`
- **Expected:** Expense breakdown by property/person

### **7. Delete Entry Test** ❌
- **Endpoint:** `/api/inbox` (DELETE)
- **Purpose:** Test entry deletion
- **Why needed:** Verify users can delete incorrect entries
- **Test payload:** `{ rowNumber: 123 }`
- **Expected:** Success response + entry removed

---

## 🎯 **Recommended Additions**

### **Priority 1: Critical Tests**

#### **1. OCR Test Card**
```typescript
<Card>
  <h2>OCR Test</h2>
  <p>Test Google Vision API</p>
  <input type="file" accept="image/*" />
  <Button onClick={handleTestOCR}>Test OCR</Button>
  <pre>{ocrResponse}</pre>
</Card>
```

#### **2. AI Extraction Test Card**
```typescript
<Card>
  <h2>AI Extraction Test</h2>
  <p>Test OpenAI GPT-4o extraction</p>
  <textarea placeholder="Paste OCR text here..." />
  <Button onClick={handleTestExtraction}>Test Extraction</Button>
  <pre>{extractionResponse}</pre>
</Card>
```

#### **3. Balance Tests Card**
```typescript
<Card>
  <h2>Balance Feature Tests</h2>
  <Button onClick={handleTestBalanceSave}>Test Balance Save</Button>
  <Button onClick={handleTestBalanceGet}>Test Balance Get</Button>
  <Button onClick={handleTestBalanceOCR}>Test Balance OCR</Button>
  <pre>{balanceResponse}</pre>
</Card>
```

### **Priority 2: Nice-to-Have Tests**

#### **4. Property/Person Test**
```typescript
<Card>
  <h2>Property/Person Details</h2>
  <select>
    <option value="month">Month</option>
    <option value="year">Year</option>
  </select>
  <Button onClick={handleTestPropertyPerson}>Test</Button>
  <pre>{propertyPersonResponse}</pre>
</Card>
```

#### **5. Delete Entry Test**
```typescript
<Card>
  <h2>Delete Entry Test</h2>
  <input type="number" placeholder="Row number" />
  <Button onClick={handleTestDelete}>Test Delete</Button>
  <pre>{deleteResponse}</pre>
</Card>
```

---

## 📋 **Test Coverage Summary**

| Endpoint | Current Test | Missing Test | Priority |
|----------|-------------|--------------|----------|
| `/api/ocr` | ❌ None | ✅ OCR Test | 🔴 High |
| `/api/extract` | ❌ None | ✅ AI Extraction Test | 🔴 High |
| `/api/sheets` (POST) | ✅ Webhook Test | - | - |
| `/api/sheets` (GET) | ✅ Health Check | - | - |
| `/api/inbox` (GET) | ✅ Health Check, Stats, Export | - | - |
| `/api/inbox` (DELETE) | ❌ None | ✅ Delete Test | 🟡 Medium |
| `/api/pnl` | ✅ Health Check | - | - |
| `/api/pnl/namedRanges` | ✅ Named Ranges | - | - |
| `/api/pnl/property-person` | ❌ None | ✅ Property/Person Test | 🟡 Medium |
| `/api/balance/ocr` | ❌ None | ✅ Balance OCR Test | 🔴 High |
| `/api/balance/save` | ❌ None | ✅ Balance Save Test | 🔴 High |
| `/api/balance/get` | ❌ None | ✅ Balance Get Test | 🔴 High |

**Coverage:** 5/10 endpoints tested (50%)  
**Missing:** 5 critical tests

---

## 🚀 **Implementation Plan**

### **Phase 1: Add Balance Tests** (Highest Priority)
1. Add "Balance Feature Tests" card
2. Implement `handleTestBalanceSave()`
3. Implement `handleTestBalanceGet()`
4. Implement `handleTestBalanceOCR()` (with file upload)

### **Phase 2: Add Core Feature Tests**
1. Add "OCR Test" card with file upload
2. Add "AI Extraction Test" card with text input
3. Implement test handlers

### **Phase 3: Add Advanced Tests**
1. Add "Property/Person Details" test
2. Add "Delete Entry" test
3. Add comprehensive error handling

---

## 💡 **Suggested UI Layout**

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel                          │
│                 System Stats (4 cards)                  │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  Webhook Testing     │  API Health Check                │
│  ✅ Working          │  ✅ Working                      │
└──────────────────────┴──────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  OCR Test            │  AI Extraction Test              │
│  ❌ NEW              │  ❌ NEW                          │
└──────────────────────┴──────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────┐
│  Balance Tests       │  Property/Person Test            │
│  ❌ NEW              │  ❌ NEW                          │
└──────────────────────┴──────────────────────────────────┘

┌──────────────────────┬──────────────────────┬───────────┐
│  Named Ranges        │  Export Data         │  Refresh  │
│  ✅ Working          │  ✅ Working          │  ✅ Work  │
└──────────────────────┴──────────────────────┴───────────┘
```

---

## 🎯 **Summary**

**Current State:**
- ✅ 5 tests implemented
- ❌ 5 critical tests missing
- 📊 50% coverage

**Recommended Actions:**
1. **Add Balance Tests** - Critical for new feature
2. **Add OCR Test** - Verify core functionality
3. **Add AI Extraction Test** - Verify AI integration
4. **Add Property/Person Test** - Verify P&L sub-reports
5. **Add Delete Test** - Verify data management

**Benefits:**
- 🔍 Better debugging capabilities
- ✅ Faster issue identification
- 🚀 Confidence in deployments
- 📊 Complete system monitoring

---

**Next Steps:** Implement missing tests in admin page

