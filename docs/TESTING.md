# TESTING.md — Acceptance Testing for Phase 1

## Environment
- Local run: `npm run dev`
- Deployed: Vercel (env vars set)

## Steps
1. Go to `/upload`.
2. Upload a sample image ([test-receipt.jpg](placeholder-link)):
   - Date: 23 Oct 2025
   - Vendor: HomePro Samui
   - Amount: 1245 THB
   - Category: Construction
3. Click **Process** → navigate to `/review/[id]`.
4. Confirm fields auto-filled; edit Category to "EXP - Construction - Structure".
5. Click **Send to Google Sheet** → green toast appears.
6. `/inbox` shows receipt with status "Sent".
7. Error test: upload `.doc` → rejection message.
8. Failure test: remove `SHEETS_WEBHOOK_URL` → red toast error.

## Expected Results
- ✅ No crashes, flow smooth.
- ✅ Row appended in Google Sheet.
- ✅ Clear error messaging.

## Screenshot Placeholders
upload-success.png | review-filled.png | inbox-sent.png | error-toast.png