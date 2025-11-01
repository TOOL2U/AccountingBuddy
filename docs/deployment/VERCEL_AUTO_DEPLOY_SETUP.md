# Vercel Auto-Deploy Setup Guide

## Overview
This guide helps you configure Vercel to automatically build and deploy when you commit to GitHub.

## Prerequisites
✅ Vercel project already created: `accounting-buddy`
✅ GitHub repository connected: `TOOL2U/AccountingBuddy`
✅ Branch: `feat/upload-manual-entry-and-styling`

## Setup Steps

### 1. Connect GitHub Repository (If Not Already Connected)

If your GitHub repository is not yet connected:

```bash
# Link the Vercel project to GitHub
vercel git connect
```

### 2. Configure Auto-Deploy via Vercel Dashboard

1. **Open your project**: https://vercel.com/tool2us-projects/accounting-buddy/settings/git

2. **Git Settings**:
   - ✅ Ensure your GitHub repository is connected
   - ✅ Production Branch: Set to `main` or your primary branch
   - ✅ Enable "Automatically deploy all pushes"

3. **Branch Configuration**:
   - **Production**: Pushes to your main branch → Auto-deploy to production
   - **Preview**: Pushes to other branches → Auto-deploy to preview URL
   - **Pull Requests**: PRs → Auto-deploy preview for testing

### 3. Verify GitHub Integration

Make sure Vercel has permissions to access your repository:

1. Go to: https://github.com/settings/installations
2. Find "Vercel" in the list
3. Click "Configure"
4. Ensure `TOOL2U/AccountingBuddy` is selected

### 4. Test Auto-Deploy

After setup, test it:

```bash
# Make a small change
echo "# Test auto-deploy" >> README.md

# Commit and push
git add README.md
git commit -m "test: verify auto-deploy"
git push origin feat/upload-manual-entry-and-styling
```

You should see:
- ✅ Vercel bot comment on GitHub commit
- ✅ Automatic build starts on Vercel
- ✅ Deployment completes automatically
- ✅ You receive deployment notification

## Current Workflow

### Before Auto-Deploy (Manual):
```bash
npm run test:quick     # Run tests
git add -A             # Stage changes
git commit -m "..."    # Commit
git push               # Push to GitHub
vercel --prod          # Manual deploy ❌
```

### After Auto-Deploy (Automatic):
```bash
npm run test:quick     # Run tests
git add -A             # Stage changes
git commit -m "..."    # Commit
git push               # Push to GitHub
# ✅ Vercel automatically builds and deploys!
```

## Branch Strategy

### Recommended Setup:

**Production Branch** (`main`):
- Auto-deploys to: https://accounting-buddy-jdmdqybdt-tool2us-projects.vercel.app
- Only merge tested code here
- Every push = Production deployment

**Feature Branches** (like `feat/upload-manual-entry-and-styling`):
- Auto-deploys to: Preview URL (e.g., `feat-upload-manual-entry-*.vercel.app`)
- Safe testing environment
- Each push = New preview deployment

**Workflow**:
1. Develop on feature branch → Auto-preview deployments
2. Test preview deployment
3. Merge to `main` → Auto-production deployment

## Deployment Notifications

Enable notifications to get alerts when deployments complete:

1. Go to: https://vercel.com/tool2us-projects/accounting-buddy/settings/notifications
2. Enable:
   - ✅ Email notifications for production deployments
   - ✅ Email notifications for failed builds
   - ✅ GitHub commit status checks

## Environment Variables

Your environment variables are already set in Vercel:
- `OPENAI_API_KEY`
- `APPS_SCRIPT_URL`
- `NEXT_PUBLIC_GEMINI_KEY`
- etc.

These will be used in all automatic deployments.

## Build Settings

Your `vercel.json` is already configured:
- ✅ Framework: Next.js
- ✅ Build command: `npm run build`
- ✅ Install command: `npm install`
- ✅ Max duration: 30s for API routes
- ✅ Region: iad1 (Washington D.C.)

## Troubleshooting

### Auto-deploy not triggering?

1. **Check GitHub connection**:
   - Settings → Git → Verify repository is connected
   
2. **Check branch settings**:
   - Settings → Git → Ensure your branch is not ignored
   
3. **Check Vercel GitHub App permissions**:
   - https://github.com/settings/installations
   - Ensure Vercel has access to your repository

### Build failures?

1. **Check build logs**:
   - https://vercel.com/tool2us-projects/accounting-buddy
   - Click on failed deployment
   
2. **Run tests locally first**:
   ```bash
   npm run test:quick  # Always run before pushing
   ```

3. **Check environment variables**:
   - Settings → Environment Variables
   - Ensure all required variables are set

## Best Practices

1. **Always run tests before pushing**:
   ```bash
   npm run test:quick && git push
   ```

2. **Use meaningful commit messages**:
   ```bash
   git commit -m "feat: add new expense categories"
   git commit -m "fix: resolve mobile viewport issue"
   git commit -m "docs: update README"
   ```

3. **Review preview deployments before merging to main**:
   - Push to feature branch
   - Wait for preview deployment
   - Test preview URL
   - Merge to main only if preview works

4. **Monitor deployments**:
   - Watch Vercel dashboard
   - Check GitHub commit status
   - Review build logs if issues arise

## Quick Reference

| Action | Result |
|--------|--------|
| Push to `main` | Auto-deploy to production |
| Push to feature branch | Auto-deploy to preview URL |
| Open PR | Auto-deploy preview for PR |
| Manual deploy | Still available: `vercel --prod` |

## Next Steps

1. ✅ Enable auto-deploy in Vercel dashboard
2. ✅ Test with a small commit
3. ✅ Verify deployment notifications work
4. ✅ Update your workflow (no more manual `vercel --prod`)

## Support

- **Vercel Docs**: https://vercel.com/docs/deployments/git
- **GitHub Integration**: https://vercel.com/docs/deployments/git/vercel-for-github
- **Your Project**: https://vercel.com/tool2us-projects/accounting-buddy
Last updated: Thu Oct 30 17:19:50 +07 2025
