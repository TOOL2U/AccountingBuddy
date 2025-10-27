# 🚀 Vercel Deployment Guide for Accounting Buddy

## 📋 Pre-Deployment Checklist

### ✅ Code Ready
- [x] All features implemented
- [x] Code committed to git
- [x] Dependencies fixed in package.json
- [x] vercel.json configuration added

### 🔑 Required Environment Variables

You'll need to set these in your Vercel dashboard:

```bash
# Google Cloud Vision API Key
GOOGLE_VISION_KEY=your_vision_api_key_here

# OpenAI API Key (for AI extraction)
OPENAI_API_KEY=your_openai_api_key_here

# Google Sheets Webhook URL (from Apps Script deployment)
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Webhook Secret (generate with: openssl rand -base64 32)
SHEETS_WEBHOOK_SECRET=your_long_random_secret_string

# Environment
NODE_ENV=production

# Optional: Sentry DSN for error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

## 🌐 Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Push your latest changes to GitHub:**
   ```bash
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin feat/upload-manual-entry-and-styling
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `TOOL2U/AccountingBuddy`
   - Select branch: `feat/upload-manual-entry-and-styling`

3. **Configure Build Settings:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Add Environment Variables:**
   - In project settings → Environment Variables
   - Add all variables from the list above

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd "/Users/shaun-maria/Desktop/Accounting Buddy copy/accounting-buddy-app"
   vercel --prod
   ```

## 🔧 Post-Deployment Setup

### 1. Configure Google Apps Script

Update your Apps Script with the new Vercel domain:

```javascript
// In your Apps Script doPost function
const ALLOWED_ORIGINS = [
  'https://your-app-name.vercel.app',
  'https://your-domain.com' // if you have a custom domain
];
```

### 2. Update Webhook URLs

After deployment, update your Google Sheets webhook URL in:
- Vercel environment variables
- Google Apps Script deployment

### 3. Test All Features

- ✅ Upload functionality
- ✅ OCR processing
- ✅ AI extraction
- ✅ Manual entry
- ✅ P&L reports
- ✅ Google Sheets integration

## 📊 Project Structure Ready for Deployment

```
accounting-buddy-app/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── extract/       # AI extraction endpoint
│   │   ├── ocr/          # OCR processing
│   │   ├── sheets/       # Google Sheets integration
│   │   ├── pnl/          # P&L reports
│   │   └── inbox/        # Inbox functionality
│   ├── upload/           # Upload page
│   ├── review/           # Review page
│   ├── pnl/             # P&L dashboard
│   ├── inbox/           # Inbox page
│   └── admin/           # Admin dashboard
├── components/           # Reusable components
├── utils/               # Utility functions
├── config/              # Configuration files
├── public/              # Static assets
├── vercel.json          # Vercel configuration
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies (fixed)
└── tailwind.config.ts   # Tailwind CSS config
```

## 🔒 Security Considerations

- ✅ API keys stored in environment variables
- ✅ Webhook secret validation
- ✅ CORS headers configured
- ✅ No sensitive data in code
- ✅ Production environment settings

## 🌍 Expected Deployment URLs

- **Main App:** `https://accounting-buddy-app.vercel.app`
- **API Endpoints:** `https://accounting-buddy-app.vercel.app/api/*`

## 🔍 Monitoring & Debugging

- **Vercel Dashboard:** Real-time logs and metrics
- **Function Logs:** Available in Vercel dashboard
- **Sentry Integration:** Error tracking (if configured)

## 📝 Final Notes

- **Build Time:** ~2-3 minutes
- **Cold Start:** <1 second for API routes
- **Static Assets:** Optimized and cached globally
- **Database:** Google Sheets (no additional DB needed)

Your app is now production-ready! 🎉