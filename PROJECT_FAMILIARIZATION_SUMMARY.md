# 🎯 Accounting Buddy - Complete Project Familiarization Summary

**Generated:** October 29, 2025  
**Version:** Current State Analysis  
**Branch:** feat/upload-manual-entry-and-styling

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Structure](#architecture--structure)
4. [Data Flow](#data-flow)
5. [Key Features](#key-features)
6. [Environment Configuration](#environment-configuration)
7. [API Endpoints](#api-endpoints)
8. [Components & UI](#components--ui)
9. [Utilities & Services](#utilities--services)
10. [Google Sheets Integration](#google-sheets-integration)
11. [Development Workflows](#development-workflows)
12. [Deployment](#deployment)
13. [Current Status & Known Issues](#current-status--known-issues)

---

## 🎯 Project Overview

**Accounting Buddy** is an AI-powered receipt tracking and P&L automation system that converts receipts (images/PDFs) into structured accounting data and logs them to Google Sheets.

### Core Purpose
Convert receipts → OCR → AI Extract → Human Review → Google Sheets

### Target Users
- Small business owners
- Property managers
- Accountants needing fast data entry

### Current State
- **Version:** 1.0.0-final (production-ready)
- **Completion:** ~95% (core features complete)
- **Deployment:** Configured for Vercel
- **Status:** Active development on feature branch

---

## 🛠 Technology Stack

### Frontend
- **Framework:** Next.js 15.0.0 (App Router)
- **Language:** TypeScript 5.5.3
- **Styling:** Tailwind CSS 4.1.16
- **Animation:** Framer Motion 11.2.10
- **Icons:** Lucide React 0.548.0
- **Runtime:** React 18.2.0

### Backend/API
- **Server:** Next.js API Routes (serverless)
- **OCR:** Google Cloud Vision API
- **AI:** OpenAI GPT-4o
- **Database:** Google Sheets (via Apps Script webhook)

### Build Tools
- **Compiler:** Next.js with Turbopack
- **Dev Tools:** ESLint, Autoprefixer, PostCSS
- **Package Manager:** npm

### External Services
- **Google Cloud Vision API** - OCR text extraction
- **OpenAI API** - Structured data extraction
- **Google Apps Script** - Webhook for Sheets integration
- **Vercel** - Deployment platform (configured)

---

## 📁 Architecture & Structure

```
accounting-buddy-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Navigation
│   ├── page.tsx                 # Redirects to /upload
│   ├── globals.css              # Global styles + Tailwind
│   │
│   ├── upload/                  # 📸 Upload Page
│   │   └── page.tsx            # Drag-drop + manual entry
│   │
│   ├── review/                  # ✏️ Review Page
│   │   └── [id]/page.tsx       # Edit extracted data
│   │
│   ├── inbox/                   # 📥 Inbox Page
│   │   └── page.tsx            # View all entries
│   │
│   ├── pnl/                     # 📊 P&L Dashboard
│   │   └── page.tsx            # Profit & Loss view
│   │
│   ├── admin/                   # ⚙️ Admin Section
│   │   ├── page.tsx            # Admin dashboard
│   │   └── ai/                 # AI management
│   │       └── page.tsx        # AI prompts/rules editor
│   │
│   └── api/                     # 🔌 API Routes
│       ├── ocr/route.ts        # Google Vision OCR
│       ├── extract/route.ts    # OpenAI extraction
│       ├── sheets/route.ts     # Google Sheets webhook
│       ├── inbox/route.ts      # Fetch all entries
│       ├── pnl/route.ts        # P&L data endpoint
│       └── ai/                 # AI management APIs
│           ├── prompts/route.ts
│           ├── rules/route.ts
│           ├── logs/route.ts
│           └── test/route.ts
│
├── components/                  # 🧩 React Components
│   ├── Navigation.tsx          # Top nav bar
│   ├── BottomBar.tsx           # Mobile bottom nav
│   ├── Card.tsx                # Styled card wrapper
│   ├── Toast.tsx               # Toast notifications
│   ├── ConfidenceBadge.tsx     # AI confidence indicator
│   ├── PropertyPersonModal.tsx # Property/Person selector
│   ├── CommandSelect.tsx       # Command palette
│   ├── Progress.tsx            # Progress indicator
│   ├── SkeletonCard.tsx        # Loading skeleton
│   ├── ui/                     # UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   └── admin/                  # Admin components
│
├── utils/                       # 🔧 Utility Functions
│   ├── matchOption.ts          # Fuzzy matching engine
│   ├── manualParse.ts          # Manual entry parser
│   ├── validatePayload.ts      # Data validation
│   ├── vendorCache.ts          # Vendor-category cache
│   ├── imageCompression.ts     # Image optimization
│   ├── aiLogger.ts             # AI event logging
│   ├── errorTracking.ts        # Error tracking
│   └── enhancedPrompt.ts       # ⚠️ NOT USED (legacy)
│
├── config/                      # ⚙️ Configuration
│   ├── options.json            # Dropdown options + keywords
│   ├── live-dropdowns.json     # Synced from Sheets
│   └── enhanced-keywords.json  # Extended keyword mappings
│
├── scripts/                     # 🔨 Utility Scripts
│   ├── fetch-live-dropdowns.js # Sync from Sheets
│   ├── sync-from-sheets.js     # Sync dropdown data
│   ├── test-manual-parser.mjs  # Parser testing
│   ├── test-ai-training.js     # AI testing
│   └── [...50+ test scripts]
│
├── docs/                        # 📚 Documentation
│   ├── MASTER_ONBOARDING_PROMPT.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── KEYWORD_RECOGNITION_GUIDE.md
│   └── prompts/                # Build prompts (00-04)
│
├── public/                      # 📦 Static Assets
│   └── favicon.svg
│
├── .env.local                   # 🔐 Environment Variables
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
│
└── Documentation Files          # 📄 Project Docs
    ├── README.md               # Main documentation
    ├── CHANGELOG.md            # Version history
    ├── DEPLOYMENT.md           # Deployment guide
    ├── COMPLETE_SYSTEM_OVERVIEW.md  # Architecture
    ├── AI_IMPLEMENTATION_AUDIT.md   # AI analysis
    ├── PROJECT_STATUS_REPORT.md     # Progress report
    └── COMPLETE_APPS_SCRIPT_V6_FINAL.js  # Google Apps Script
```

---

## 🔄 Data Flow

### **1. Receipt Upload Flow**

```
User uploads image/PDF
    ↓
[Upload Page] /upload
    ↓
Image compression (if > 1MB)
    ↓
[OCR API] /api/ocr
    ├→ Google Cloud Vision API
    └→ Extract text from image
    ↓
[Extract API] /api/extract
    ├→ Pass text + optional comment
    ├→ Call OpenAI GPT-4o
    ├→ Extract 10-field schema
    └→ Fuzzy match dropdowns
    ↓
[Review Page] /review/[id]
    ├→ Show extracted data
    ├→ Display confidence badges
    ├→ Allow manual edits
    └→ Validate fields
    ↓
[Sheets API] /api/sheets
    ├→ Validate payload
    ├→ Normalize dropdowns
    └→ POST to Google Apps Script
    ↓
[Google Sheets]
    └→ Append to row 7+
```

### **2. Manual Entry Flow**

```
User types command
    ↓
[Upload Page] Manual entry field
    ↓
[Manual Parser] utils/manualParse.ts
    ├→ Extract amount, property, operation, payment
    ├→ Use fuzzy matching
    └→ Calculate confidence score
    ↓
[AI Fallback] /api/extract (if confidence < 0.75)
    └→ Call OpenAI for better extraction
    ↓
[Review Page] /review/[id]
    └→ Same as receipt flow
```

### **3. Data Schema (10 Fields)**

The system uses a **10-field accounting schema** matching Google Sheets:

| Column | Field | Type | Example | Description |
|--------|-------|------|---------|-------------|
| B | day | string | "27" | Day of month |
| C | month | string | "Feb" | 3-letter abbreviation |
| D | year | string | "2025" | 4-digit year |
| E | property | string | "Sia Moon - Land - General" | Property name (dropdown) |
| F | typeOfOperation | string | "EXP - Construction - Wall" | Operation category (dropdown) |
| G | typeOfPayment | string | "Bank transfer" | Payment method (dropdown) |
| H | detail | string | "Materials" | Transaction description |
| I | ref | string | "" | Invoice/reference (optional) |
| J | debit | number | 4785 | Expense amount |
| K | credit | number | 0 | Income amount |

**Note:** Column A is empty (reserved for row numbers)

---

## 🎯 Key Features

### **1. Dual Input Methods**

#### Receipt Upload
- **Supported formats:** JPG, PNG, PDF
- **Drag-and-drop interface**
- **Mobile camera capture** (iOS/Android)
- **Image compression** (65% reduction for images > 1MB)
- **Optional comment field** for context

#### Manual Quick Entry
- **Command-line style** input
- **Smart parsing** with fuzzy matching
- **Category search** with autocomplete
- **Command history** (arrow keys, last 5 commands)
- **AI fallback** for low confidence

### **2. AI-Powered Extraction**

#### OCR (Google Cloud Vision)
- **Multi-format support** (images + PDFs)
- **Retry logic** with exponential backoff
- **Error handling** with graceful degradation
- **Base64 encoding** for API calls

#### GPT-4o Extraction
- **Structured JSON** output
- **10-field schema** extraction
- **Context-aware** (uses optional comment)
- **Keyword recognition** (~255 keywords)
- **Confidence scoring** per field
- **Fallback handling** for parsing errors

### **3. Fuzzy Matching System**

**File:** `utils/matchOption.ts`

#### Algorithms
- **Levenshtein distance** for string similarity
- **Keyword matching** with exact/contains/fuzzy
- **Word boundary detection** (prevents "sia" matching "alesia")
- **Confidence thresholds** (0.8 for "matched")

#### Match Functions
- `matchProperty()` - Property name matching
- `matchTypeOfOperation()` - Category matching
- `matchTypeOfPayment()` - Payment method matching
- `normalizeDropdownFields()` - Batch normalization

### **4. Review & Edit Interface**

#### Features
- **Dropdown selects** (populated from config/options.json)
- **Confidence badges** (⚠️ for < 0.8)
- **Visual warnings** for uncertain matches
- **Manual override** allowed
- **Validation** before submission
- **Property/Person modal** for quick selection

#### Validation
- **Client-side** validation in React
- **Server-side** validation in API
- **Final normalization** before Sheets webhook
- **Invalid category detection** (empty strings blocked)

### **5. Vendor Caching**

**File:** `utils/vendorCache.ts`

- **localStorage-based** caching
- **Vendor → Category** mapping
- **100% cache hit** for repeat vendors
- **Reduces API calls** and costs

### **6. Image Compression**

**File:** `utils/imageCompression.ts`

- **Automatic compression** for images > 1MB
- **65% average reduction** in file size
- **Quality:** 0.8 (configurable)
- **Max dimensions:** 1920x1920px
- **Cost savings:** ~65% on Vision API

### **7. Admin Panel**

**Route:** `/admin`

#### Features
- **AI prompt editor** (fetches from Sheets)
- **Keyword rules manager** (255+ rules)
- **AI test console** (test extraction)
- **Event logs viewer** (debug AI behavior)
- **Named ranges discovery** (auto-detect Sheets structure)

---

## 🔐 Environment Configuration

### **Required Variables**

```bash
# Google Cloud Vision API Key (for OCR)
GOOGLE_VISION_KEY=AIzaSy...

# OpenAI API Key (for AI extraction)
OPENAI_API_KEY=sk-proj-...

# Google Apps Script Webhook
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
SHEETS_WEBHOOK_SECRET=VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=

# Google Sheet ID (for dropdown sync)
GOOGLE_SHEET_ID=1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8

# Optional: Service Account (alternative to API key)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Optional: Sentry (error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...

# Optional: Mock mode (for testing)
NEXT_PUBLIC_MOCK=false
```

### **Current Configuration**

```bash
# Located in: .env.local
GOOGLE_VISION_KEY=AIzaSyCloPZlRjHB0-3c57WX7AN7uOnyODSOlc0
OPENAI_API_KEY=sk-proj-3SuACS4XSuf6GOI4IGbTMSg8xbRBAPNV_...
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec
SHEETS_WEBHOOK_SECRET=VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=
GOOGLE_SHEET_ID=1UnCopzurl27VRqVDSIgrro5KyAfuP9T0GRePrtljAR8
```

---

## 🔌 API Endpoints

### **Core APIs**

#### **POST /api/ocr**
Extract text from image/PDF using Google Vision API

**Request:**
```typescript
FormData {
  file: File (JPG/PNG/PDF)
}
```

**Response:**
```json
{
  "id": "ocr-1698765432123",
  "text": "Extracted text from receipt...",
  "timestamp": "2025-10-29T10:30:00Z"
}
```

**Features:**
- File validation (type, size)
- Base64 encoding
- Retry logic (3 attempts with exponential backoff)
- Error handling with fallback

---

#### **POST /api/extract**
Extract structured data using OpenAI GPT-4o

**Request:**
```json
{
  "text": "Receipt text here",
  "comment": "Optional context (e.g., 'wall materials')",
  "preparse": { /* Optional manual parse data */ }
}
```

**Response:**
```json
{
  "day": "27",
  "month": "Feb",
  "year": "2025",
  "property": "Sia Moon - Land - General",
  "typeOfOperation": "EXP - Construction - Wall",
  "typeOfPayment": "Bank transfer",
  "detail": "Materials",
  "ref": "",
  "debit": 4785,
  "credit": 0,
  "confidence": {
    "property": 1.0,
    "typeOfOperation": 0.95,
    "typeOfPayment": 1.0
  }
}
```

**Features:**
- Dynamic prompt with dropdown options
- Comment context integration
- Fuzzy matching normalization
- Confidence scoring
- Fallback handling

---

#### **POST /api/sheets**
Send data to Google Sheets via Apps Script webhook

**Request:**
```json
{
  "day": "27",
  "month": "Feb",
  "year": "2025",
  "property": "Sia Moon - Land - General",
  "typeOfOperation": "EXP - Construction - Wall",
  "typeOfPayment": "Bank transfer",
  "detail": "Materials",
  "ref": "",
  "debit": 4785,
  "credit": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Receipt added to Google Sheet successfully"
}
```

**Features:**
- Payload validation
- Dropdown normalization
- Webhook authentication
- Error handling

---

### **Admin APIs**

#### **POST /api/ai/prompts**
Get AI prompt from Google Sheets

**Request:**
```json
{
  "action": "getPrompt",
  "secret": "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="
}
```

**Response:**
```json
{
  "ok": true,
  "prompt": "You are an expert accounting..."
}
```

---

#### **POST /api/ai/rules**
Get keyword rules from Google Sheets

**Request:**
```json
{
  "action": "getRules",
  "secret": "..."
}
```

**Response:**
```json
{
  "ok": true,
  "rules": [
    { "keyword": "wall", "category": "EXP - Construction - Wall", "priority": 100 },
    { "keyword": "salary", "category": "EXP - HR - Employees Salaries", "priority": 100 }
  ]
}
```

---

#### **POST /api/ai/test**
Test AI extraction with custom prompt

**Request:**
```json
{
  "text": "Test receipt text",
  "prompt": "Custom prompt (optional)"
}
```

**Response:**
```json
{
  "ok": true,
  "data": { /* Extracted data */ },
  "responseTime": 1234,
  "tokensUsed": 567
}
```

---

### **Data APIs**

#### **POST /api/inbox**
Fetch all accounting entries

**Request:**
```json
{
  "action": "getInbox",
  "secret": "..."
}
```

**Response:**
```json
{
  "ok": true,
  "entries": [
    {
      "rowNumber": 7,
      "day": "27",
      "month": "Feb",
      "year": "2025",
      "property": "Sia Moon - Land - General",
      "typeOfOperation": "EXP - Construction - Wall",
      "typeOfPayment": "Bank transfer",
      "detail": "Materials",
      "ref": "",
      "debit": 4785,
      "credit": 0
    }
  ]
}
```

---

#### **POST /api/pnl**
Fetch P&L summary with property/person breakdown

**Request:**
```json
{
  "action": "getPnL",
  "secret": "...",
  "property": "Sia Moon - Land - General", // Optional filter
  "person": "Shaun Ducker" // Optional filter
}
```

**Response:**
```json
{
  "ok": true,
  "summary": {
    "totalRevenue": 150000,
    "totalExpenses": 85000,
    "netIncome": 65000
  },
  "byProperty": { /* Breakdown by property */ },
  "byPerson": { /* Breakdown by person */ }
}
```

---

## 🧩 Components & UI

### **Theme & Design System**

**File:** `tailwind.config.ts`

#### Color Palette (Dark Theme)
```typescript
colors: {
  // Surfaces (dark mode)
  'surface-0': '#0B0F14',
  'surface-1': 'rgba(255, 255, 255, 0.03)',
  'surface-2': 'rgba(255, 255, 255, 0.06)',
  'surface-3': 'rgba(255, 255, 255, 0.09)',
  
  // Text
  'text-primary': '#FFFFFF',
  'text-secondary': '#9CA3AF',
  'text-tertiary': '#6B7280',
  
  // Brand
  'brand-primary': '#60A5FA',
  'brand-secondary': '#3B82F6',
  
  // Status
  'status-success': '#10B981',
  'status-warning': '#F59E0B',
  'status-danger': '#EF4444',
  'status-info': '#06B6D4',
  
  // Borders
  'border-light': 'rgba(255, 255, 255, 0.10)',
  'border-medium': 'rgba(255, 255, 255, 0.15)',
}
```

#### Shadows
```typescript
boxShadow: {
  'elev-1': '0 1px 12px rgba(255, 255, 255, 0.04)',
  'elev-2': '0 6px 30px rgba(255, 255, 255, 0.06)',
  'elev-3': '0 12px 48px rgba(255, 255, 255, 0.08)',
}
```

---

### **Component Library**

#### **Navigation** (`components/Navigation.tsx`)
- **Desktop:** Horizontal nav with logo + links
- **Mobile:** Bottom bar with icons
- **Routes:** Upload, Inbox, P&L, Admin
- **Responsive:** Adapts at `md` breakpoint

#### **Card** (`components/Card.tsx`)
- **Wrapper:** Styled container with padding
- **Variants:** Default, elevated, bordered
- **Props:** `className`, `children`

#### **Button** (`components/ui/Button.tsx`)
- **Variants:** Primary, secondary, ghost, danger
- **Sizes:** sm, md, lg
- **States:** Loading, disabled
- **Icons:** Optional left/right icons

#### **Toast** (`components/Toast.tsx`)
- **Types:** Success, error, info, warning
- **Animation:** Slide-in from top
- **Auto-dismiss:** 5 seconds (configurable)
- **Queue:** Multiple toasts supported

#### **ConfidenceBadge** (`components/ConfidenceBadge.tsx`)
- **Display:** Confidence score with icon
- **Colors:** Green (>0.8), yellow (<0.8), red (<0.5)
- **Text:** "High confidence" / "Needs review" / "Low confidence"

#### **PropertyPersonModal** (`components/PropertyPersonModal.tsx`)
- **Purpose:** Quick property/person selection
- **UI:** Full-screen modal with tabs
- **State:** Controlled by parent component
- **Keyboard:** ESC to close

---

### **Page Components**

#### **Upload Page** (`app/upload/page.tsx`)
**Features:**
- Drag-and-drop zone
- File validation
- Image preview
- Manual entry field
- Category search
- Command history
- Mobile camera capture
- Sticky submit button (mobile)

**State Management:**
- `file` - Selected file
- `preview` - Image preview URL
- `comment` - Optional context
- `manualCommand` - Manual entry text
- `categorySearch` - Category autocomplete
- `selectedCategory` - Pre-selected category

---

#### **Review Page** (`app/review/[id]/page.tsx`)
**Features:**
- Editable form fields
- Dropdown selects
- Confidence badges
- Validation errors
- Submit to Sheets
- Property/Person modal

**State Management:**
- `formData` - All 10 fields
- `errors` - Validation errors
- `isSubmitting` - Loading state
- `showModal` - Property modal visibility

---

#### **Inbox Page** (`app/inbox/page.tsx`)
**Features:**
- Table view (desktop)
- Card view (mobile)
- Pagination
- Delete entries
- Filter by property/person
- Export to CSV (planned)

**State Management:**
- `entries` - Fetched data
- `loading` - Loading state
- `currentPage` - Pagination
- `filters` - Active filters

---

#### **P&L Page** (`app/pnl/page.tsx`)
**Features:**
- Summary cards (revenue, expenses, net)
- Property breakdown
- Person breakdown
- Chart visualization (planned)
- Date range filter (planned)

**State Management:**
- `summary` - P&L totals
- `byProperty` - Property breakdown
- `byPerson` - Person breakdown
- `loading` - Loading state

---

## 🔧 Utilities & Services

### **Fuzzy Matching** (`utils/matchOption.ts`)

#### Core Functions

**`calculateSimilarity(str1, str2): number`**
- Levenshtein distance algorithm
- Normalized to 0-1 range
- Exact match: 1.0
- Contains match: 0.9
- Fuzzy match: 0.7-0.9

**`matchKeywords(input, keywords[]): number`**
- Exact match: 1.0
- Word boundary match: 0.95
- Contains match: 0.95
- Fuzzy similarity: 0.9 * similarity
- Prevents partial matches ("sia" in "alesia")

**`matchProperty(input, comment?): MatchResult`**
- Priority shortcuts (exact matches)
- Keyword matching
- Similarity fallback
- Default: "Sia Moon - Land - General"

**`matchTypeOfOperation(input, comment?): MatchResult`**
- Exact match priority
- Keyword matching (~200 keywords)
- Similarity fallback
- Default: "" (empty string)

**`matchTypeOfPayment(input): MatchResult`**
- Exact match priority
- Keyword matching (~15 keywords)
- Similarity fallback
- Default: "Cash"

---

### **Manual Parser** (`utils/manualParse.ts`)

#### Core Functions

**`parseManualCommand(input): ParseResult`**
- Extract transaction type (debit/credit)
- Extract amount (with currency support)
- Parse date (DD/MM/YYYY, Buddhist Era support)
- Extract property, payment, operation
- Extract detail/description
- Calculate confidence score
- Default to debit if unclear

**`getCommandHistory(): string[]`**
- Fetch from localStorage
- Max 5 commands
- Returns empty array if unavailable

**`saveCommandToHistory(command): void`**
- Save to localStorage
- Remove duplicates
- Keep last 5 commands

---

### **Validation** (`utils/validatePayload.ts`)

#### Core Functions

**`validatePayload(data): ValidationResult`**
- Validate all 10 fields
- Sanitize strings
- Remove currency symbols
- Check required fields
- Validate numeric amounts
- Return errors array

**`sanitizeString(str): string`**
- Trim whitespace
- Remove special characters
- Capitalize first letter

---

### **Vendor Cache** (`utils/vendorCache.ts`)

#### Core Functions

**`getCachedCategory(vendor): string | null`**
- Fetch from localStorage
- Return null if not cached

**`cacheVendorCategory(vendor, category): void`**
- Save to localStorage
- Overwrite existing

**Cache Format:**
```json
{
  "ab_vendor_cache": {
    "Materials": "EXP - Construction - Wall",
    "Electrician": "EXP - Repairs & Maintenance - Electrical & Mechanical"
  }
}
```

---

### **Image Compression** (`utils/imageCompression.ts`)

#### Core Functions

**`shouldCompress(file): boolean`**
- Check if file size > 1MB
- Only compress images (not PDFs)

**`compressImage(file): Promise<File>`**
- Create canvas element
- Draw image at reduced size
- Quality: 0.8
- Max dimensions: 1920x1920px
- Return new File object

**`formatFileSize(bytes): string`**
- Convert to KB/MB
- Return formatted string

---

### **AI Logger** (`utils/aiLogger.ts`)

#### Core Functions

**`logEvent(event, type, message, metadata?): void`**
- Console logging
- localStorage persistence
- Event types: SYSTEM, AI, WEBHOOK, ERROR
- Metadata support (JSON)

**`getEventLogs(): Log[]`**
- Fetch from localStorage
- Return parsed array

**`clearEventLogs(): void`**
- Clear localStorage

**Log Format:**
```json
{
  "timestamp": "2025-10-29T10:30:00Z",
  "event": "AI extraction started",
  "type": "AI",
  "message": "Text length: 234 chars",
  "metadata": { "confidence": 0.95 }
}
```

---

## 📊 Google Sheets Integration

### **Apps Script V7.0**

**File:** `COMPLETE_APPS_SCRIPT_V6_FINAL.js` (1521 lines)

#### Deployment
1. Open Google Apps Script editor
2. Delete all existing code
3. Paste V7.0 code
4. Deploy as web app
5. Copy webhook URL

#### Configuration
```javascript
const EXPECTED_SECRET = "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=";
const CACHE_TTL_SECONDS = 60;
const SHEET_NAME = 'Accounting Buddy P&L 2025';
const HEADER_ROW = 6;
```

---

### **Endpoints**

#### **1. Webhook (Append Data)**
```javascript
{
  "day": "27",
  "month": "Feb",
  "year": "2025",
  "property": "Sia Moon - Land - General",
  "typeOfOperation": "EXP - Construction - Wall",
  "typeOfPayment": "Bank transfer",
  "detail": "Materials",
  "ref": "",
  "debit": 4785,
  "credit": 0,
  "secret": "VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Success"
}
```

---

#### **2. Get Inbox**
```javascript
{
  "action": "getInbox",
  "secret": "..."
}
```

**Response:**
```json
{
  "ok": true,
  "entries": [...]
}
```

---

#### **3. Get P&L**
```javascript
{
  "action": "getPnL",
  "secret": "...",
  "property": "Sia Moon - Land - General", // Optional
  "person": "Shaun Ducker" // Optional
}
```

**Response:**
```json
{
  "ok": true,
  "summary": {
    "totalRevenue": 150000,
    "totalExpenses": 85000,
    "netIncome": 65000
  },
  "byProperty": {...},
  "byPerson": {...}
}
```

---

#### **4. Delete Entry**
```javascript
{
  "action": "deleteEntry",
  "secret": "...",
  "rowNumber": 10
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Entry deleted"
}
```

---

#### **5. Get AI Prompt**
```javascript
{
  "action": "getPrompt",
  "secret": "..."
}
```

**Response:**
```json
{
  "ok": true,
  "prompt": "You are an expert accounting..."
}
```

---

#### **6. Update AI Prompt**
```javascript
{
  "action": "updatePrompt",
  "secret": "...",
  "prompt": "New prompt text..."
}
```

---

#### **7. Get Keyword Rules**
```javascript
{
  "action": "getRules",
  "secret": "..."
}
```

**Response:**
```json
{
  "ok": true,
  "rules": [
    { "keyword": "wall", "category": "EXP - Construction - Wall", "priority": 100 }
  ]
}
```

---

#### **8. Update Keyword Rules**
```javascript
{
  "action": "updateRules",
  "secret": "...",
  "rules": [...]
}
```

---

#### **9. List Named Ranges**
```javascript
{
  "action": "list_named_ranges",
  "secret": "..."
}
```

**Response:**
```json
{
  "ok": true,
  "ranges": {
    "Total_Expenses": { "a1": "C1", "value": 85000, "sheet": "P&L" },
    "AI_Prompts": { "a1": "A1", "value": "...", "sheet": "Config" }
  }
}
```

---

### **Required Named Ranges**

The Apps Script expects these named ranges in Google Sheets:

#### **P&L Metrics** (Auto-discovered)
- `Total_Expenses` - Total expenses cell
- `Total_Revenue` - Total revenue cell
- `Net_Income` - Net income cell

#### **AI Management** (Manual setup required)
- `AI_Prompts` - Single cell with AI prompt text
- `AI_KeywordRules` - Table with columns: keyword | category | priority

---

### **Google Sheet Structure**

**Sheet Name:** "Accounting Buddy P&L 2025"

```
Row 1-5: Headers and summary
Row 6: Column headers (Day | Month | Year | Property | ...)
Row 7+: Data rows

Columns:
A: (empty for row numbers)
B: Day
C: Month
D: Year
E: Property (dropdown validation)
F: Type of Operation (dropdown validation)
G: Type of Payment (dropdown validation)
H: Detail
I: Ref
J: Debit
K: Credit
```

---

## 🏗 Development Workflows

### **Start Development Server**

```bash
npm run dev              # Turbopack mode (faster)
npm run dev:normal       # Normal mode
npm run dev:persistent   # Background server
npm run dev:status       # View server logs
npm run dev:stop         # Stop background server
```

---

### **Build & Deploy**

```bash
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

---

### **Testing Scripts**

```bash
# Sync dropdown data from Google Sheets
npm run fetch-dropdowns
npm run sync-dropdowns

# Inspect Sheet validation rules
npm run inspect-sheet

# Test manual parser
node scripts/test-manual-parser.mjs

# Test AI extraction
node scripts/test-ai-training.js

# Test keyword matching
node scripts/test-keywords-simple.js
```

---

### **Git Workflow**

**Current Branch:** `feat/upload-manual-entry-and-styling`

```bash
# View current status
git status

# View changes
git diff

# Commit changes
git add .
git commit -m "Description"

# Push to remote
git push origin feat/upload-manual-entry-and-styling

# Switch branches
git checkout main
git checkout -b new-feature-branch
```

---

## 🚀 Deployment

### **Vercel Deployment**

#### **Prerequisites**
- GitHub account
- Vercel account
- All environment variables ready

#### **Steps**
1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables
4. Deploy

**Environment Variables (Vercel):**
```
GOOGLE_VISION_KEY=...
OPENAI_API_KEY=...
SHEETS_WEBHOOK_URL=...
SHEETS_WEBHOOK_SECRET=...
NODE_ENV=production
```

#### **Deployment URL**
```
Production: https://your-app.vercel.app
Staging: https://your-app-git-branch.vercel.app
```

---

### **Build Configuration**

**File:** `next.config.js`

```javascript
module.exports = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}
```

---

### **TypeScript Configuration**

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 📈 Current Status & Known Issues

### **✅ Completed Features**

1. **Stage 0: UI Scaffold** ✅
   - Next.js + TypeScript + Tailwind
   - Responsive design
   - Navigation system

2. **Stage 1: OCR Integration** ✅
   - Google Vision API
   - Retry logic
   - Error handling

3. **Stage 2: AI Extraction** ✅
   - OpenAI GPT-4o
   - 10-field schema
   - Confidence scoring

4. **Stage 3: Sheets Integration** ✅
   - Google Apps Script webhook
   - Validation
   - Normalization

5. **Stage 4: Production Polish** ✅
   - Animations
   - Image compression
   - Vendor caching

6. **Stage 5: Manual Entry** ✅
   - Command-line style input
   - Fuzzy matching
   - AI fallback

7. **Stage 6: Dropdown Selection** ✅
   - Comment-guided extraction
   - Fuzzy matching system
   - Confidence badges

8. **Stage 7: Admin Panel** 🚧 In Progress
   - AI prompt editor ✅
   - Keyword rules manager ✅
   - Event logs viewer ✅
   - Test console ✅

---

### **⚠️ Known Issues**

1. **AI Prompt Inconsistency**
   - **Issue:** Hardcoded prompt in `/api/extract` has different keywords than `config/options.json`
   - **Impact:** Some categories don't match dropdown options
   - **Solution:** Use dynamic prompt from Google Sheets
   - **Status:** Documented in `AI_IMPLEMENTATION_AUDIT.md`

2. **Enhanced Prompt Utility Not Used**
   - **File:** `utils/enhancedPrompt.ts`
   - **Issue:** Exported but never imported
   - **Solution:** Delete or integrate
   - **Status:** Low priority (legacy code)

3. **Named Ranges Required**
   - **Issue:** `AI_Prompts` and `AI_KeywordRules` not created in Sheets
   - **Impact:** Admin panel features won't work
   - **Solution:** Manual setup in Google Sheets
   - **Status:** Documented in `COMPLETE_SYSTEM_OVERVIEW.md`

4. **Category Mismatch**
   - **Issue:** Some AI-extracted categories like "EXP - Decor" don't exist in dropdown
   - **Impact:** Validation fails, users must manually select
   - **Solution:** Use normalized categories from `config/options.json`
   - **Status:** Partially fixed with fuzzy matching

---

### **🎯 Recommended Next Steps**

#### **High Priority**

1. **Create Named Ranges in Google Sheets**
   - Create `AI_Prompts` (single cell)
   - Create `AI_KeywordRules` (table)
   - Populate with existing keywords

2. **Update Extract API to Use Dynamic Prompt**
   - Fetch prompt from Sheets
   - Add 60-second cache
   - Fallback to hardcoded prompt if unavailable

3. **Test End-to-End**
   - Upload receipt
   - Verify AI extraction
   - Check confidence scores
   - Submit to Sheets

#### **Medium Priority**

4. **Delete Legacy Code**
   - Remove `utils/enhancedPrompt.ts`
   - Clean up unused scripts

5. **Add Prompt Caching**
   - Cache prompt for 60 seconds
   - Reduce Sheets API calls

6. **Improve Error Messages**
   - User-friendly error text
   - Actionable suggestions

#### **Low Priority**

7. **Add Analytics**
   - Track keyword match rates
   - Monitor AI confidence scores
   - Measure cache hit rates

8. **Add Export Feature**
   - CSV export from inbox
   - Date range filter
   - Property filter

---

## 📚 Documentation Files Reference

### **Project Documentation**
- `README.md` - Main documentation, feature list
- `CHANGELOG.md` - Version history (405 lines)
- `DEPLOYMENT.md` - Vercel deployment guide
- `COMPLETE_SYSTEM_OVERVIEW.md` - Architecture overview
- `PROJECT_STATUS_REPORT.md` - Current progress
- `AI_IMPLEMENTATION_AUDIT.md` - AI analysis (318 lines)

### **Setup Guides**
- `GOOGLE_SHEETS_SETUP.md` - Google Sheets integration
- `APPS_SCRIPT_DEPLOYMENT_GUIDE.md` - Apps Script setup
- `QUICK_SETUP_NAMED_RANGES.md` - Named ranges guide

### **Feature Documentation**
- `PNL_FEATURE_REPORT.md` - P&L feature details
- `INBOX_DEPLOYMENT_GUIDE.md` - Inbox feature guide
- `MODAL_STYLING_UPDATE.md` - Modal UI updates
- `DESIGN_SYSTEM.md` - UI design system

### **Testing Documentation**
- `TESTING.md` - End-to-end testing guide
- `docs/TESTING.md` - Additional testing docs
- `PRE_TEST_CHECKLIST.md` - Pre-deployment checklist

### **Build Prompts**
- `docs/prompts/00_setup_ui.txt` - Stage 0 build
- `docs/prompts/01_ocr_api.txt` - Stage 1 build
- `docs/prompts/02_extract_api.txt` - Stage 2 build
- `docs/prompts/03_sheets_webhook.txt` - Stage 3 build
- `docs/prompts/04_polish_and_tests.txt` - Stage 4 build

### **Security & Standards**
- `SECURITY.md` - Security guidelines
- `docs/SECURITY.md` - Additional security docs

---

## 🎓 Learning Resources

### **For Future Edits**

When making changes to this project, understand:

1. **Data Flow**
   - How data moves from upload → OCR → AI → review → Sheets
   - Why fuzzy matching is critical
   - How confidence scores affect UX

2. **Architecture Patterns**
   - Next.js App Router structure
   - API route organization
   - Component composition

3. **AI Integration**
   - OpenAI prompt engineering
   - Keyword recognition
   - Fallback handling

4. **Google Sheets Integration**
   - Apps Script deployment
   - Webhook authentication
   - Named ranges usage

5. **TypeScript Patterns**
   - Interface definitions
   - Type safety
   - Error handling

---

## 📞 Support & Contacts

### **Repository**
- **GitHub:** https://github.com/TOOL2U/AccountingBuddy
- **Branch:** feat/upload-manual-entry-and-styling

### **External Services**
- **Google Cloud Console:** https://console.cloud.google.com
- **OpenAI Platform:** https://platform.openai.com
- **Google Apps Script:** https://script.google.com
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## ✅ Familiarization Checklist

Before making edits, ensure you understand:

- [ ] Project purpose and core flow
- [ ] Technology stack (Next.js, TypeScript, Tailwind)
- [ ] 10-field accounting schema
- [ ] Dual input methods (upload + manual)
- [ ] AI extraction process (OCR + GPT-4o)
- [ ] Fuzzy matching system
- [ ] Google Sheets integration (Apps Script)
- [ ] Review page validation
- [ ] Environment variables configuration
- [ ] API endpoint responsibilities
- [ ] Component structure and UI patterns
- [ ] Utility functions (matching, parsing, validation)
- [ ] Current issues and known limitations
- [ ] Deployment process (Vercel)
- [ ] File locations and organization

---

**Last Updated:** October 29, 2025  
**Generated By:** GitHub Copilot  
**Project Version:** 1.0.0-final  
**Documentation Complete:** ✅

