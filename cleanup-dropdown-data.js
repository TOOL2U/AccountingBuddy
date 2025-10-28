/**
 * Clean up the mixed data from the Google Sheets sync
 * Remove properties from operations list and clean trailing spaces
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up mixed dropdown data...');

// Read current config
const optionsPath = path.join(__dirname, 'config/options.json');
const liveDropdownsPath = path.join(__dirname, 'config/live-dropdowns.json');

const currentOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
const currentLiveDropdowns = JSON.parse(fs.readFileSync(liveDropdownsPath, 'utf8'));

console.log('📊 Before cleanup:');
console.log(`   Properties: ${currentOptions.properties.length} items`);
console.log(`   Type of Operation: ${currentOptions.typeOfOperation.length} items`);
console.log(`   Type of Payment: ${currentOptions.typeOfPayment.length} items`);

// Clean properties (remove "Property" if it's a header)
const cleanProperties = currentOptions.properties
  .map(p => p.trim())
  .filter(p => p && p !== 'Property')
  .filter((p, index, arr) => arr.indexOf(p) === index); // Remove duplicates

// Clean type of operations (remove properties that got mixed in)
const propertyNames = [
  'Property',
  'Sia Moon - Land - General',
  'Alesia House', 
  'Lanna House',
  'Parents House',
  'Shaun Ducker',
  'Maria Ren'
];

const cleanOperations = currentOptions.typeOfOperation
  .map(op => op.trim())
  .filter(op => op && !propertyNames.includes(op.trim()))
  .filter((op, index, arr) => arr.indexOf(op) === index); // Remove duplicates

// Clean type of payment (remove headers)
const cleanPayments = currentOptions.typeOfPayment
  .map(p => p.trim())
  .filter(p => p && p !== 'Type of payment')
  .filter((p, index, arr) => arr.indexOf(p) === index); // Remove duplicates

console.log('\\n🧹 After cleanup:');
console.log(`   Properties: ${cleanProperties.length} items`);
console.log(`   Type of Operation: ${cleanOperations.length} items`);
console.log(`   Type of Payment: ${cleanPayments.length} items`);

// Show what we found as NEW operations (the actual new ones)
const originalOperations = [
  "Revenue - Commision",
  "Revenue - Sales", 
  "Revenue - Services",
  "Revenue - Rental Income",
  "Fixed Costs",
  "EXP - Utilities - Gas",
  "EXP - Utilities - Water", 
  "EXP - Utilities  - Electricity",
  "EXPENSES",
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
  "EXP - Other Expenses"
];

const actualNewOperations = cleanOperations.filter(op => 
  !originalOperations.some(orig => orig.trim() === op.trim())
);

if (actualNewOperations.length > 0) {
  console.log('\\n🆕 ACTUAL NEW OPERATIONS FOUND:');
  actualNewOperations.forEach((op, i) => {
    console.log(`   ${i + 1}. ${op}`);
  });
} else {
  console.log('\\n✅ No genuinely new operations found (data was just reformatted)');
}

// Update configs with cleaned data
currentOptions.properties = cleanProperties;
currentOptions.typeOfOperation = cleanOperations;
currentOptions.typeOfPayment = cleanPayments;

currentLiveDropdowns.property = cleanProperties;
currentLiveDropdowns.typeOfOperation = cleanOperations;
currentLiveDropdowns.typeOfPayment = cleanPayments;
currentLiveDropdowns.fetchedAt = new Date().toISOString();
currentLiveDropdowns.source = 'google_sheets_api_cleaned';

// Write cleaned files
fs.writeFileSync(optionsPath, JSON.stringify(currentOptions, null, 2));
fs.writeFileSync(liveDropdownsPath, JSON.stringify(currentLiveDropdowns, null, 2));

console.log('\\n✅ CLEANED CONFIG FILES:');
console.log('   ✅ config/options.json (removed duplicates and mixed data)');
console.log('   ✅ config/live-dropdowns.json (cleaned structure)');

console.log('\\n📋 Clean Type of Operations:');
cleanOperations.forEach((op, i) => {
  const isNew = actualNewOperations.includes(op);
  console.log(`   ${i + 1}. ${op} ${isNew ? '🆕' : ''}`);
});

console.log('\\n🎉 Cleanup complete! All dropdown data is now properly organized.');