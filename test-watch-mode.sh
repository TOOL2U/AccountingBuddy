#!/bin/bash

# Test Watch Mode Demo
# This script demonstrates watch mode in action

echo "=================================================="
echo "  🎬 WATCH MODE DEMO"
echo "=================================================="
echo ""
echo "Starting watch mode with 15-second interval..."
echo "This will run 3 checks, then automatically stop."
echo ""
echo "Press Ctrl+C to stop earlier if needed."
echo ""
echo "=================================================="
echo ""

# Start watch mode in background
node sync-sheets.js --watch --interval=15 > /tmp/sync-demo.log 2>&1 &
WATCH_PID=$!

echo "✅ Watch mode started (PID: $WATCH_PID)"
echo ""

# Monitor for 50 seconds (3 checks at 15-second intervals)
for i in {1..50}; do
  sleep 1
  
  # Show progress
  if [ $((i % 5)) -eq 0 ]; then
    echo "⏱️  $i seconds elapsed..."
  fi
  
  # Show check completion
  if grep -q "Check #1" /tmp/sync-demo.log && [ $i -eq 16 ]; then
    echo "✅ Check #1 completed!"
  fi
  
  if grep -q "Check #2" /tmp/sync-demo.log && [ $i -eq 31 ]; then
    echo "✅ Check #2 completed!"
  fi
  
  if grep -q "Check #3" /tmp/sync-demo.log && [ $i -eq 46 ]; then
    echo "✅ Check #3 completed!"
  fi
done

echo ""
echo "=================================================="
echo "  Stopping watch mode..."
echo "=================================================="

# Stop watch mode
kill $WATCH_PID 2>/dev/null

sleep 2

echo ""
echo "📋 Watch mode log output:"
echo "--------------------------------------------------"
cat /tmp/sync-demo.log
echo "--------------------------------------------------"
echo ""
echo "✅ Demo complete!"
echo ""
echo "To run watch mode for real:"
echo "  node sync-sheets.js --watch"
echo ""
echo "To run in background:"
echo "  nohup node sync-sheets.js --watch > sync-watch.log 2>&1 &"
echo ""

# Cleanup
rm -f /tmp/sync-demo.log
