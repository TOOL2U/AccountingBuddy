const liveDropdowns = require('./config/live-dropdowns.json');
const currentOptions = require('./config/options.json');

console.log('🔍 DETAILED COMPARISON ANALYSIS\n');

// Compare Properties
console.log('📋 PROPERTIES COMPARISON:');
console.log('Live Sheet Properties:', liveDropdowns.property.length, 'items');
console.log('Local File Properties:', currentOptions.properties.length, 'items');

const addedProperties = liveDropdowns.property.filter(p => !currentOptions.properties.includes(p));
const removedProperties = currentOptions.properties.filter(p => !liveDropdowns.property.includes(p));

if (addedProperties.length > 0) {
  console.log('✅ ADDED Properties:', addedProperties);
} else {
  console.log('✅ No new properties added');
}

if (removedProperties.length > 0) {
  console.log('❌ REMOVED Properties:', removedProperties);
} else {
  console.log('✅ No properties removed');
}

// Compare Type of Operations
console.log('\n📋 TYPE OF OPERATION COMPARISON:');
console.log('Live Sheet Operations:', liveDropdowns.typeOfOperation.length, 'items');
console.log('Local File Operations:', currentOptions.typeOfOperation.length, 'items');

const addedOperations = liveDropdowns.typeOfOperation.filter(op => !currentOptions.typeOfOperation.includes(op));
const removedOperations = currentOptions.typeOfOperation.filter(op => !liveDropdowns.typeOfOperation.includes(op));

if (addedOperations.length > 0) {
  console.log('✅ ADDED Operations:');
  addedOperations.forEach(op => console.log('  +', op));
} else {
  console.log('✅ No new operations added');
}

if (removedOperations.length > 0) {
  console.log('❌ REMOVED Operations:');
  removedOperations.forEach(op => console.log('  -', op));
} else {
  console.log('✅ No operations removed');
}

// Compare Type of Payment
console.log('\n📋 TYPE OF PAYMENT COMPARISON:');
console.log('Live Sheet Payments:', liveDropdowns.typeOfPayment.length, 'items');
console.log('Local File Payments:', currentOptions.typeOfPayment.length, 'items');

const addedPayments = liveDropdowns.typeOfPayment.filter(p => !currentOptions.typeOfPayment.includes(p));
const removedPayments = currentOptions.typeOfPayment.filter(p => !liveDropdowns.typeOfPayment.includes(p));

if (addedPayments.length > 0) {
  console.log('✅ ADDED Payments:', addedPayments);
} else {
  console.log('✅ No new payments added');
}

if (removedPayments.length > 0) {
  console.log('❌ REMOVED Payments:', removedPayments);
} else {
  console.log('✅ No payments removed');
}

console.log('\n🎯 SUMMARY:');
const totalChanges = addedProperties.length + removedProperties.length + 
                    addedOperations.length + removedOperations.length + 
                    addedPayments.length + removedPayments.length;
console.log('Total changes needed:', totalChanges);

// Detailed character-by-character comparison for exact spelling
console.log('\n🔍 EXACT SPELLING & FORMATTING CHECK:');

console.log('\n📝 Properties detailed check:');
liveDropdowns.property.forEach((liveProp, i) => {
  const localProp = currentOptions.properties[i];
  if (liveProp !== localProp) {
    console.log(`  ⚠️  Position ${i}:`);
    console.log(`    Live:  "${liveProp}"`);
    console.log(`    Local: "${localProp}"`);
  }
});

console.log('\n📝 Type of Operation detailed check:');
liveDropdowns.typeOfOperation.forEach((liveOp, i) => {
  const localOp = currentOptions.typeOfOperation[i];
  if (liveOp !== localOp) {
    console.log(`  ⚠️  Position ${i}:`);
    console.log(`    Live:  "${liveOp}"`);
    console.log(`    Local: "${localOp}"`);
  }
});

console.log('\n📝 Type of Payment detailed check:');
liveDropdowns.typeOfPayment.forEach((livePay, i) => {
  const localPay = currentOptions.typeOfPayment[i];
  if (livePay !== localPay) {
    console.log(`  ⚠️  Position ${i}:`);
    console.log(`    Live:  "${livePay}"`);
    console.log(`    Local: "${localPay}"`);
  }
});