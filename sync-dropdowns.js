/**
 * Quick sync script to get the latest dropdown values
 * Uses the Next.js API to fetch from Google Sheets
 */

console.log('🔄 Syncing dropdown values from Google Sheets...');

async function syncDropdowns() {
  try {
    // Use the extract API which has the latest dropdown logic
    const response = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true,
        // This will trigger the dropdown fetch logic
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully connected to API');
    
    // The latest dropdown options should be in the response
    if (data.dropdownOptions) {
      console.log('\n📋 Current Type of Operation options:');
      data.dropdownOptions.typeOfOperation.forEach((op, i) => {
        console.log(`${i + 1}. ${op}`);
      });
      
      console.log('\n💾 Updating local configuration files...');
      
      // Update options.json
      const fs = require('fs');
      const path = require('path');
      
      const optionsPath = path.join(__dirname, '../config/options.json');
      const liveDropdownsPath = path.join(__dirname, '../config/live-dropdowns.json');
      
      // Read current options
      const currentOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
      const currentLiveDropdowns = JSON.parse(fs.readFileSync(liveDropdownsPath, 'utf8'));
      
      // Update with latest data
      currentOptions.typeOfOperation = data.dropdownOptions.typeOfOperation;
      currentLiveDropdowns.typeOfOperation = data.dropdownOptions.typeOfOperation;
      currentLiveDropdowns.fetchedAt = new Date().toISOString();
      
      // Write back
      fs.writeFileSync(optionsPath, JSON.stringify(currentOptions, null, 2));
      fs.writeFileSync(liveDropdownsPath, JSON.stringify(currentLiveDropdowns, null, 2));
      
      console.log('✅ Updated config/options.json');
      console.log('✅ Updated config/live-dropdowns.json');
      
    } else {
      console.log('⚠️ No dropdown options found in response');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error syncing dropdowns:', error.message);
  }
}

syncDropdowns();