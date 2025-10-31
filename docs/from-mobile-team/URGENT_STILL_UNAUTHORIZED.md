# 🚨 URGENT: Still Getting "Unauthorized" After Secret Update

**To:** Project Manager & Webapp Team  
**From:** Mobile App Team  
**Date:** October 30, 2025 - 10:05 PM  
**Subject:** Endpoints Still Failing - Need Immediate Debugging

---

## ❌ **Test Results: Still Failing**

PM confirmed the secret has been updated, but all endpoints are still returning "Unauthorized" errors.

### **Test Results (After Secret Update):**

| Endpoint | HTTP Status | Response | Result |
|----------|-------------|----------|--------|
| `GET /api/inbox` | 500 | `{"ok":false,"error":"Unauthorized"}` | ❌ FAILED |
| `GET /api/pnl` | 500 | `{"ok":false,"error":"Unauthorized"}` | ❌ FAILED |
| `GET /api/balance/get` | 500 | `{"error":"Unauthorized"}` | ❌ FAILED |
| `POST /api/balance/save` | 500 | `{"error":"Unauthorized"}` | ❌ FAILED |
| `POST /api/sheets` | 400 | `{"success":false,"error":"Invalid operation type..."}` | ⚠️ DIFFERENT ERROR |

---

## 🔍 **Important Discovery**

### **POST /api/sheets Returned a DIFFERENT Error:**

```json
{
  "success": false,
  "error": "Invalid operation type \"EXP - Groceries & Food\". Please select a valid category from the dropdown."
}
```

**HTTP Status:** 400 (not 500)  
**Response Time:** 0.41 seconds (much faster!)

**This is GOOD NEWS!** It means:
- ✅ This endpoint is NOT getting "Unauthorized"
- ✅ It's reaching the validation logic
- ✅ The secret is working for this endpoint
- ⚠️ But the other endpoints are still failing

---

## 🤔 **Possible Explanations**

### **Theory 1: Different Webhook URLs**

The endpoints might be using different webhook URLs:

- `POST /api/sheets` → Uses `SHEETS_WEBHOOK_URL` (working!)
- `GET /api/pnl` → Uses `SHEETS_PNL_URL` (failing!)
- `GET /api/balance/get` → Uses `SHEETS_BALANCES_GET_URL` (failing!)
- `POST /api/balance/save` → Uses `SHEETS_BALANCES_APPEND_URL` (failing!)
- `GET /api/inbox` → Uses `SHEETS_WEBHOOK_URL` (failing!)

**Question for Webapp Team:**
- Do these URLs point to different Apps Script deployments?
- Did you update the secret in ALL deployments?

---

### **Theory 2: Vercel Caching**

Vercel might be caching the old responses for GET requests but not POST requests.

**Evidence:**
- `POST /api/sheets` works (returns validation error, not "Unauthorized")
- All `GET` requests fail (still return "Unauthorized")

**Solution:**
- Trigger a new Vercel deployment
- OR wait for cache to expire (could take minutes)

---

### **Theory 3: Multiple Apps Script Deployments**

You might have multiple Apps Script deployments with different secrets:

- Deployment 1: Has the updated secret (used by `/api/sheets`)
- Deployment 2: Has the old secret (used by `/api/pnl`, `/api/balance/*`, `/api/inbox`)

**Solution:**
- Check if you have multiple Apps Script deployments
- Update the secret in ALL deployments
- OR use the same deployment URL for all endpoints

---

## 🔧 **Immediate Actions Needed**

### **For PM:**

**Action 1: Verify Apps Script Deployment**

1. Open Google Apps Script
2. Click **Deploy** → **Manage deployments**
3. How many deployments do you see?
   - If 1: Good, but verify the URL
   - If multiple: You need to update secret in ALL of them

**Action 2: Get ALL Deployment URLs**

1. Copy all deployment URLs
2. Share them with webapp team
3. Webapp team will verify which URLs are in Vercel

**Action 3: Test Each Deployment Directly**

Test the main deployment:
```bash
curl -X POST "YOUR_DEPLOYMENT_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"getPnL","secret":"VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8="}'
```

If you get data → That deployment is working  
If you get "Unauthorized" → That deployment still has old secret

---

### **For Webapp Team:**

**Action 1: Check ALL Environment Variables**

Go to Vercel and verify these URLs:

```
SHEETS_WEBHOOK_URL = ?
SHEETS_PNL_URL = ?
SHEETS_BALANCES_GET_URL = ?
SHEETS_BALANCES_APPEND_URL = ?
```

**Do they all point to the SAME Apps Script deployment?**
- If YES: The issue is caching or deployment
- If NO: PM needs to update secret in ALL deployments

**Action 2: Trigger New Vercel Deployment**

```bash
# Make a small change
echo "// Cache bust" >> app/api/pnl/route.ts
git add .
git commit -m "chore: trigger redeploy to clear cache"
git push origin main
```

Wait 2-3 minutes for deployment to complete, then test again.

**Action 3: Check Vercel Function Logs**

1. Go to Vercel dashboard
2. Go to Deployments → Latest deployment
3. Click on Functions
4. Click on `/api/pnl`
5. Check the logs - what error is being logged?

---

## 📊 **Diagnostic Information**

### **What's Working:**

✅ `POST /api/sheets` - Returns validation error (not "Unauthorized")  
✅ Response time is fast (0.41s)  
✅ HTTP status is 400 (not 500)  

**This proves:**
- The Next.js API is working
- The secret is working for at least one endpoint
- The Apps Script is reachable

### **What's NOT Working:**

❌ `GET /api/pnl` - Returns "Unauthorized"  
❌ `GET /api/inbox` - Returns "Unauthorized"  
❌ `GET /api/balance/get` - Returns "Unauthorized"  
❌ `POST /api/balance/save` - Returns "Unauthorized"  

**This suggests:**
- These endpoints use different webhook URLs
- OR these endpoints are cached
- OR these endpoints use a different Apps Script deployment

---

## 🎯 **Next Steps**

### **Step 1: Verify Webhook URLs (Webapp Team)**

Check if all endpoints use the same webhook URL:

```typescript
// app/api/pnl/route.ts
const pnlUrl = process.env.SHEETS_PNL_URL;  // What is this?

// app/api/sheets/route.ts
const webhookUrl = process.env.SHEETS_WEBHOOK_URL;  // What is this?

// Are they the same?
```

### **Step 2: Update Secret in ALL Deployments (PM)**

If there are multiple Apps Script deployments:
1. Update secret in ALL of them
2. Test each one directly with cURL
3. Verify all return data (not "Unauthorized")

### **Step 3: Trigger New Vercel Deployment (Webapp Team)**

1. Make a small change to force redeploy
2. Wait for deployment to complete
3. Test all endpoints again

### **Step 4: Re-test (Mobile Team)**

After steps 1-3 are complete:
1. Wait 5 minutes for cache to clear
2. Test all 8 endpoints
3. Report results

---

## 📞 **Urgent Communication Needed**

### **We Need to Know:**

**From PM:**
1. How many Apps Script deployments do you have?
2. What are the deployment URLs?
3. Did you update the secret in ALL deployments?
4. Can you test each deployment directly with cURL?

**From Webapp Team:**
1. Do all endpoints use the same webhook URL?
2. Or do they use different URLs (SHEETS_PNL_URL, SHEETS_BALANCES_GET_URL, etc.)?
3. Can you trigger a new Vercel deployment?
4. Can you check the Vercel function logs?

---

## 💡 **Why POST /api/sheets Works But Others Don't**

### **Hypothesis:**

`POST /api/sheets` uses `SHEETS_WEBHOOK_URL` which points to the Apps Script deployment with the updated secret.

The other endpoints use different environment variables:
- `SHEETS_PNL_URL`
- `SHEETS_BALANCES_GET_URL`
- `SHEETS_BALANCES_APPEND_URL`

**These might point to:**
- A different Apps Script deployment (with old secret)
- OR the same deployment but Vercel is caching the responses
- OR the environment variables are not set correctly

---

## 🚨 **Recommendation**

### **Quick Fix Option:**

**Use the SAME webhook URL for ALL endpoints!**

Instead of having separate URLs:
- `SHEETS_WEBHOOK_URL`
- `SHEETS_PNL_URL`
- `SHEETS_BALANCES_GET_URL`
- `SHEETS_BALANCES_APPEND_URL`

**Just use ONE URL for everything:**
- All endpoints → `SHEETS_WEBHOOK_URL`
- Different actions specified in the request body

**This would:**
- ✅ Simplify configuration
- ✅ Ensure all endpoints use the same secret
- ✅ Reduce chance of mismatched secrets
- ✅ Make debugging easier

---

## ⏱️ **Timeline**

**10:05 PM** - Mobile team tested after PM said secret was updated  
**Result:** Still getting "Unauthorized" (except POST /api/sheets)  
**Discovery:** POST /api/sheets works, others don't  
**Hypothesis:** Different webhook URLs or caching issue  
**Action Required:** PM and webapp team need to debug urgently  

---

## 📋 **Debugging Checklist**

### **For PM:**

- [ ] Open Google Apps Script
- [ ] Check how many deployments exist
- [ ] Get ALL deployment URLs
- [ ] Verify secret is updated in ALL deployments
- [ ] Test each deployment with cURL
- [ ] Share results with webapp team

### **For Webapp Team:**

- [ ] Check all environment variables in Vercel
- [ ] Verify which URLs are used by which endpoints
- [ ] Check if all URLs point to same deployment
- [ ] Trigger new Vercel deployment
- [ ] Check Vercel function logs
- [ ] Share findings with mobile team

### **For Mobile Team:**

- [ ] Wait for PM and webapp team to debug
- [ ] Re-test after they confirm fix
- [ ] Document results
- [ ] Continue with Phase 2 if tests pass

---

## ✅ **Summary**

**Status:** ❌ Still failing (except POST /api/sheets)  
**Discovery:** POST /api/sheets works, returns validation error  
**Hypothesis:** Different webhook URLs or caching  
**Action Required:** PM and webapp team need to debug  
**Blocker:** Cannot proceed with testing until fixed  

---

**Mobile App Team**  
**Status:** ⏳ Waiting for urgent debugging from PM and webapp team  
**Discovery:** POST /api/sheets works, others don't  
**Next Action:** Re-test after PM and webapp team fix the issue  
**Last Updated:** October 30, 2025 - 10:05 PM

