# 🔥 Watch Mode - Production Deployment Guide

## What is Watch Mode?

Watch mode runs `sync-sheets.js` **continuously** in the background, automatically detecting and syncing changes from Google Sheets every N seconds (default: 5 minutes).

## Quick Start

### 1. Test Locally First

```bash
# Test with short interval (10 seconds)
node sync-sheets.js --watch --interval=10

# Let it run for a minute, then press Ctrl+C to stop
```

### 2. Run in Background (Development)

```bash
# Start in background with 5-minute checks
nohup node sync-sheets.js --watch > sync-watch.log 2>&1 &

# Check the process
ps aux | grep sync-sheets

# View live logs
tail -f sync-watch.log

# Stop the process
pkill -f "node sync-sheets.js"
```

### 3. Production Deployment Options

#### Option A: PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start watch mode with PM2
pm2 start sync-sheets.js --name "sheets-sync" -- --watch --interval=300

# View logs
pm2 logs sheets-sync

# Monitor
pm2 monit

# Restart
pm2 restart sheets-sync

# Stop
pm2 stop sheets-sync

# Auto-restart on server reboot
pm2 startup
pm2 save
```

#### Option B: systemd (Linux Servers)

Create `/etc/systemd/system/sheets-sync.service`:

```ini
[Unit]
Description=Google Sheets Sync Service
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/accounting-buddy-app
Environment=NODE_ENV=production
ExecStart=/usr/bin/node sync-sheets.js --watch --interval=300
Restart=always
RestartSec=10
StandardOutput=append:/var/log/sheets-sync.log
StandardError=append:/var/log/sheets-sync-error.log

[Install]
WantedBy=multi-user.target
```

Then:

```bash
# Enable and start service
sudo systemctl enable sheets-sync
sudo systemctl start sheets-sync

# Check status
sudo systemctl status sheets-sync

# View logs
sudo journalctl -u sheets-sync -f

# Restart
sudo systemctl restart sheets-sync

# Stop
sudo systemctl stop sheets-sync
```

#### Option C: Docker

Create `Dockerfile.sync`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["node", "sync-sheets.js", "--watch", "--interval=300"]
```

Then:

```bash
# Build image
docker build -f Dockerfile.sync -t sheets-sync .

# Run container
docker run -d \
  --name sheets-sync \
  --restart unless-stopped \
  -v $(pwd)/.env.local:/app/.env.local \
  -v $(pwd)/config:/app/config \
  sheets-sync

# View logs
docker logs -f sheets-sync

# Stop
docker stop sheets-sync

# Restart
docker restart sheets-sync
```

## Configuration

### Recommended Intervals

| Environment | Interval | Reason |
|-------------|----------|--------|
| Development | 10-60s | Fast feedback during testing |
| Staging | 300s (5min) | Balance between responsiveness and API usage |
| Production | 300-600s (5-10min) | Efficient, low API usage |
| Low Activity | 1800s (30min) | Very stable sheets, minimal changes |

### Set Custom Interval

```bash
# Every 1 minute (60 seconds)
node sync-sheets.js --watch --interval=60

# Every 5 minutes (300 seconds) - DEFAULT
node sync-sheets.js --watch --interval=300

# Every 10 minutes (600 seconds)
node sync-sheets.js --watch --interval=600

# Every 30 minutes (1800 seconds)
node sync-sheets.js --watch --interval=1800

# Every 1 hour (3600 seconds)
node sync-sheets.js --watch --interval=3600
```

## What Gets Monitored

Watch mode continuously checks for changes in:

1. **Named Ranges** - Auto-fixes if rows shift
2. **Dropdown Options** - Type of Operation, Properties, Payment types
3. **P&L Structure** - Property/Person rows, Overhead expense rows
4. **Data Changes** - Any additions/removals in Data sheet

## When Changes Are Detected

Watch mode automatically:

1. ✅ Detects the specific change (named ranges, dropdowns, structure)
2. ✅ Runs full sync process
3. ✅ Updates config files
4. ✅ Updates Apps Script if needed
5. ✅ Generates sync report
6. ✅ Logs all changes with timestamp

## Monitoring

### View Live Logs

```bash
# If running with nohup
tail -f sync-watch.log

# If running with PM2
pm2 logs sheets-sync

# If running with systemd
sudo journalctl -u sheets-sync -f

# If running with Docker
docker logs -f sheets-sync
```

### Check Status

```bash
# With PM2
pm2 status

# With systemd
sudo systemctl status sheets-sync

# With Docker
docker ps | grep sheets-sync
```

### Log Output Examples

```
----------------------------------------------------------------------
  Check #1 - 3:22:18 PM
----------------------------------------------------------------------
✅ No changes detected - everything in sync
ℹ️  Next check at 3:27:18 PM

----------------------------------------------------------------------
  Check #2 - 3:27:18 PM
----------------------------------------------------------------------
⚡ CHANGES DETECTED: Named Ranges
ℹ️  Running full sync...
✅ Auto-fixed 2 named range(s)
✅ Sync complete!
```

## Stopping Watch Mode

### From Terminal (if running in foreground)
```bash
Press Ctrl+C
```

### From Background (nohup)
```bash
pkill -f "node sync-sheets.js"
```

### With PM2
```bash
pm2 stop sheets-sync
```

### With systemd
```bash
sudo systemctl stop sheets-sync
```

### With Docker
```bash
docker stop sheets-sync
```

## Troubleshooting

### Watch mode not detecting changes

**Check:**
1. Is the interval too long? Try shorter interval for testing
2. Are you watching the right Google Sheet? Check `GOOGLE_SHEET_ID` in `.env.local`
3. Check logs for API errors

### High API usage

**Solution:**
- Increase interval: `--interval=600` (10 minutes)
- Google Sheets API has generous quotas, but watch mode is designed to be efficient

### Process keeps dying

**Solution:**
- Use PM2 or systemd for auto-restart
- Check logs for error messages
- Verify `.env.local` has all required variables

### Changes not syncing to config files

**Check:**
1. Process has write permissions to `config/` folder
2. Not running in `--dry-run` mode
3. Check logs for errors during sync

## Performance

### Resource Usage
- **CPU:** <1% (idle between checks)
- **Memory:** ~50-100MB
- **Network:** 1-2 API calls per check (~5KB per call)

### API Quotas
- Google Sheets API: 300 requests/minute, 600 requests/100 seconds
- Watch mode: ~2 requests every N seconds
- At 5-minute interval: ~24 requests/hour = **well within limits**

## Best Practices

1. ✅ **Start with longer intervals** (5-10 minutes) in production
2. ✅ **Use PM2 or systemd** for process management
3. ✅ **Monitor logs regularly** for errors
4. ✅ **Test locally first** with short intervals
5. ✅ **Set up alerts** for process failures
6. ✅ **Commit config changes** to git after sync
7. ✅ **Don't run multiple instances** - one watch mode per environment

## Security

Watch mode requires:
- ✅ Read access to Google Sheets
- ✅ Write access to Google Sheets (for named range updates)
- ✅ Write access to local config files
- ✅ Valid service account credentials

**DO NOT:**
- ❌ Expose sync-watch.log publicly (contains sync details)
- ❌ Run multiple watch modes simultaneously
- ❌ Give watch mode process unnecessary permissions

## Integration with Development Workflow

### Local Development
```bash
# Don't run watch mode locally
# Just run manual sync when needed
node sync-sheets.js
```

### CI/CD Pipeline
```bash
# Run once during build
node sync-sheets.js

# Don't run watch mode in CI/CD
```

### Production Server
```bash
# Run watch mode with PM2
pm2 start sync-sheets.js --name "sheets-sync" -- --watch --interval=300
```

---

**Status:** ✅ **PRODUCTION READY**  
**Recommended Setup:** PM2 with 5-minute interval  
**Created:** November 1, 2025
