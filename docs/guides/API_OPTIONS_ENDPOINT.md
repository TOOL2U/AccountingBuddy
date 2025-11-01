# 📡 /api/options Endpoint Documentation

## Overview

The `/api/options` endpoint provides real-time access to all dropdown options (categories) used in the Accounting Buddy system. This endpoint is designed for the mobile app to fetch live dropdown values that are synced from Google Sheets.

---

## Endpoint Details

**URL:** `https://accounting.siamoon.com/api/options`

**Method:** `GET`

**Authentication:** None (public endpoint)

**Content-Type:** `application/json`

---

## Response Format

### Success Response (200 OK)

```json
{
  "ok": true,
  "data": {
    "properties": [
      "Sia Moon - Land - General",
      "Alesia House",
      "Lanna House",
      "Parents House",
      "Shaun Ducker - Personal",
      "Maria Ren - Personal",
      "Family"
    ],
    "typeOfOperations": [
      "Revenue - Commision",
      "Revenue - Sales",
      "Revenue - Services",
      "Revenue - Rental Income",
      "EXP - Utilities - Gas",
      "EXP - Utilities - Water",
      "EXP - Utilities  - Electricity",
      "OVERHEAD EXPENSES",
      "EXP - Administration & General - License & Certificates",
      "EXP - Construction - Structure",
      "EXP - Construction - Overheads/General/Unclassified",
      "EXP - HR - Employees Salaries",
      "EXP - Administration & General - Legal",
      "EXP - Administration & General - Professional fees",
      "EXP - Administration & General - Office supplies",
      "EXP - Administration & General  - Subscription, Software & Membership",
      "EXP - Construction - Electric Supplies",
      "EXP - Appliances & Electronics",
      "EXP - Windows, Doors, Locks & Hardware",
      "EXP - Repairs & Maintenance  - Furniture & Decorative Items",
      "EXP - Repairs & Maintenance  - Waste removal",
      "EXP - Repairs & Maintenance - Tools & Equipment",
      "EXP - Repairs & Maintenance - Painting & Decoration",
      "EXP - Repairs & Maintenance - Electrical & Mechanical",
      "EXP - Repairs & Maintenance - Landscaping",
      "EXP - Sales & Marketing -  Professional Marketing Services",
      "EXP - Construction - Wall",
      "EXP - Other Expenses",
      "EXP - Personal - Massage",
      "EXP - Household - Alcohol",
      "EXP - Household - Groceries",
      "EXP - Household - Nappies",
      "EXP - Household - Toiletries"
    ],
    "typeOfPayments": [
      "Bank Transfer - Bangkok Bank - Shaun Ducker",
      "Bank Transfer - Bangkok Bank - Maria Ren",
      "Bank transfer - Krung Thai Bank - Family Account",
      "Cash"
    ]
  },
  "updatedAt": "2025-10-30T09:38:11.978Z",
  "cached": true,
  "source": "google_sheets_api",
  "metadata": {
    "totalProperties": 7,
    "totalOperations": 33,
    "totalPayments": 4
  }
}
```

### Error Response (500 Internal Server Error)

```json
{
  "ok": false,
  "error": "Dropdown options not available. Please run sync script first.",
  "data": null
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Indicates if the request was successful |
| `data` | object | Contains all dropdown options |
| `data.properties` | string[] | List of all property names (7 items) |
| `data.typeOfOperations` | string[] | List of all operation types (33 items) |
| `data.typeOfPayments` | string[] | List of all payment methods (4 items) |
| `updatedAt` | string | ISO 8601 timestamp of last sync from Google Sheets |
| `cached` | boolean | Always `true` - data is read from cached config file |
| `source` | string | Source of the data (e.g., "google_sheets_api") |
| `metadata` | object | Additional metadata about the options |
| `metadata.totalProperties` | number | Count of properties |
| `metadata.totalOperations` | number | Count of operations |
| `metadata.totalPayments` | number | Count of payment methods |

---

## Usage Examples

### JavaScript/TypeScript (Fetch API)

```typescript
async function fetchDropdownOptions() {
  try {
    const response = await fetch('https://accounting.siamoon.com/api/options');
    const result = await response.json();
    
    if (result.ok) {
      const { properties, typeOfOperations, typeOfPayments } = result.data;
      console.log('Properties:', properties);
      console.log('Operations:', typeOfOperations);
      console.log('Payments:', typeOfPayments);
      console.log('Last updated:', result.updatedAt);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to fetch options:', error);
  }
}
```

### React Native (Mobile App)

```typescript
import { useState, useEffect } from 'react';

interface DropdownOptions {
  properties: string[];
  typeOfOperations: string[];
  typeOfPayments: string[];
}

export function useDropdownOptions() {
  const [options, setOptions] = useState<DropdownOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch('https://accounting.siamoon.com/api/options');
        const result = await response.json();
        
        if (result.ok) {
          setOptions(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load options');
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  return { options, loading, error };
}
```

### cURL (Testing)

```bash
# Fetch all options
curl https://accounting.siamoon.com/api/options

# Pretty print with jq
curl -s https://accounting.siamoon.com/api/options | jq '.'

# Get only properties
curl -s https://accounting.siamoon.com/api/options | jq '.data.properties'

# Get count of operations
curl -s https://accounting.siamoon.com/api/options | jq '.metadata.totalOperations'
```

---

## Data Sync Workflow

```
Google Sheets (Data tab)
        ↓
   npm run sync
        ↓
config/live-dropdowns.json
        ↓
   /api/options endpoint
        ↓
   Mobile App / External Consumers
```

### How to Update Dropdown Options

1. **Edit Google Sheets:** Add/remove/edit categories in the "Data" tab
2. **Run sync script:** `npm run sync` (on webapp server)
3. **Options auto-update:** The endpoint immediately reflects changes (no rebuild needed)
4. **Mobile app fetches:** Next API call gets the updated options

---

## Caching Strategy

- **Server-side:** Data is read from `config/live-dropdowns.json` (file system cache)
- **No database queries:** Fast response time (~50-100ms)
- **No external API calls:** No dependency on Google Sheets API at runtime
- **Client-side caching recommended:** Mobile app should cache options locally and refresh periodically

### Recommended Mobile App Caching

```typescript
// Cache options for 1 hour
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

async function getCachedOptions() {
  const cached = await AsyncStorage.getItem('dropdown_options');
  const cacheTime = await AsyncStorage.getItem('dropdown_options_time');
  
  if (cached && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    if (age < CACHE_DURATION) {
      return JSON.parse(cached);
    }
  }
  
  // Fetch fresh data
  const response = await fetch('https://accounting.siamoon.com/api/options');
  const result = await response.json();
  
  if (result.ok) {
    await AsyncStorage.setItem('dropdown_options', JSON.stringify(result.data));
    await AsyncStorage.setItem('dropdown_options_time', Date.now().toString());
    return result.data;
  }
  
  return null;
}
```

---

## Validation

Before submitting transactions, validate that user-selected values match the available options:

```typescript
function validateTransaction(transaction: Transaction, options: DropdownOptions): boolean {
  const validProperty = options.properties.includes(transaction.property);
  const validOperation = options.typeOfOperations.includes(transaction.typeOfOperation);
  const validPayment = options.typeOfPayments.includes(transaction.typeOfPayment);
  
  return validProperty && validOperation && validPayment;
}
```

---

## Performance

- **Response time:** ~50-100ms (local file read)
- **Response size:** ~2-3 KB (gzipped)
- **Rate limiting:** None (public endpoint)
- **Availability:** 99.9% (Vercel hosting)

---

## Troubleshooting

### Issue: Endpoint returns 500 error

**Cause:** Config file not found or corrupted

**Solution:**
1. SSH into server
2. Run `npm run sync` to regenerate config files
3. Verify `config/live-dropdowns.json` exists

### Issue: Options are outdated

**Cause:** Sync script hasn't been run after Google Sheets changes

**Solution:**
1. Run `npm run sync` on the server
2. Verify `updatedAt` timestamp in response

### Issue: Mobile app shows old options

**Cause:** Client-side cache not refreshed

**Solution:**
1. Clear app cache
2. Force refresh from API
3. Check `updatedAt` timestamp to verify freshness

---

## Related Documentation

- [Sync Sheets Guide](./SYNC_SHEETS_GUIDE.md) - How to sync from Google Sheets
- [Mobile API Integration Guide](./MOBILE_API_INTEGRATION_GUIDE.md) - Complete mobile integration docs
- [Keyword Recognition Guide](../KEYWORD_RECOGNITION_GUIDE.md) - AI keyword matching

---

## Support

For issues or questions:
- **Project Manager:** Shaun Ducker (shaunducker1@gmail.com)
- **Repository:** https://github.com/TOOL2U/AccountingBuddy
- **Production URL:** https://accounting.siamoon.com

---

**Last Updated:** 2025-11-01  
**Version:** 1.0  
**Status:** ✅ Production Ready

