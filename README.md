# Accounting Buddy — Phase 1 (MVP)

## Purpose
A simple web app that converts receipts (image/PDF) into structured data and appends them to a Google Sheet.  
**Flow:** Upload → OCR → AI Extract → Review/Edit → Log to Sheet.

## Tech Stack
- Next.js 16 (App Router + TypeScript)
- Tailwind CSS v4
- Google Cloud Vision API (OCR)
- OpenAI GPT-4o (JSON structuring)
- Google Apps Script Webhook (append to Sheet)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local` and fill in your API keys:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
app/
  upload/page.tsx          # Upload page with drag-and-drop
  review/[id]/page.tsx     # Review and edit extracted data
  inbox/page.tsx           # View processed receipts
  api/                     # API routes (to be added in later stages)
    ocr/route.ts          # Google Vision OCR (Stage 1)
    extract/route.ts      # OpenAI extraction (Stage 2)
    sheets/route.ts       # Google Sheets webhook (Stage 3)
  layout.tsx              # Root layout with navigation
  globals.css             # Global styles and Tailwind imports
components/
  Navigation.tsx          # Top navigation bar
```

## Stage 0 Completion ✅
- [x] Next.js project initialized with TypeScript and Tailwind CSS
- [x] Navigation component with responsive design
- [x] `/upload` page with drag-and-drop file upload
- [x] `/review/[id]` page with editable form fields
- [x] `/inbox` page with receipt table (desktop) and cards (mobile)
- [x] Mock data and alerts (no API integration yet)
- [x] Responsive design with mobile-friendly layouts

## Next Steps
- **Stage 1**: Add Google Vision OCR API integration (`/api/ocr`)
- **Stage 2**: Add OpenAI GPT-4o extraction (`/api/extract`)
- **Stage 3**: Add Google Sheets webhook integration (`/api/sheets`)
- **Stage 4**: Polish UI, add loading states, and finalize error handling

## Testing
Visit the following pages to test the UI:
- `/upload` - Upload page
- `/review/mock-id-123` - Review page with mock data
- `/inbox` - Inbox with sample receipts

All buttons currently show mock alerts. API integration will be added in subsequent stages.

