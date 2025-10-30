# 🚀 Quick Edit Guide - Common Tasks

**For:** Making fast edits to Accounting Buddy  
**Last Updated:** October 29, 2025

---

## 📑 Table of Contents

1. [File Location Cheat Sheet](#file-location-cheat-sheet)
2. [Common Edit Scenarios](#common-edit-scenarios)
3. [Testing Your Changes](#testing-your-changes)
4. [Debugging Tips](#debugging-tips)

---

## 📂 File Location Cheat Sheet

### **Need to change...**

| What | File(s) | Line Numbers |
|------|---------|--------------|
| **Upload page UI** | `app/upload/page.tsx` | ~600 lines |
| **Review page UI** | `app/review/[id]/page.tsx` | ~500 lines |
| **AI extraction logic** | `app/api/extract/route.ts` | Lines 111-216 (prompt) |
| **OCR processing** | `app/api/ocr/route.ts` | ~150 lines |
| **Google Sheets webhook** | `app/api/sheets/route.ts` | ~150 lines |
| **Fuzzy matching** | `utils/matchOption.ts` | ~300 lines |
| **Manual parser** | `utils/manualParse.ts` | ~250 lines |
| **Dropdown options** | `config/options.json` | JSON file |
| **Keywords** | `config/options.json` | Under `keywords` key |
| **Navigation menu** | `components/Navigation.tsx` | ~150 lines |
| **Tailwind theme** | `tailwind.config.ts` | Colors, shadows, etc. |
| **Environment vars** | `.env.local` | Key-value pairs |
| **Apps Script** | `COMPLETE_APPS_SCRIPT_V6_FINAL.js` | 1521 lines |

---

## 🔧 Common Edit Scenarios

### **1. Add a New Property**

**Files to edit:**
1. `config/options.json`

```json
{
  "properties": [
    "Sia Moon - Land - General",
    "Alesia House",
    "Lanna House",
    "Parents House",
    "Shaun Ducker",
    "Maria Ren",
    "NEW PROPERTY HERE" // ← Add here
  ],
  "keywords": {
    "properties": {
      "NEW PROPERTY HERE": [
        "keyword1",
        "keyword2",
        "keyword3"
      ]
    }
  }
}
```

2. Update Google Sheets validation range

**Test:**
```bash
npm run dev
# Go to /upload
# Type "new property keyword - 1000 - cash"
# Should match new property
```

---

### **2. Add a New Category (Type of Operation)**

**Files to edit:**
1. `config/options.json`

```json
{
  "typeOfOperation": [
    "Revenue - Commision",
    "EXP - Construction - Wall",
    "EXP - NEW CATEGORY HERE" // ← Add here
  ],
  "keywords": {
    "typeOfOperation": {
      "EXP - NEW CATEGORY HERE": [
        "keyword1",
        "keyword2"
      ]
    }
  }
}
```

2. Update Google Sheets validation range

**Test:**
```bash
# Upload receipt with new category keywords
# Should extract correctly
```

---

### **3. Modify AI Extraction Prompt**

**Files to edit:**
1. `app/api/extract/route.ts` (lines 111-216)

**Find this:**
```typescript
const prompt = `You are an expert accounting data extraction AI...`
```

**Modify prompt text, example keywords, or rules**

**Alternative (better):** Use Admin panel
1. Go to `/admin/ai`
2. Edit prompt in UI
3. Save to Google Sheets

**Test:**
```bash
# Upload receipt
# Check extraction accuracy in console logs
```

---

### **4. Change Dropdown Default Values**

**Files to edit:**
1. `utils/matchOption.ts`

**Property default:**
```typescript
export function matchProperty(input: string, comment?: string): MatchResult {
  if (!input && !comment) {
    return { value: 'Sia Moon - Land - General', confidence: 0.5, matched: false };
    //              ↑ Change this default
  }
  // ...
}
```

**Payment default:**
```typescript
export function matchTypeOfPayment(input: string, comment?: string): MatchResult {
  if (!input && !comment) {
    return { value: 'Cash', confidence: 0.5, matched: false };
    //              ↑ Change this default
  }
  // ...
}
```

---

### **5. Adjust Confidence Thresholds**

**Files to edit:**
1. `utils/matchOption.ts`

**Current threshold:** 0.8 for "matched" status

```typescript
if (score > bestMatch.confidence) {
  bestMatch = { value: operation, confidence: score, matched: score >= 0.8 };
  //                                                                   ↑ Change threshold
}
```

**Also in:**
2. `app/api/extract/route.ts` (line ~167)

```typescript
// If operation confidence is too low, set to empty string
if (normalized.typeOfOperation.confidence < 0.7) {
  //                                          ↑ Change threshold
  extracted.typeOfOperation = '';
}
```

---

### **6. Modify UI Colors/Theme**

**Files to edit:**
1. `tailwind.config.ts`

**Change brand color:**
```typescript
colors: {
  'brand-primary': '#60A5FA', // ← Change hex code
  'brand-secondary': '#3B82F6',
}
```

**Change surface colors (dark mode):**
```typescript
'surface-0': '#0B0F14', // ← Background
'surface-1': 'rgba(255, 255, 255, 0.03)',
'surface-2': 'rgba(255, 255, 255, 0.06)',
```

**Apply changes:**
```bash
# Restart dev server
npm run dev
```

---

### **7. Add a New Navigation Link**

**Files to edit:**
1. `components/Navigation.tsx`

**Add to links array:**
```typescript
const links = [
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/pnl', label: 'P&L', icon: TrendingUp },
  { href: '/admin', label: 'Admin', icon: Settings },
  { href: '/new-page', label: 'New Page', icon: NewIcon }, // ← Add here
];
```

2. Create new page:
```bash
mkdir -p app/new-page
touch app/new-page/page.tsx
```

---

### **8. Change Image Compression Settings**

**Files to edit:**
1. `utils/imageCompression.ts`

```typescript
export async function compressImage(file: File): Promise<File> {
  const MAX_DIMENSION = 1920; // ← Change max size
  const QUALITY = 0.8; // ← Change quality (0.1-1.0)
  // ...
}

export function shouldCompress(file: File): boolean {
  const threshold = 1024 * 1024; // 1MB ← Change threshold
  // ...
}
```

---

### **9. Modify Manual Entry Command History Length**

**Files to edit:**
1. `utils/manualParse.ts`

```typescript
export function saveCommandToHistory(command: string): void {
  // ...
  const updated = filtered.slice(0, 5); // ← Change max history
  // ...
}
```

---

### **10. Update Google Apps Script**

**Files to edit:**
1. `COMPLETE_APPS_SCRIPT_V6_FINAL.js`

**Make your changes, then:**

1. Open Google Apps Script: https://script.google.com
2. Open your project
3. **Select ALL** existing code and DELETE
4. **Copy** entire `COMPLETE_APPS_SCRIPT_V6_FINAL.js`
5. **Paste** into editor
6. Click **Deploy** → **Manage deployments**
7. Click **Edit** (pencil icon)
8. Click **Deploy**

**⚠️ Important:** URL stays the same, no need to update `.env.local`

---

## 🧪 Testing Your Changes

### **Quick Test Checklist**

After making changes, test:

#### **1. Development Server Runs**
```bash
npm run dev
# Should start without errors
# Check http://localhost:3000
```

#### **2. TypeScript Compiles**
```bash
# Should show no errors in terminal
# Check for red squiggly lines in VS Code
```

#### **3. Upload Flow Works**
- [ ] Go to `/upload`
- [ ] Upload an image
- [ ] Check console for errors
- [ ] Verify extraction works
- [ ] Check confidence scores

#### **4. Manual Entry Works**
- [ ] Type command in manual entry
- [ ] Press Enter
- [ ] Should navigate to review page
- [ ] Check extracted values

#### **5. Review Page Works**
- [ ] All dropdowns populated
- [ ] Can edit all fields
- [ ] Validation works
- [ ] Submit succeeds

#### **6. Google Sheets Integration**
- [ ] Data appears in Sheet
- [ ] Correct column mapping
- [ ] No errors in webhook

---

### **Browser Console Testing**

**Open DevTools:** `F12` or `Cmd+Option+I` (Mac)

**Look for:**
```
[EXTRACT] Starting AI extraction...
[EXTRACT] Input text length: 234 characters
[✔] AI extraction success → fields mapped: day, month, year...
[SHEETS] Sending to webhook...
[✔] Sheets append → status: SUCCESS
```

**Common errors:**
```
❌ OPENAI_API_KEY is not configured
   → Check .env.local

❌ Failed to parse OpenAI response
   → Check AI prompt syntax

❌ Webhook authentication failed
   → Check SHEETS_WEBHOOK_SECRET
```

---

### **API Testing with cURL**

**Test OCR:**
```bash
curl -X POST http://localhost:3000/api/ocr \
  -F "file=@/path/to/receipt.jpg"
```

**Test Extract:**
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"text":"test receipt text"}'
```

**Test Sheets:**
```bash
curl -X POST http://localhost:3000/api/sheets \
  -H "Content-Type: application/json" \
  -d '{
    "day":"27",
    "month":"Oct",
    "year":"2025",
    "property":"Sia Moon - Land - General",
    "typeOfOperation":"EXP - Construction - Wall",
    "typeOfPayment":"Cash",
    "detail":"Test",
    "ref":"",
    "debit":100,
    "credit":0
  }'
```

---

## 🐛 Debugging Tips

### **Issue: AI Extraction Returns Wrong Category**

**Check:**
1. Keywords in `config/options.json`
2. AI prompt in `app/api/extract/route.ts`
3. Console logs for confidence scores

**Fix:**
- Add more keywords
- Improve prompt examples
- Lower confidence threshold

---

### **Issue: Dropdown Not Showing New Option**

**Check:**
1. Did you add to `config/options.json`?
2. Did you restart dev server?
3. Did you clear browser cache?

**Fix:**
```bash
# Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

### **Issue: Manual Entry Not Parsing Correctly**

**Check:**
1. Console logs in browser
2. `utils/manualParse.ts` logic
3. Keywords in `config/options.json`

**Debug:**
```typescript
// Add console.log in manualParse.ts
console.log('Detected transaction type:', transactionType);
console.log('Extracted amount:', amount);
console.log('Matched property:', property);
```

---

### **Issue: Google Sheets Webhook Failing**

**Check:**
1. `SHEETS_WEBHOOK_URL` in `.env.local`
2. `SHEETS_WEBHOOK_SECRET` matches Apps Script
3. Apps Script deployed correctly

**Test webhook directly:**
```bash
curl -X POST https://script.google.com/macros/s/.../exec \
  -H "Content-Type: application/json" \
  -d '{"action":"list_named_ranges","secret":"YOUR_SECRET"}'
```

---

### **Issue: Build Fails**

**Common causes:**
1. TypeScript errors
2. Missing dependencies
3. Import path errors

**Fix:**
```bash
# Check for errors
npm run build

# Install missing deps
npm install

# Clear cache
rm -rf .next
npm run build
```

---

### **Issue: Images Not Compressing**

**Check:**
1. `utils/imageCompression.ts`
2. Console logs
3. File size before/after

**Debug:**
```typescript
// Add in imageCompression.ts
console.log(`Original size: ${file.size}`);
console.log(`Compressed size: ${compressedFile.size}`);
```

---

## 🔍 Where to Find Things

### **Want to change...**

**Upload page button text?**
→ `app/upload/page.tsx` (line ~900)

**Review page field labels?**
→ `app/review/[id]/page.tsx` (lines ~300-400)

**Error messages?**
→ `app/api/*/route.ts` (in catch blocks)

**Confidence badge colors?**
→ `components/ConfidenceBadge.tsx`

**Toast notification text?**
→ `components/Toast.tsx`

**Navigation logo?**
→ `components/Navigation.tsx` (line ~30)

**Dropdown options?**
→ `config/options.json`

**AI prompt?**
→ `app/api/extract/route.ts` (lines 111-216)

**Webhook validation?**
→ `app/api/sheets/route.ts` (lines 50-80)

**Manual parser logic?**
→ `utils/manualParse.ts`

**Fuzzy matching algorithm?**
→ `utils/matchOption.ts`

---

## 💡 Pro Tips

### **1. Use VS Code Search**
```
Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows)
```
Search across all files for text

### **2. Use TypeScript IntelliSense**
```
Cmd+Click (Mac) or Ctrl+Click (Windows)
```
Jump to definition of functions/types

### **3. Check Git Diff Before Committing**
```bash
git diff
# See what changed

git diff --staged
# See what's staged for commit
```

### **4. Use Browser DevTools**
- **Console:** View logs and errors
- **Network:** Check API calls
- **Application:** View localStorage
- **Elements:** Inspect UI

### **5. Test in Incognito/Private Mode**
- Clear cache/localStorage
- Test fresh state
- Verify behavior

---

## 📞 Quick Reference Links

**Local Development:**
- App: http://localhost:3000
- Upload: http://localhost:3000/upload
- Review: http://localhost:3000/review/test-id
- Inbox: http://localhost:3000/inbox
- P&L: http://localhost:3000/pnl
- Admin: http://localhost:3000/admin

**External Services:**
- Google Cloud Console: https://console.cloud.google.com
- OpenAI Platform: https://platform.openai.com
- Google Apps Script: https://script.google.com
- Google Sheets: https://docs.google.com/spreadsheets/d/1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8

**Documentation:**
- Full Overview: `PROJECT_FAMILIARIZATION_SUMMARY.md`
- System Overview: `COMPLETE_SYSTEM_OVERVIEW.md`
- Deployment: `DEPLOYMENT.md`
- Testing: `TESTING.md`

---

**Happy Coding! 🚀**

