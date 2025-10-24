# Deployment Guide - Accounting Buddy

This guide walks you through deploying Accounting Buddy to Vercel for production use.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - Repository must be pushed to GitHub
2. **Vercel Account** - Sign up at https://vercel.com
3. **API Keys Ready:**
   - Google Cloud Vision API key
   - OpenAI API key
   - Google Sheets webhook URL and secret
4. **Google Apps Script Deployed** - Follow `GOOGLE_SHEETS_SETUP.md`

---

## 🚀 Step 1: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import GitHub Repository**
   - Click "Import Git Repository"
   - Select `AccountingBuddy` from your repositories
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `accounting-buddy-app`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   GOOGLE_VISION_KEY=your_actual_vision_api_key
   OPENAI_API_KEY=your_actual_openai_api_key
   SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   SHEETS_WEBHOOK_SECRET=your_actual_webhook_secret
   NODE_ENV=production
   ```

   **Optional (for Sentry):**
   ```
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - You'll get a production URL: `https://your-app.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project directory
cd accounting-buddy-app

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure project
```

---

## 🔧 Step 2: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project → Settings → Environment Variables
2. Add all required variables (see above)
3. Make sure to select "Production" environment
4. Click "Save"

### Verify Environment Variables:

After deployment, check the build logs to ensure all variables are loaded:
- Go to Deployments → Latest Deployment → Build Logs
- Look for "Environments: .env.local" or similar

---

## ✅ Step 3: Verify Deployment

### 1. Check Build Status
- Go to Vercel Dashboard → Your Project → Deployments
- Ensure latest deployment shows "Ready" status
- Check build logs for any errors

### 2. Test Production URL
Visit your production URL and test:

- ✅ Upload page loads correctly
- ✅ Navigation works
- ✅ Drag-and-drop file upload works
- ✅ File validation works (try invalid file type)

### 3. Test API Endpoints
Use curl or Postman to test:

```bash
# Test OCR API (requires valid image file)
curl -X POST https://your-app.vercel.app/api/ocr \
  -F "file=@receipt.jpg"

# Test Extract API
curl -X POST https://your-app.vercel.app/api/extract \
  -H "Content-Type: application/json" \
  -d '{"text":"Sample receipt text"}'

# Test Sheets API
curl -X POST https://your-app.vercel.app/api/sheets \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-24","vendor":"Test","amount":"100","category":"Test"}'
```

---

## 🧪 Step 4: Manual QA Testing

### Test with Real Receipts:

1. **Upload JPG Receipt**
   - Go to `/upload`
   - Upload a real receipt image (JPG)
   - Verify OCR extracts text correctly
   - Verify AI extracts fields correctly
   - Check image compression logs in browser console

2. **Upload PNG Receipt**
   - Repeat with PNG format
   - Verify same functionality

3. **Upload PDF Receipt**
   - Repeat with PDF format
   - Verify OCR handles PDF correctly

4. **Edit and Submit**
   - Go to review page
   - Edit fields if needed
   - Click "Send to Google Sheet"
   - Verify success toast appears
   - Check Google Sheet for new row

5. **Test Vendor Caching**
   - Upload receipt from same vendor twice
   - Check browser console for cache hit message
   - Verify category is auto-populated on second upload

### Test on Mobile:

1. **iOS Safari**
   - Open production URL on iPhone
   - Test upload, review, and submit
   - Verify responsive design

2. **Android Chrome**
   - Open production URL on Android
   - Test same functionality
   - Verify responsive design

---

## 📊 Step 5: Set Up Monitoring

### Option A: Vercel Analytics (Built-in)

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Vercel Analytics (free tier available)
3. Monitor:
   - Page views
   - Performance metrics
   - Error rates

### Option B: Sentry (Recommended for Error Tracking)

1. **Create Sentry Account**
   - Sign up at https://sentry.io
   - Create new project (Next.js)

2. **Get Sentry DSN**
   - Go to Settings → Projects → Your Project
   - Copy DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)

3. **Add to Vercel**
   - Go to Vercel → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn`
   - Redeploy

4. **Install Sentry SDK (Optional - for advanced features)**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

---

## 🔍 Step 6: Monitor Performance

### Check After 24 Hours:

1. **API Usage**
   - Google Vision API: Check usage in Google Cloud Console
   - OpenAI API: Check usage in OpenAI dashboard
   - Estimate costs based on usage

2. **Cache Performance**
   - Check browser console logs for cache hit/miss ratios
   - Verify vendor caching is working

3. **Error Rates**
   - Check Sentry for any errors
   - Check Vercel logs for failed requests

4. **Performance Metrics**
   - Page load times
   - API response times
   - Image compression effectiveness

---

## 📝 Step 7: Create Deployment Verification Report

After 24 hours of production monitoring, document:

### Performance Metrics:
- Average page load time
- Average API response time (OCR, Extract, Sheets)
- Cache hit rate (vendor-category caching)
- Image compression rate (average size reduction)

### Error Metrics:
- Total errors in 24 hours
- Error rate (errors per request)
- Most common errors
- API failure rate

### Cost Metrics:
- Google Vision API calls and cost
- OpenAI API calls and cost
- Estimated monthly cost

### Recommendations:
- Any optimizations needed
- Any bugs to fix
- Any features to add

---

## 🚨 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Solution: Ensure all dependencies are in `package.json`
- Run `npm install` locally and commit `package-lock.json`

**Error: "Environment variable not found"**
- Solution: Add missing environment variables in Vercel dashboard
- Redeploy after adding variables

### API Errors

**Error: "Google Vision API 401"**
- Solution: Check `GOOGLE_VISION_KEY` is correct
- Verify API is enabled in Google Cloud Console

**Error: "OpenAI API 401"**
- Solution: Check `OPENAI_API_KEY` is correct
- Verify you have credits in OpenAI account

**Error: "Sheets webhook 401"**
- Solution: Check `SHEETS_WEBHOOK_SECRET` matches Apps Script
- Verify Apps Script is deployed as web app

### Performance Issues

**Slow page loads**
- Check Vercel Analytics for bottlenecks
- Verify images are being compressed
- Check API response times

**High API costs**
- Verify image compression is working
- Check cache hit rates
- Consider reducing image quality or max dimensions

---

## 🔄 Redeployment

### To redeploy after code changes:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Automatic Deployment**
   - Vercel automatically deploys on push to `main`
   - Check Vercel dashboard for deployment status

3. **Manual Redeploy**
   - Go to Vercel Dashboard → Deployments
   - Click "..." → "Redeploy"

---

## 📚 Additional Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Sentry Next.js Guide:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Google Cloud Vision API:** https://cloud.google.com/vision/docs
- **OpenAI API:** https://platform.openai.com/docs

---

## ✅ Deployment Checklist

Before marking deployment as complete:

- [ ] Vercel project created and deployed
- [ ] All environment variables configured
- [ ] Build completed successfully
- [ ] Production URL accessible
- [ ] Upload page works
- [ ] OCR API works with real receipts
- [ ] AI extraction works
- [ ] Google Sheets integration works
- [ ] Vendor caching works
- [ ] Image compression works
- [ ] Mobile responsive design verified
- [ ] Sentry or error tracking configured
- [ ] Vercel Analytics enabled
- [ ] README updated with production URL
- [ ] Deployment verification report created

---

**Last Updated:** October 24, 2025  
**Version:** 1.0.0-final  
**Status:** Ready for production deployment

