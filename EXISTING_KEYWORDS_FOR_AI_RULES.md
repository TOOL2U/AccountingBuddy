# Existing Keywords - Ready for AI_KeywordRules

## ✅ YES! You Already Have Extensive Keyword Mappings!

Your app already has **comprehensive keyword-to-category mappings** in `config/options.json`. These are currently used by the manual entry parser and AI extraction system.

---

## 📊 Current Keyword System

**Location:** `config/options.json`

**Structure:**
```json
{
  "keywords": {
    "typeOfOperation": {
      "EXP - Construction - Wall": ["wall", "walls", "brick", "cement", ...],
      "EXP - HR - Employees Salaries": ["salary", "salaries", "wage", ...],
      ...
    }
  }
}
```

**Total Keywords:** ~200+ keyword mappings across all categories

---

## 🔄 Converting to AI_KeywordRules Format

Here are your existing keywords converted to the Google Sheets table format:

### **Copy-Paste Ready for Google Sheets**

| keyword | category | priority |
|---------|----------|----------|
| wall | EXP - Construction - Wall | 100 |
| walls | EXP - Construction - Wall | 100 |
| brick | EXP - Construction - Wall | 95 |
| cement | EXP - Construction - Wall | 95 |
| mortar | EXP - Construction - Wall | 90 |
| plaster | EXP - Construction - Wall | 90 |
| salary | EXP - HR - Employees Salaries | 100 |
| salaries | EXP - HR - Employees Salaries | 100 |
| wage | EXP - HR - Employees Salaries | 95 |
| wages | EXP - HR - Employees Salaries | 95 |
| staff | EXP - HR - Employees Salaries | 90 |
| employee | EXP - HR - Employees Salaries | 90 |
| payroll | EXP - HR - Employees Salaries | 85 |
| aircon | EXP - Appliances & Electronics | 100 |
| air conditioner | EXP - Appliances & Electronics | 100 |
| appliance | EXP - Appliances & Electronics | 95 |
| electronics | EXP - Appliances & Electronics | 95 |
| refrigerator | EXP - Appliances & Electronics | 90 |
| washing machine | EXP - Appliances & Electronics | 90 |
| painting | EXP - Repairs & Maintenance - Painting & Decoration | 100 |
| paint | EXP - Repairs & Maintenance - Painting & Decoration | 100 |
| painter | EXP - Repairs & Maintenance - Painting & Decoration | 95 |
| brush | EXP - Repairs & Maintenance - Painting & Decoration | 85 |
| roller | EXP - Repairs & Maintenance - Painting & Decoration | 85 |
| electric | EXP - Utilities  - Electricity | 100 |
| electricity | EXP - Utilities  - Electricity | 100 |
| power | EXP - Utilities  - Electricity | 95 |
| electric bill | EXP - Utilities  - Electricity | 100 |
| water | EXP - Utilities - Water | 100 |
| water bill | EXP - Utilities - Water | 100 |
| tap water | EXP - Utilities - Water | 90 |
| gas | EXP - Utilities - Gas | 100 |
| lpg | EXP - Utilities - Gas | 95 |
| cooking gas | EXP - Utilities - Gas | 95 |
| door | EXP - Windows, Doors, Locks & Hardware | 100 |
| doors | EXP - Windows, Doors, Locks & Hardware | 100 |
| window | EXP - Windows, Doors, Locks & Hardware | 100 |
| windows | EXP - Windows, Doors, Locks & Hardware | 100 |
| lock | EXP - Windows, Doors, Locks & Hardware | 100 |
| locks | EXP - Windows, Doors, Locks & Hardware | 100 |
| hardware | EXP - Windows, Doors, Locks & Hardware | 95 |
| furniture | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 100 |
| decor | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 100 |
| decoration | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 100 |
| pillow | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 90 |
| curtain | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 90 |
| sofa | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 95 |
| chair | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 95 |
| table | EXP - Repairs & Maintenance  - Furniture & Decorative Items | 95 |
| tools | EXP - Repairs & Maintenance - Tools & Equipment | 100 |
| tool | EXP - Repairs & Maintenance - Tools & Equipment | 100 |
| equipment | EXP - Repairs & Maintenance - Tools & Equipment | 100 |
| hammer | EXP - Repairs & Maintenance - Tools & Equipment | 90 |
| drill | EXP - Repairs & Maintenance - Tools & Equipment | 90 |
| landscape | EXP - Repairs & Maintenance - Landscaping | 100 |
| landscaping | EXP - Repairs & Maintenance - Landscaping | 100 |
| garden | EXP - Repairs & Maintenance - Landscaping | 100 |
| gardening | EXP - Repairs & Maintenance - Landscaping | 100 |
| grass | EXP - Repairs & Maintenance - Landscaping | 90 |
| tree | EXP - Repairs & Maintenance - Landscaping | 90 |
| plant | EXP - Repairs & Maintenance - Landscaping | 90 |
| waste | EXP - Repairs & Maintenance  - Waste removal | 100 |
| garbage | EXP - Repairs & Maintenance  - Waste removal | 100 |
| trash | EXP - Repairs & Maintenance  - Waste removal | 100 |
| rubbish | EXP - Repairs & Maintenance  - Waste removal | 95 |
| disposal | EXP - Repairs & Maintenance  - Waste removal | 95 |
| repair | EXP - Repairs & Maintenance - Electrical & Mechanical | 100 |
| maintenance | EXP - Repairs & Maintenance - Electrical & Mechanical | 100 |
| fix | EXP - Repairs & Maintenance - Electrical & Mechanical | 95 |
| broken | EXP - Repairs & Maintenance - Electrical & Mechanical | 90 |
| technician | EXP - Repairs & Maintenance - Electrical & Mechanical | 90 |
| electrician | EXP - Repairs & Maintenance - Electrical & Mechanical | 95 |
| structure | EXP - Construction - Structure | 100 |
| structural | EXP - Construction - Structure | 100 |
| foundation | EXP - Construction - Structure | 100 |
| concrete | EXP - Construction - Structure | 95 |
| steel | EXP - Construction - Structure | 95 |
| beam | EXP - Construction - Structure | 90 |
| column | EXP - Construction - Structure | 90 |
| wire | EXP - Construction - Electric Supplies | 100 |
| cable | EXP - Construction - Electric Supplies | 100 |
| switch | EXP - Construction - Electric Supplies | 95 |
| outlet | EXP - Construction - Electric Supplies | 95 |
| breaker | EXP - Construction - Electric Supplies | 90 |
| conduit | EXP - Construction - Electric Supplies | 90 |
| termite | EXP - Construction - Overheads/General/Unclassified | 100 |
| pest control | EXP - Construction - Overheads/General/Unclassified | 100 |
| office | EXP - Administration & General - Office supplies | 100 |
| supplies | EXP - Administration & General - Office supplies | 100 |
| stationery | EXP - Administration & General - Office supplies | 95 |
| paper | EXP - Administration & General - Office supplies | 90 |
| pen | EXP - Administration & General - Office supplies | 90 |
| printer | EXP - Administration & General - Office supplies | 90 |
| ink | EXP - Administration & General - Office supplies | 85 |
| subscription | EXP - Administration & General  - Subscription, Software & Membership | 100 |
| software | EXP - Administration & General  - Subscription, Software & Membership | 100 |
| membership | EXP - Administration & General  - Subscription, Software & Membership | 100 |
| app | EXP - Administration & General  - Subscription, Software & Membership | 95 |
| saas | EXP - Administration & General  - Subscription, Software & Membership | 95 |
| license | EXP - Administration & General - License & Certificates | 100 |
| licence | EXP - Administration & General - License & Certificates | 100 |
| certificate | EXP - Administration & General - License & Certificates | 100 |
| permit | EXP - Administration & General - License & Certificates | 95 |
| registration | EXP - Administration & General - License & Certificates | 95 |
| legal | EXP - Administration & General - Legal | 100 |
| lawyer | EXP - Administration & General - Legal | 100 |
| attorney | EXP - Administration & General - Legal | 95 |
| law | EXP - Administration & General - Legal | 95 |
| professional | EXP - Administration & General - Professional fees | 100 |
| consultant | EXP - Administration & General - Professional fees | 100 |
| accountant | EXP - Administration & General - Professional fees | 100 |
| accounting | EXP - Administration & General - Professional fees | 100 |
| audit | EXP - Administration & General - Professional fees | 95 |
| marketing | EXP - Sales & Marketing -  Professional Marketing Services | 100 |
| advertising | EXP - Sales & Marketing -  Professional Marketing Services | 100 |
| promotion | EXP - Sales & Marketing -  Professional Marketing Services | 95 |
| social media | EXP - Sales & Marketing -  Professional Marketing Services | 95 |
| seo | EXP - Sales & Marketing -  Professional Marketing Services | 90 |
| branding | EXP - Sales & Marketing -  Professional Marketing Services | 90 |
| commission | Revenue - Commision | 100 |
| commision | Revenue - Commision | 100 |
| referral | Revenue - Commision | 95 |
| fee | Revenue - Commision | 90 |
| broker | Revenue - Commision | 90 |
| sales | Revenue - Sales | 100 |
| sale | Revenue - Sales | 100 |
| selling | Revenue - Sales | 95 |
| sold | Revenue - Sales | 95 |
| service | Revenue - Services | 100 |
| services | Revenue - Services | 100 |
| consulting | Revenue - Services | 95 |
| work | Revenue - Services | 90 |

---

## 💡 Recommendation

### **Option 1: Start with Top 30 Keywords (Recommended)**

Use the most common keywords from your receipts:

1. wall
2. salary
3. paint
4. aircon
5. electric
6. water
7. gas
8. door
9. window
10. furniture
11. tools
12. garden
13. waste
14. repair
15. cement
16. labour
17. appliance
18. decor
19. office
20. subscription
21. license
22. legal
23. marketing
24. commission
25. sales
26. termite
27. concrete
28. wire
29. maintenance
30. fix

### **Option 2: Import All 130+ Keywords**

Copy the entire table above into Google Sheets for maximum AI accuracy.

---

## 🎯 How to Use This

### **Method 1: Manual Entry (Quick)**

1. Open Google Sheets
2. Go to your "Config" sheet
3. In cell `C1`, type: `keyword`
4. In cell `D1`, type: `category`
5. In cell `E1`, type: `priority`
6. Copy rows from the table above and paste starting at `C2`
7. Select range `C1:E[last row]`
8. Create named range: `AI_KeywordRules`

### **Method 2: Generate from Code (Advanced)**

I can create a script that automatically generates a CSV file from your `options.json` that you can import into Google Sheets.

---

## 🔍 Current vs. New System

### **Current System (options.json)**
- ✅ Used by manual entry parser
- ✅ Used by AI extraction (in prompt)
- ✅ Hardcoded in the app
- ❌ Requires code deployment to update

### **New System (AI_KeywordRules in Google Sheets)**
- ✅ Used by AI extraction (dynamic)
- ✅ Editable from web app UI
- ✅ No code deployment needed
- ✅ Real-time updates
- ✅ Can be managed by non-developers

---

## 🚀 Next Steps

1. **Decide:** Start with top 30 keywords or import all 130+?
2. **Create:** Copy keywords into Google Sheets `AI_KeywordRules` table
3. **Test:** Use the Test Console to see how AI uses the rules
4. **Refine:** Add/edit/delete rules based on your actual receipts

---

**You already have a great keyword system! Now you can make it dynamic and editable through the UI! 🎉**

