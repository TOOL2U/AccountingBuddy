/**
 * Enhanced AI Training Prompt for 100% Accuracy
 * Based on real P&L data analysis and Google Sheets live validation
 */

export const ENHANCED_EXTRACTION_PROMPT = (text: string, currentDate: Date, options: any, comment?: string) => {
  const contextText = comment
    ? `Receipt text: "${text}"\n\nUser comment (use this to guide categorization): "${comment}"`
    : `Receipt text: "${text}"`;

  const currentDay = currentDate.getDate().toString();
  const currentMonth = currentDate.toLocaleString('en', { month: 'short' });
  const currentYear = currentDate.getFullYear().toString();

  return `You are an expert accounting data extraction AI trained on real Thai business transaction data. Extract structured accounting data in JSON for this text:

${contextText}

CRITICAL: Use EXACT values from these live dropdown options:

Properties (choose one - these are the ONLY valid options):
${options.properties.map((p: string) => `- "${p}"`).join('\n')}

Type of Operation (choose one - match EXACTLY):
${options.typeOfOperation.map((op: string) => `- "${op}"`).join('\n')}

Type of Payment (choose one):
${options.typeOfPayment.map((tp: string) => `- "${tp}"`).join('\n')}

TRAINING DATA EXAMPLES (learn from these real patterns):

Example 1: "27/Feb/2025 Sia Moon wall materials bank transfer 4785 baht"
→ {
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

Example 2: "labour payment cash 135200 sia moon construction"
→ {
  "day": "${currentDay}",
  "month": "${currentMonth}",
  "year": "${currentYear}",
  "property": "Sia Moon - Land - General",
  "typeOfOperation": "EXP - Construction - Wall",
  "typeOfPayment": "Cash",
  "detail": "Labour",
  "ref": "",
  "debit": 135200,
  "credit": 0
}

Example 3: "alesia house aircon installation bank transfer 29700"
→ {
  "day": "${currentDay}",
  "month": "${currentMonth}",
  "year": "${currentYear}",
  "property": "Alesia House",
  "typeOfOperation": "EXP - Appliances & Electronics",
  "typeOfPayment": "Bank transfer",
  "detail": "Aircon installation",
  "ref": "",
  "debit": 29700,
  "credit": 0
}

ENHANCED PARSING RULES:

1. **Property Detection (Priority Order)**:
   - "sia moon" → "Sia Moon - Land - General" (default)
   - "alesia house" → "Alesia House"
   - "lanna house" → "Lanna House"
   - "parents house", "parents" → "Parents House"
   - "shaun ducker", "shaun" → "Shaun Ducker"
   - "maria ren", "maria" → "Maria Ren"
   - "family" (standalone) → "Family"
   - If unclear → "Sia Moon - Land - General"

2. **Smart Operation Categorization**:
   - "wall", "materials", "construction" → "EXP - Construction - Wall"
   - "labour", "labor", "worker", "painting" → "EXP - Construction - Wall"
   - "electric", "electrical", "cable", "wiring" → "EXP - Construction - Electric Supplies"
   - "aircon", "air purifier", "electronics" → "EXP - Appliances & Electronics"
   - "door", "window", "lock", "hardware" → "EXP - Windows, Doors, Locks & Hardware"
   - "pillow", "decor", "decoration", "elephant" → "EXP - Decor"
   - "termite", "maintenance", "repair" → "EXP - Repairs & Maintenance - Electrical & Mechanical"
   - "salary", "salaries", "staff" → "EXP - HR - Employees Salaries"
   - "gas", "water", "electricity bill" → "EXP - Utilities - [Gas/Water/Electricity]"
   - Revenue keywords → Use "Revenue - [Sales/Services/Commision]"

3. **Payment Method Keywords**:
   - "cash", "ค่าแรง" → "Cash"
   - "transfer", "bank", "โอน" → "Bank transfer" 
   - "card", "credit" → "Credit card"
   - Default → "Cash"

4. **Detail Field Intelligence**:
   - For construction: "Materials", "Labour", "Labour - painting"
   - For appliances: Specific item name (e.g., "Aircon installation", "Air purifier")
   - For maintenance: Service description (e.g., "Termite treatment 2nd half for 2025 year")
   - Keep concise but descriptive
   - Capitalize first letter

5. **Currency & Amount Processing**:
   - Remove: ฿, $, €, £, ¥, commas, "baht", "bath", "thb"
   - Examples: "฿15,820" → 15820, "4,785 baht" → 4785, "279" → 279
   - For expenses/costs → debit field, credit = 0
   - For income/revenue → credit field, debit = 0

6. **Date Intelligence**:
   - Parse DD/MM/YYYY, DD-MM-YYYY formats
   - Handle Buddhist Era (BE) years by subtracting 543
   - Month must be 3-letter: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
   - Default to today if no date: "${currentDay}", "${currentMonth}", "${currentYear}"

7. **Reference Field**:
   - Look for "INV-", "Receipt #", invoice numbers
   - Leave empty string "" if not found

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON, no additional text
- Use EXACT property names from dropdown (including "Sia Moon - Land - General")
- Use EXACT operation categories from dropdown
- All amounts as plain numbers (no currency symbols)
- Month as 3-letter abbreviation
- Detail field should be meaningful and concise

JSON Schema:
{
  "day": "<string: day number>",
  "month": "<string: 3-letter month>", 
  "year": "<string: 4-digit year>",
  "property": "<string: exact property name from dropdown>",
  "typeOfOperation": "<string: exact operation category from dropdown>",
  "typeOfPayment": "<string: exact payment method from dropdown>",
  "detail": "<string: transaction description>",
  "ref": "<string: reference number or empty>",
  "debit": <number: expense amount or 0>,
  "credit": <number: income amount or 0>
}`;
};