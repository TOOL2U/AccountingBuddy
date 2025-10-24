# Accounting Buddy — Phase 1 (MVP)

## Purpose
A simple web app that converts receipts (image/PDF) into structured data and appends them to a Google Sheet.  
**Flow:** Upload → OCR → AI Extract → Review/Edit → Log to Sheet.

## Tech Stack
- Next.js (App Router + TypeScript)
- Tailwind CSS
- Google Cloud Vision API (OCR)
- OpenAI / Claude (JSON structuring)
- Google Apps Script Webhook (append to Sheet)
- Hosting via Vercel

## Repo Structure
```
app/
  upload/page.tsx
  review/[id]/page.tsx
  inbox/page.tsx
  api/
    ocr/route.ts
    extract/route.ts
    sheets/route.ts
components/
prompts/
public/
tailwind.config.ts
README.md
```

## Environment Variables
Create `.env.local`:
```
GOOGLE_VISION_KEY=your_vision_api_key
OPENAI_API_KEY=your_openai_api_key
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXX/exec
SHEETS_WEBHOOK_SECRET=your_long_random_string
NEXT_PUBLIC_MOCK=true
```
> Generate your `SHEETS_WEBHOOK_SECRET` with:  
> `openssl rand -base64 32`

## Phase 1 Scope
- Fields: `date`, `vendor`, `amount`, `category`
- Pages: `/upload`, `/review/[id]`, `/inbox`
- APIs: `/api/ocr`, `/api/extract`, `/api/sheets`
- No auth, no database, no analytics (Phase 2+)

## Apps Script Webhook
```js
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const SECRET = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET') || '';
    if (body.secret !== SECRET) return json({ ok:false, error:"Unauthorized" });

    const date = (body.date || '').trim();
    const vendor = (body.vendor || '').trim();
    const amount = Number(body.amount || 0);
    const category = (body.category || 'Uncategorized').trim();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName('Transactions') || ss.getActiveSheet();
    sh.appendRow([date, vendor, amount, category, new Date()]);

    return json({ ok:true, message:"Appended" });
  } catch (err) { return json({ ok:false, error:String(err) }); }
}
function json(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
```
> Set script property `WEBHOOK_SECRET=your_long_random_string`.

## Acceptance Criteria
1. Upload → Process → Review → Log to Sheet works end-to-end.  
2. Data appears in Google Sheet.  
3. Errors display friendly messages; no crashes.  
4. Deployed to Vercel with env vars set.

## Future (Phase 2+)
- Map to full P&L columns (Month, Year, Property etc.)
- Handle Thai Buddhist Era dates (−543 years).
- Vendor memory, auth, Firestore, analytics.

## Documentation

- [Security Guidelines](SECURITY.md)
- [Testing Documentation](TESTING.md)