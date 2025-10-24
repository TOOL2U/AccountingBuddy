# Accounting Buddy — Phase 1 (MVP)

[![Production](https://img.shields.io/badge/status-production-green)](https://github.com/TOOL2U/AccountingBuddy)
[![Version](https://img.shields.io/badge/version-1.0.0--final-blue)](https://github.com/TOOL2U/AccountingBuddy/releases/tag/v1.0.0-final)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Purpose
A simple web app that converts receipts (image/PDF) into structured data and appends them to a Google Sheet.
**Flow:** Upload (+ optional comment) → OCR → AI Extract (with fuzzy matching) → Review/Edit (with confidence badges) → Validate → Log to Sheet.

## ✨ Key Features
- **Comment-Guided Extraction**: Add optional comments when uploading receipts to help AI select correct categories
- **Intelligent Dropdown Matching**: Fuzzy matching with keyword recognition and Levenshtein distance
- **Confidence Scoring**: Visual indicators for uncertain matches (<0.8 confidence threshold)
- **Canonical Options**: All dropdown values validated against `/config/options.json`
- **10-Field Accounting Schema**: Matches "Accounting Buddy P&L 2025.xlsx" structure

## 🚀 Production Deployment

**Status:** Production-ready ✅
**Version:** 1.0.0-final
**Deployment Guide:** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions

### Quick Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TOOL2U/AccountingBuddy/tree/main/accounting-buddy-app)

**Required Environment Variables:**
- `GOOGLE_VISION_KEY` - Google Cloud Vision API key
- `OPENAI_API_KEY` - OpenAI API key
- `SHEETS_WEBHOOK_URL` - Google Apps Script webhook URL
- `SHEETS_WEBHOOK_SECRET` - Webhook authentication secret
- `NEXT_PUBLIC_SENTRY_DSN` - (Optional) Sentry error tracking

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

## ✅ Development Stages Complete

### Stage 0: UI Scaffold ✅
- [x] Next.js project initialized with TypeScript and Tailwind CSS
- [x] Navigation component with responsive design
- [x] `/upload` page with drag-and-drop file upload
- [x] `/review/[id]` page with editable form fields
- [x] `/inbox` page with receipt table (desktop) and cards (mobile)
- [x] Responsive design with mobile-friendly layouts

### Stage 1: Google Vision OCR ✅
- [x] `/api/ocr` endpoint with Google Cloud Vision API
- [x] Retry logic with exponential backoff
- [x] Support for JPG, PNG, and PDF files
- [x] Base64 encoding and file validation

### Stage 2: OpenAI AI Extraction ✅
- [x] `/api/extract` endpoint with GPT-4o
- [x] Structured JSON extraction (date, vendor, amount, category)
- [x] Fallback mechanism for API failures
- [x] Chained API calls (OCR → Extract)

### Stage 3: Google Sheets Integration ✅
- [x] `/api/sheets` endpoint with webhook
- [x] Validation utility (`utils/validatePayload.ts`)
- [x] Toast notifications and error handling
- [x] Double-submission prevention
- [x] Complete setup guide (`GOOGLE_SHEETS_SETUP.md`)

### Stage 4: Polish & Performance ✅
- [x] Smooth animations and transitions
- [x] Vendor-category caching (localStorage)
- [x] Image compression (65% size reduction)
- [x] Next.js compiler optimizations
- [x] Comprehensive testing (17 tests passed)
- [x] Complete documentation (CHANGELOG, QA reports)

## 📊 Data Schema

**Canonical Schema:** `/docs/Accounting_Buddy_P&L_2025.csv`

The application uses a **10-field accounting schema** that matches the structure of the "Accounting Buddy P&L 2025" spreadsheet:

| Column | Field | Type | Example | Description |
|--------|-------|------|---------|-------------|
| B | Day | string | "27" | Day of the month |
| C | Month | string | "Feb" | 3-letter month abbreviation |
| D | Year | string | "2025" | 4-digit year |
| E | Property | string | "Sia Moon" | Property name (Sia Moon, Alesia House, etc.) |
| F | Type of operation | string | "EXP - Construction - Wall" | Operation category (EXP/INC - Category - Subcategory) |
| G | Type of payment | string | "Bank transfer" | Payment method (Cash, Bank transfer, Card, etc.) |
| H | Detail | string | "Materials" | Transaction description |
| I | Ref | string | "" | Invoice/reference number (optional) |
| J | Debit | number | 4785 | Expense amount (0 if not applicable) |
| K | Credit | number | 0 | Income amount (0 if not applicable) |

**Note:** Column A is left empty in the spreadsheet for row numbers/spacing.

### Schema Mapping:
- **OCR + AI Extraction** → Extracts all 10 fields from receipt text
- **Manual Text Input** → AI parses text like "debit - 2000 baht - salaries - paid by cash" into full schema
- **Google Sheets Webhook** → Appends data in exact column order (B through K)

## 🎯 Features

### Core Functionality:
- ✅ Upload receipt images (JPG, PNG, PDF)
- ✅ OCR text extraction with retry logic
- ✅ AI-powered field extraction (10-field accounting schema)
- ✅ Editable review form with validation
- ✅ Google Sheets integration (matches P&L 2025 structure)
- ✅ Mobile responsive design

### Performance Optimizations:
- ✅ **Vendor-category caching** - 100% reduction in API calls for repeat vendors
- ✅ **Image compression** - 65% average size reduction for images > 1MB
- ✅ **Next.js optimizations** - Console log removal, image optimization

### UX Enhancements:
- ✅ Smooth page transitions
- ✅ Toast notifications with animations
- ✅ Loading states and spinners
- ✅ Error handling and user feedback
- ✅ Button hover and active states

## 📊 Performance Metrics

- **API Cost Reduction:** 65% for large images, 100% for repeat vendors
- **Cache Hit Rate:** ~50% for active users (estimated)
- **Page Load Time:** < 1s (after initial load)
- **Build Time:** ~2-3 minutes on Vercel

## 🧪 Testing

All 17 tests passed ✅

- **Stage 3 QA:** 8/8 tests passed
- **Stage 4 Final QA:** 9/9 tests passed
- **Test Reports:** See `testing/test-results.md` and `testing/final-qa.md`

## 📚 Documentation

Complete project documentation is available:

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[CHANGELOG.md](CHANGELOG.md)** - Complete project history
- **[GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)** - Google Sheets setup guide
- **[testing/test-results.md](testing/test-results.md)** - QA test report (Stage 3)
- **[testing/final-qa.md](testing/final-qa.md)** - Final QA report (Stage 4)

## 🔗 Links

- **Repository:** https://github.com/TOOL2U/AccountingBuddy
- **Release v1.0.0-final:** https://github.com/TOOL2U/AccountingBuddy/releases/tag/v1.0.0-final
- **Issues:** https://github.com/TOOL2U/AccountingBuddy/issues

All buttons currently show mock alerts. API integration will be added in subsequent stages.

## 📚 Documentation

Complete project documentation is available in the `/docs` folder:

- **[Master Onboarding Guide](docs/MASTER_ONBOARDING_PROMPT.md)** - Complete project overview and build instructions
- **[Security Guidelines](docs/SECURITY.md)** - API key protection and security best practices  
- **[Testing Documentation](docs/TESTING.md)** - End-to-end acceptance testing procedures
- **[Build Prompts](docs/prompts/)** - Staged development instructions (00-04)
- **[Project Status Report](PROJECT_STATUS_REPORT.md)** - Current progress and engineering review

### Development Stages
Refer to `/docs/prompts/` for detailed implementation guides:
- `00_setup_ui.txt` - UI scaffold ✅ **COMPLETE**
- `01_ocr_api.txt` - Google Vision OCR ✅ **COMPLETE** 
- `02_extract_api.txt` - OpenAI extraction ✅ **COMPLETE**
- `03_sheets_webhook.txt` - Google Sheets integration ⏳ **NEXT**
- `04_polish_and_tests.txt` - Production polish ⏳ **PENDING**

