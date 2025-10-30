const https = require('https');
const fs = require('fs');

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwRMGdzvsn3-3JhlUA8cVMeX5gySIJzTMJu1hywgPAT2_QiVKj-3KJfFScHhDQwFtKC/exec';
const SECRET = 'VqwvzpO3Ja5Yn+qhWg6DLwTspv/t2V8f3CXI+iJ9Dz8=';

console.log('🔄 Fetching dropdown options from Google Sheets...\n');

const postData = JSON.stringify({
  action: 'list_named_ranges',
  secret: SECRET
});

const url = new URL(WEBHOOK_URL);
const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (result.ok && result.ranges) {
        console.log('✅ Successfully fetched named ranges!\n');
        
        const ranges = result.ranges;
        let properties = [];
        let operations = [];
        let payments = [];
        
        for (const [name, info] of Object.entries(ranges)) {
          if (Array.isArray(info.value)) {
            if (name.toLowerCase().includes('property') && !name.toLowerCase().includes('operation')) {
              properties = info.value.filter(v => v && v.trim());
              console.log(`📋 Found ${name}: ${properties.length} items`);
            } else if (name.toLowerCase().includes('operation')) {
              operations = info.value.filter(v => v && v.trim());
              console.log(`📋 Found ${name}: ${operations.length} items`);
            } else if (name.toLowerCase().includes('payment')) {
              payments = info.value.filter(v => v && v.trim());
              console.log(`📋 Found ${name}: ${payments.length} items`);
            }
          }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 CURRENT GOOGLE SHEETS DROPDOWN VALUES:\n');
        
        console.log('Properties (' + properties.length + '):');
        properties.forEach((p, i) => console.log(`  ${i+1}. ${p}`));
        
        console.log('\nType of Operation (' + operations.length + '):');
        operations.forEach((o, i) => console.log(`  ${i+1}. ${o}`));
        
        console.log('\nType of Payment (' + payments.length + '):');
        payments.forEach((p, i) => console.log(`  ${i+1}. ${p}`));
        
        const freshData = {
          properties,
          typeOfOperation: operations,
          typeOfPayment: payments,
          fetchedAt: new Date().toISOString()
        };
        
        fs.writeFileSync('fresh-dropdowns.json', JSON.stringify(freshData, null, 2));
        console.log('\n✅ Saved to fresh-dropdowns.json');
        
        // Now compare with local config
        const localConfig = JSON.parse(fs.readFileSync('config/options.json', 'utf8'));
        
        console.log('\n' + '='.repeat(60));
        console.log('\n🔍 COMPARISON WITH LOCAL CONFIG:\n');
        
        // Compare properties
        const missingProps = properties.filter(p => !localConfig.properties.includes(p));
        const extraProps = localConfig.properties.filter(p => !properties.includes(p));
        
        console.log('📋 PROPERTIES:');
        if (missingProps.length > 0) {
          console.log('  ❌ Missing from local config:');
          missingProps.forEach(p => console.log(`     - ${p}`));
        }
        if (extraProps.length > 0) {
          console.log('  ➕ Extra in local (not in sheet):');
          extraProps.forEach(p => console.log(`     - ${p}`));
        }
        if (missingProps.length === 0 && extraProps.length === 0) {
          console.log('  ✅ In sync!');
        }
        
        // Compare operations
        const missingOps = operations.filter(o => !localConfig.typeOfOperation.includes(o));
        const extraOps = localConfig.typeOfOperation.filter(o => !operations.includes(o));
        
        console.log('\n📋 TYPE OF OPERATION:');
        if (missingOps.length > 0) {
          console.log('  ❌ Missing from local config:');
          missingOps.forEach(o => console.log(`     - ${o}`));
        }
        if (extraOps.length > 0) {
          console.log('  ➕ Extra in local (not in sheet):');
          extraOps.forEach(o => console.log(`     - ${o}`));
        }
        if (missingOps.length === 0 && extraOps.length === 0) {
          console.log('  ✅ In sync!');
        }
        
        // Compare payments
        const missingPays = payments.filter(p => !localConfig.typeOfPayment.includes(p));
        const extraPays = localConfig.typeOfPayment.filter(p => !payments.includes(p));
        
        console.log('\n📋 TYPE OF PAYMENT:');
        if (missingPays.length > 0) {
          console.log('  ❌ Missing from local config:');
          missingPays.forEach(p => console.log(`     - ${p}`));
        }
        if (extraPays.length > 0) {
          console.log('  ➕ Extra in local (not in sheet):');
          extraPays.forEach(p => console.log(`     - ${p}`));
        }
        if (missingPays.length === 0 && extraPays.length === 0) {
          console.log('  ✅ In sync!');
        }
        
        console.log('\n' + '='.repeat(60));
        
      } else {
        console.log('❌ Error from API:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('First 500 chars:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();
