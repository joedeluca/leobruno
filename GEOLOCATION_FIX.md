# Geolocation Fix

## Problem

The `geoip-lite` package had missing data files causing this error:

```
Error: ENOENT: no such file or directory, open '/ROOT/node_modules/geoip-lite/data/geoip-country.dat'
```

## Solution

Replaced `geoip-lite` with **ipapi.co** free API service.

### Why ipapi.co?

- ✅ No installation required (uses HTTP API)
- ✅ Free tier: 1,000 requests/day (plenty for contact form)
- ✅ No API key needed
- ✅ Returns detailed location data
- ✅ Works in serverless environments (Vercel)
- ✅ Graceful fallback on errors

### Changes Made

#### 1. Removed geoip-lite

```bash
npm uninstall geoip-lite @types/geoip-lite
```

#### 2. Updated getLocation function

Changed from synchronous lookup to async API call:

```typescript
async function getLocation(ip: string): Promise<string> {
  // Handle local/private IPs
  if (
    ip === "unknown" ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return "Local/Unknown"
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: { "User-Agent": "leobruno-contact-form" },
    })

    clearTimeout(timeoutId)

    if (!response.ok) return "Unknown"

    const data = await response.json()

    const parts = []
    if (data.city) parts.push(data.city)
    if (data.region) parts.push(data.region)
    if (data.country_name) parts.push(data.country_name)

    return parts.length > 0 ? parts.join(", ") : "Unknown"
  } catch (error) {
    return "Unknown" // Graceful fallback
  }
}
```

#### 3. Updated function call

Changed from sync to async:

```typescript
// Before
const location = getLocation(ip)

// After
const location = await getLocation(ip)
```

### Features

- **2-second timeout**: Prevents slow API from blocking email send
- **Error handling**: Returns "Unknown" if geolocation fails
- **Private IP detection**: Handles localhost, LAN IPs
- **No API key**: Works out of the box
- **Detailed info**: Returns "City, Region, Country"

### Testing

The contact form will now work without errors. Location data appears in emails like:

```
From: New York, New York, United States
IP: 123.45.67.89
Time: Monday, January 13, 2025 at 3:45 PM
```

### Rate Limits

ipapi.co free tier:

- 1,000 requests/day
- 30,000 requests/month

This is plenty for a contact form. If needed, can upgrade to Pro plan or switch to another service.

### Alternatives (if needed)

1. **ip-api.com** - 45 req/min free
2. **ipgeolocation.io** - 1k/day free (requires API key)
3. **ipstack.com** - 1k/month free (requires API key)
4. **Make it optional** - Remove geolocation entirely
