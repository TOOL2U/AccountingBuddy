# Changelog

All notable changes to the Accounting Buddy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.0.0-final] - 2025-10-24

### Stage 6 - Dropdown Selection & Comment Guidance (October 24, 2025)

#### Added
- **Comment-Guided AI Extraction:**
  - Optional comment field on upload page to guide AI categorization
  - Comment context integrated into OpenAI extraction prompt
  - Contextual help text and examples for users
  - Comment passed through entire extraction pipeline

- **Fuzzy Matching System:**
  - `utils/matchOption.ts` - Comprehensive fuzzy matching utility
  - Levenshtein distance algorithm for string similarity (0-1 score)
  - Keyword-based matching with exact, contains, and word boundary matching
  - Field-specific matchers: `matchProperty()`, `matchTypeOfOperation()`, `matchTypeOfPayment()`
  - `normalizeDropdownFields()` - Validates and normalizes all dropdown fields
  - Confidence scoring with 0.8 threshold for "matched" status

- **Canonical Dropdown Configuration:**
  - `config/options.json` - Centralized dropdown options and keyword mappings
  - 5 properties: Sia Moon, Alesia House, Villa 1, Villa 2, Villa 3
  - 30+ operation types covering expenses, income, construction, admin, etc.
  - 5 payment types: Cash, Bank transfer, Card, Check, Mobile payment
  - Comprehensive keyword mappings for intelligent matching

- **Review Page Enhancements:**
  - Converted Property, Type of Operation, and Type of Payment to dropdown selects
  - Dynamic dropdown options loaded from `/config/options.json`
  - Confidence badges: "⚠️ Needs review" for confidence < 0.8
  - Visual indicators for uncertain matches (yellow badge)
  - Confidence scores tracked and displayed per field

- **Webhook Validation:**
  - Pre-webhook dropdown normalization in `/api/sheets/route.ts`
  - Ensures only valid canonical options are sent to Google Sheets
  - Fallback defaults: "Sia Moon" (property), "Cash" (payment), "Uncategorized" (operation)

#### Changed
- Enhanced OpenAI extraction prompt with dropdown options list
- Updated `/app/upload/page.tsx` with comment textarea
- Updated `/app/api/extract/route.ts` with comment context and normalization
- Updated `/app/review/[id]/page.tsx` with dropdowns and confidence badges
- Updated `/app/api/sheets/route.ts` with final validation layer
- Updated `README.md` with key features section
- Updated `GOOGLE_SHEETS_SETUP.md` with comment and fuzzy matching details

#### Files Modified
- `app/upload/page.tsx` - Added comment field
- `app/api/extract/route.ts` - Enhanced AI extraction with comment context
- `app/review/[id]/page.tsx` - Converted to dropdowns with confidence badges
- `app/api/sheets/route.ts` - Added webhook validation
- `GOOGLE_SHEETS_SETUP.md` - Updated documentation
- `README.md` - Added feature descriptions

#### Files Created
- `config/options.json` - Canonical dropdown options and keyword mappings
- `utils/matchOption.ts` - Fuzzy matching utility (524 lines)

---

### Stage 5 - CSV Schema Alignment (October 24, 2025)

#### Added
- **10-Field Accounting Schema:**
  - Expanded from 4 fields (date, vendor, amount, category) to 10 fields
  - New schema: day, month, year, property, typeOfOperation, typeOfPayment, detail, ref, debit, credit
  - Matches "Accounting Buddy P&L 2025.xlsx" spreadsheet structure

- **CSV Integration:**
  - `/docs/Accounting_Buddy_P&L_2025.csv` - Canonical schema reference
  - CSV serves as source of truth for schema and dropdown values
  - Analyzed CSV to extract unique dropdown values
  - Empty Column A preserved for row numbers/spacing

- **Enhanced AI Extraction:**
  - Updated OpenAI prompt with real-world examples from CSV
  - Improved date parsing (split into day/month/year)
  - Added property recognition (Sia Moon, Alesia House)
  - Enhanced operation type categorization
  - Improved payment type detection
  - Separate debit/credit fields with proper handling

- **Validation Updates:**
  - Updated `utils/validatePayload.ts` for 10-field schema
  - New interfaces: `ReceiptPayload`, `ValidatedPayload`
  - Comprehensive field validation and sanitization
  - Currency symbol and comma removal from amounts

#### Changed
- Updated `/app/api/extract/route.ts` with 10-field extraction
- Updated `/app/review/[id]/page.tsx` with 10-field form
- Updated `/app/upload/page.tsx` with 10-field URL params
- Updated `/app/api/sheets/route.ts` with 10-field webhook payload
- Updated `GOOGLE_SHEETS_SETUP.md` with new schema structure
- Updated `README.md` with schema details

#### Files Modified
- `app/api/extract/route.ts` - 10-field extraction
- `app/review/[id]/page.tsx` - 10-field form
- `app/upload/page.tsx` - 10-field URL params
- `app/api/sheets/route.ts` - 10-field webhook
- `utils/validatePayload.ts` - 10-field validation
- `GOOGLE_SHEETS_SETUP.md` - Updated schema documentation
- `README.md` - Updated purpose and flow

#### Files Created
- `docs/Accounting Buddy P&L 2025.xlsx` - Original spreadsheet reference
- `docs/Accounting Buddy P&L 2025 - Accounting .csv` - Canonical CSV schema

---

### Stage 4 - Polish & Final QA (October 24, 2025)

#### Added
- **UX Enhancements:**
  - Smooth fade-in animations for page transitions
  - Enhanced toast notifications with slide-in-right animation
  - Active states for all buttons (`:active` pseudo-class)
  - Consistent transition durations (200ms) across all interactive elements
  - Backdrop blur effect on toast notifications

- **Performance Optimizations:**
  - Vendor-to-category caching in localStorage
    - Automatic caching of AI-extracted vendor-category mappings
    - 30-day cache expiry
    - Cache size limit of 100 entries
    - Reduces API calls for repeat vendors
  - Image compression before OCR
    - Automatic compression for images > 1MB
    - Max dimensions: 1920x1920px
    - JPEG quality: 85%
    - Maintains aspect ratio
    - Reduces API costs and improves performance
  - Next.js compiler optimizations
    - Console log removal in production (except errors/warnings)
    - Image format optimization (AVIF, WebP)
    - Package import optimization

- **New Utilities:**
  - `utils/vendorCache.ts` - Vendor-category caching system
  - `utils/imageCompression.ts` - Client-side image compression

#### Changed
- Enhanced button hover states with active states
- Improved toast animation from slide-up to slide-in-right
- Updated Next.js configuration with performance optimizations
- Added duration specifications to all transitions

---

## [1.0.0-rc1] - 2025-10-24 (Superseded by 1.0.0-final)

### Stage 3 - Google Sheets Webhook Integration (October 24, 2025)

#### Added
- **Google Sheets Integration:**
  - `/api/sheets` POST endpoint for webhook integration
  - Webhook secret validation for security
  - Field validation and sanitization via `utils/validatePayload.ts`
  - Support for date, vendor, amount, and category fields

- **Review Page Enhancements:**
  - Real API integration with `/api/sheets`
  - Loading spinner during submission
  - Success toast (green) with auto-redirect to inbox
  - Error toast (red) with 3-second auto-hide
  - Double-submission prevention (4 layers of protection)

- **Documentation:**
  - `GOOGLE_SHEETS_SETUP.md` - Complete setup guide
  - Apps Script code template
  - Deployment instructions
  - Troubleshooting guide

- **Validation Utility:**
  - `utils/validatePayload.ts` - DRY validation helper
  - Trims whitespace from all string fields
  - Converts amount to Number() with validation
  - Validates non-negative amounts
  - Returns typed validation results

#### Changed
- Updated `.env.example` with webhook configuration
- Enhanced error handling with specific error messages
- Improved user feedback with toast notifications

---

### Stage 2 - OpenAI GPT-4o AI Extraction (October 24, 2025)

#### Added
- **AI Extraction API:**
  - `/api/extract` POST endpoint using OpenAI GPT-4o
  - Structured JSON extraction from OCR text
  - Extracts: date, vendor, amount, category
  - Temperature: 0.1 (deterministic)
  - Max tokens: 500

- **Fallback Mechanism:**
  - Graceful handling of API failures
  - Returns fallback data instead of crashing
  - Fallback: empty date/vendor/amount, "Uncategorized" category

- **Upload Flow Enhancement:**
  - Chained API calls: OCR → Extract
  - Automatic field population on review page
  - Loading states during processing

#### Changed
- Updated `/app/upload/page.tsx` to call extract API
- Updated `/app/review/[id]/page.tsx` to use AI-extracted data
- Removed OCR text display section from review page

---

### Stage 1 - Google Vision OCR Integration (October 23, 2025)

#### Added
- **OCR API:**
  - `/api/ocr` POST endpoint using Google Cloud Vision API
  - Accepts multipart form data (JPG, PNG, PDF)
  - Base64 encoding for image transmission
  - TEXT_DETECTION for images
  - DOCUMENT_TEXT_DETECTION for PDFs

- **Retry Logic:**
  - Exponential backoff: 1s, 2s, 4s delays
  - Max 3 retries
  - Handles 429 (rate limit) and 500 (server error)

- **Error Handling:**
  - Server-side file validation
  - Graceful error messages
  - Fallback mechanisms

#### Changed
- Updated `/app/upload/page.tsx` with OCR integration
- Added loading states and error display
- Updated `.env.example` with Google Vision API key

---

### Stage 0 - UI Scaffold (October 23, 2025)

#### Added
- **Project Setup:**
  - Next.js 16 with App Router
  - TypeScript for type safety
  - Tailwind CSS v4 with PostCSS plugin
  - Inter font from Google Fonts

- **Pages:**
  - `/upload` - Drag-and-drop file upload
  - `/review/[id]` - Editable receipt form
  - `/inbox` - Receipt table with status indicators

- **Components:**
  - `Navigation.tsx` - Responsive navigation bar
  - Mobile-first responsive design
  - Consistent styling with Tailwind utilities

- **Features:**
  - File validation (JPG, PNG, PDF only)
  - Drag-and-drop support
  - Image preview
  - Form validation
  - Mock data for development

#### Changed
- Configured Tailwind CSS v4 with `@tailwindcss/postcss`
- Updated `postcss.config.js` for Tailwind v4 compatibility
- Changed `globals.css` to use `@import "tailwindcss"` syntax

---

## Testing

### QA Testing (October 24, 2025)

#### Added
- Comprehensive test suite (8 tests)
- `testing/test-results.md` - Detailed test report
- `testing/api-tests.sh` - Automated API test script

#### Test Results
- ✅ Test 1: Upload valid receipt - PASSED
- ✅ Test 2: Edit and send to Google Sheet - PASSED
- ✅ Test 3: Upload invalid file type - PASSED
- ✅ Test 4: Missing webhook URL - PASSED
- ✅ Test 5: Wrong webhook secret - PASSED
- ✅ Test 6: API timeout simulation - PASSED
- ✅ Test 7: Double-click prevention - PASSED
- ✅ Test 8: Mobile responsive testing - PASSED

**Status:** All tests passed ✅  
**Confidence Level:** HIGH 🚀

---

## Security

### Security Measures
- Environment variables for all API keys
- Server-side API key handling (never exposed to client)
- Webhook secret validation
- Input sanitization and validation
- HTTPS-only API calls
- No sensitive data in client-side code

---

## Dependencies

### Core Dependencies
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4

### APIs
- Google Cloud Vision API (OCR)
- OpenAI GPT-4o API (AI extraction)
- Google Sheets Apps Script (webhook)

---

## Links

- **Repository:** https://github.com/TOOL2U/AccountingBuddy
- **Release Tag:** v1.0.0-final
- **Production URL:** https://accounting-buddy-seven.vercel.app
- **Documentation:** `/docs` folder
- **Setup Guide:** `GOOGLE_SHEETS_SETUP.md`
- **Testing Guide:** `TESTING.md`
- **Security Guide:** `SECURITY.md`
- **Deployment Guide:** `DEPLOYMENT.md`

---

## Contributors

- **Augment Agent** - Development & QA
- **Project Manager** - Project oversight
- **Assistant** - Code review

---

## Notes

### Known Limitations (Phase 1)
- Receipt images are not persisted (in-memory only)
- Inbox shows mock data (not connected to backend)
- No user authentication
- No receipt editing after submission
- Single-user design (no multi-tenancy)

### Future Enhancements (Phase 2)
- Database integration (PostgreSQL/Supabase)
- User authentication (Clerk/Auth0/Supabase Auth)
- Receipt image storage (S3/Cloudinary/Supabase Storage)
- Receipt history and editing
- Export functionality (CSV, Excel, PDF)
- Analytics dashboard with visualizations
- Multi-user support with authentication
- Receipt search and filtering
- Batch upload support
- Mobile app (React Native)
- Recurring transactions
- Advanced reporting

---

**Last Updated:** October 24, 2025
**Version:** 1.0.0-final
**Status:** ✅ Production-Ready

---

## Version History Summary

| Version | Date | Description | Commit |
|---------|------|-------------|--------|
| 1.0.0-final | 2025-10-24 | Schema expansion + dropdown enhancements | `dff3f9e` |
| 1.0.0-rc1 | 2025-10-24 | MVP complete (Stages 0-4) | Earlier |
| 0.4.0 | 2025-10-24 | Stage 4 - Polish & optimization | Earlier |
| 0.3.0 | 2025-10-24 | Stage 3 - Google Sheets integration | Earlier |
| 0.2.0 | 2025-10-24 | Stage 2 - AI extraction | Earlier |
| 0.1.0 | 2025-10-23 | Stage 1 - OCR integration | Earlier |
| 0.0.1 | 2025-10-23 | Stage 0 - UI scaffold | Earlier |

