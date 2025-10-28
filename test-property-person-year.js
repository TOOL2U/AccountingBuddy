/**
 * Test Property/Person API - Year Period
 */

const SCRIPT_URL = process.env.SHEETS_WEBHOOK_URL;
const SECRET = process.env.SHEETS_WEBHOOK_SECRET;

if (!SCRIPT_URL || !SECRET) {
  console.log('❌ Missing environment variables!');
  console.log('SHEETS_WEBHOOK_URL:', SCRIPT_URL ? 'SET' : 'MISSING');
  console.log('SHEETS_WEBHOOK_SECRET:', SECRET ? 'SET' : 'MISSING');
  process.exit(1);
}

console.log('📍 Testing Property/Person API - Year Period');
console.log('Script URL:', SCRIPT_URL ? 'SET' : 'MISSING');
console.log('Secret:', SECRET ? 'SET' : 'MISSING');

const payload = {
  action: 'getPropertyPersonDetails',
  period: 'year',
  secret: SECRET
};

console.log('📤 Sending payload:', {
  ...payload,
  secret: '[REDACTED]'
});

fetch(SCRIPT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
})
.then(response => {
  console.log('📊 Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('📋 Response data:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ Error:', error);
});