# Testing Guide - Accounting Buddy

## Overview

This project includes a comprehensive test suite (`test-all.js`) that validates all aspects of the webapp in a single command for maximum efficiency.

---

## Quick Start

### Run All Tests (Quick Mode - Skip Build)
```bash
npm run test:quick
```

### Run All Tests (Full Mode - Including Build)
```bash
npm test
```

### Run All Tests (Verbose Mode)
```bash
npm run test:verbose
```

---

## Test Suites

The comprehensive test suite includes **9 test categories** with **54+ individual tests**:

### 1. Environment Variables (6 tests)
Validates that all required environment variables are set:
- ✅ `GOOGLE_APPLICATION_CREDENTIALS`
- ✅ `GOOGLE_SHEET_ID`
- ✅ `OPENAI_API_KEY`
- ✅ `SHEETS_WEBHOOK_URL`
- ✅ `SHEETS_WEBHOOK_SECRET`
- ✅ `GOOGLE_VISION_KEY`

### 2. Configuration Files (4 tests)
Validates that all configuration files exist and are valid:
- ✅ `config/options.json` (valid JSON)
- ✅ `config/live-dropdowns.json` (valid JSON)
- ✅ `config/enhanced-keywords.json` (valid JSON)
- ✅ `COMPLETE_APPS_SCRIPT_V7_WITH_BALANCE.js` (exists)

### 3. Configuration Validation (5 tests)
Validates the structure and content of configuration files:
- ✅ Type of Operation items count
- ✅ Properties count
- ✅ Type of Payment items count
- ✅ Enhanced keywords structure
- ✅ Live dropdowns metadata

### 4. Apps Script Validation (3 tests)
Validates the Apps Script configuration:
- ✅ Version number
- ✅ Property/Person range (A14:A20)
- ✅ Overhead expenses range (rows 31-58)

### 5. File Structure Validation (23 tests)
Validates that all required files exist:
- ✅ Core config files (package.json, tsconfig.json, etc.)
- ✅ All page files (upload, review, inbox, pnl, balance, admin)
- ✅ All API routes (ocr, extract, sheets, inbox, pnl, balance/*)
- ✅ Components (Navigation.tsx)

### 6. Dependencies Check (9 tests)
Validates that all required dependencies are installed:
- ✅ next, react, react-dom
- ✅ tailwindcss
- ✅ googleapis
- ✅ framer-motion, lucide-react
- ✅ uuid
- ✅ node_modules directory exists

### 7. Google Sheets Sync Validation (1 test)
Validates the sync script works correctly:
- ✅ Runs `sync-sheets.js` in dry-run mode

### 8. TypeScript and Linting (2 tests)
Validates code quality:
- ✅ TypeScript type check (`tsc --noEmit`)
- ✅ ESLint validation

### 9. Next.js Build (1 test)
Validates the production build:
- ✅ Next.js build succeeds (skipped in quick mode)

---

## Command Options

### Available Scripts

| Command | Description | Duration |
|---------|-------------|----------|
| `npm test` | Run all tests including build | ~2-3 min |
| `npm run test:quick` | Run all tests, skip build | ~8 sec |
| `npm run test:verbose` | Run all tests with verbose output | ~2-3 min |

### Command Line Flags

You can also run the test script directly with flags:

```bash
node test-all.js [--skip-build] [--verbose]
```

**Flags:**
- `--skip-build` - Skip the Next.js build test (faster)
- `--verbose` - Show detailed output from all commands

---

## Test Results

### Success Output
```
======================================================================
  📊 TEST SUMMARY
======================================================================

Total Tests: 54
✅ Passed: 53
❌ Failed: 0
⏭️  Skipped: 1
⏱️  Duration: 7.57s

✅ ALL TESTS PASSED!
```

### Failure Output
```
======================================================================
  📊 TEST SUMMARY
======================================================================

Total Tests: 54
✅ Passed: 51
❌ Failed: 2
⏭️  Skipped: 1
⏱️  Duration: 8.12s

❌ SOME TESTS FAILED

Failed tests:
  - CONFIG: Live dropdowns metadata
  - FILE: app/api/balance/route.ts
```

---

## Continuous Integration

### Pre-Deployment Checklist

Before deploying to production, run:

```bash
# 1. Run full test suite
npm test

# 2. Run sync script to ensure config is up-to-date
npm run sync

# 3. Check for any uncommitted changes
git status
```

### Recommended Workflow

1. **Before committing code:**
   ```bash
   npm run test:quick
   ```

2. **Before creating a PR:**
   ```bash
   npm test
   ```

3. **Before deploying to production:**
   ```bash
   npm test && npm run sync
   ```

---

## Troubleshooting

### Common Issues

#### 1. Environment Variables Missing
**Error:** `❌ GOOGLE_SHEET_ID is missing`

**Solution:** Create or update `.env.local` file with required variables:
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

#### 2. TypeScript Errors
**Error:** `❌ TypeScript type check failed`

**Solution:** Fix TypeScript errors in your code:
```bash
npx tsc --noEmit
```

#### 3. ESLint Errors
**Error:** `❌ ESLint failed`

**Solution:** Fix linting errors:
```bash
npm run lint
```

#### 4. Build Errors
**Error:** `❌ Next.js build failed`

**Solution:** Check build output for specific errors:
```bash
npm run build
```

#### 5. Sync Script Errors
**Error:** `❌ Google Sheets sync validation failed`

**Solution:** Run sync script manually to see detailed errors:
```bash
npm run sync
```

---

## Adding New Tests

To add new tests to the suite, edit `test-all.js`:

```javascript
// ============================================================================
// Test 10: Your New Test Suite
// ============================================================================

function testYourNewFeature() {
  section('TEST 10: Your New Feature');
  
  try {
    // Your test logic here
    if (/* condition */) {
      success('Your test passed');
      results.tests.push({ name: 'YOUR_TEST: Description', status: 'PASS' });
    } else {
      fail('Your test failed');
      results.tests.push({ name: 'YOUR_TEST: Description', status: 'FAIL' });
    }
  } catch (error) {
    fail('Your test failed', error.message);
    results.tests.push({ name: 'YOUR_TEST: Description', status: 'FAIL' });
  }
}

// Add to runAllTests() function:
async function runAllTests() {
  // ... existing tests ...
  testYourNewFeature();
  // ... rest of tests ...
}
```

---

## Test Coverage

### Current Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| Environment | 6 | 100% |
| Configuration | 9 | 100% |
| Apps Script | 3 | 100% |
| File Structure | 23 | 100% |
| Dependencies | 9 | 100% |
| Sync Script | 1 | 100% |
| Code Quality | 2 | 100% |
| Build | 1 | 100% |
| **Total** | **54** | **100%** |

---

## Related Documentation

- [SYNC-QUICK-REFERENCE.md](SYNC-QUICK-REFERENCE.md) - Google Sheets sync guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [README.md](README.md) - Project overview

---

## Support

If you encounter any issues with the test suite, please:

1. Run tests in verbose mode: `npm run test:verbose`
2. Check the error messages in the output
3. Refer to the troubleshooting section above
4. Check related documentation

---

**Last Updated:** 2025-10-30  
**Test Suite Version:** 1.0.0

