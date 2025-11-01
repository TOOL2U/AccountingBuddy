#!/bin/bash

# Fix Apps Script Content-Type Headers
# This script updates all API routes to use text/plain instead of application/json
# for Google Apps Script webhook calls

echo "🔧 Fixing Content-Type headers for Apps Script calls..."
echo ""

# Files to update
FILES=(
  "app/api/pnl/route.ts"
  "app/api/inbox/route.ts"
  "app/api/balance/get/route.ts"
  "app/api/balance/save/route.ts"
  "app/api/pnl/property-person/route.ts"
  "app/api/pnl/overhead-expenses/route.ts"
  "app/api/pnl/namedRanges/route.ts"
  "app/api/sheets/route.ts"
)

# Backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backups in $BACKUP_DIR..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    cp "$file" "$BACKUP_DIR/$(basename $file)"
    echo "  ✅ Backed up: $file"
  fi
done
echo ""

echo "🔄 Updating Content-Type headers..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Replace 'Content-Type': 'application/json' with 'Content-Type': 'text/plain;charset=utf-8'
    sed -i '' "s/'Content-Type': 'application\/json'/'Content-Type': 'text\/plain;charset=utf-8'/g" "$file"
    
    # Also handle double quotes version
    sed -i '' 's/"Content-Type": "application\/json"/"Content-Type": "text\/plain;charset=utf-8"/g' "$file"
    
    echo "  ✅ Updated: $file"
  else
    echo "  ⚠️  Not found: $file"
  fi
done
echo ""

echo "✅ All files updated!"
echo ""
echo "📋 Next steps:"
echo "  1. Test locally: npm run dev"
echo "  2. Test API: curl http://localhost:3000/api/pnl"
echo "  3. Commit: git add -A && git commit -m 'fix: use text/plain for Apps Script requests'"
echo "  4. Deploy: git push origin main"
echo ""
echo "💾 Backups saved in: $BACKUP_DIR"
