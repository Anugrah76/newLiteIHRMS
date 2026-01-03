# Mapbox Usage Optimization Guide

## 🎯 Goal: Stay Under 1,000 API Calls/Month

Even though Mapbox free tier allows 50,000 map loads/month, we've implemented conservative limits to ensure you never accidentally exceed free tier.

## 📊 Our Limits

| Limit Type | Value | Mapbox Free Tier |
|------------|-------|------------------|
| **Monthly** | 1,000 requests | 50,000 |
| **Daily** | 33 requests | ~1,666 |
| **Hourly** | 5 requests | ~69 |

## ✅ How We Stay Under Limits

### 1. **Aggressive Caching**
```typescript
// Maps are cached locally for 30 days
TILE_CACHE_SIZE_MB: 50
MAP_TILES_TTL_DAYS: 30
```

### 2. **Offline Maps** (Best Strategy!)
```typescript
// Download Delhi NCR once, use forever
ENABLE_OFFLINE_MAPS: true
```
- Download map tiles once
- Zero API calls after initial download
- Perfect for field workers in same area

### 3. **Static Maps Disabled**
```typescript
ENABLE_STATIC_THUMBNAILS: false  // Saves ~240 calls/month
```
- Instead of generating thumbnails (1 API call per trip)
- We use cached screenshots or text summaries

### 4. **Geocoding Disabled**
```typescript
ENABLE_GEOCODING: false  // Saves ~100 calls/month
```
- No reverse lookup of addresses from coordinates
- Use stored addresses from trip start/end

### 5. **Smart Map Loading**
```typescript
LAZY_LOAD_MAPS: true  // Only load when screen visible
DEBOUNCE_MAP_UPDATES_MS: 1000  // Wait 1s before updating
REUSE_MAP_INSTANCE: true  // Don't reload unnecessarily
```

## 📈 Expected Usage (500 Users, Normal Activity)

| Activity | API Calls |
|----------|-----------|
| Initial offline map download | 1 (one-time) |
| View active trip map | 1 per trip start |
| View trip detail | 1 per view (cached 30 days) |
| View heatmap | 1 per view (cached 30 min) |
| **Estimated Monthly Total** | **~50-100 calls** ✅ |

**You'll stay well under 1,000!**

## 🚨 Usage Tracking

We automatically track every API call:

```typescript
import { mapboxUsageTracker } from '@/src/features/trip-tracking/services/mapboxUsageTracker';

// View current usage
const usage = await mapboxUsageTracker.getUsage();
console.log(`${usage.monthlyUsage}/${usage.monthlyLimit} used this month`);
```

**Visual Indicator**: Every map screen shows usage stats with color coding:
- 🟢 Green: <70% (safe)
- 🟡 Yellow: 70-90% (warning)
- 🔴 Red: >90% (critical)

## 🛑 What Happens if Limit Reached?

Maps automatically fall back to:
1. **Cached map screenshots** (if available)
2. **Placeholder image** with message
3. **Text-based route** (start → end addresses, distance)

**No errors, just graceful degradation!**

## 🔧 Adjusting Limits (if needed)

Edit `src/features/trip-tracking/config/mapboxConfig.ts`:

```typescript
export const MAPBOX_CONFIG = {
  MAX_MONTHLY_REQUESTS: 1000,  // Increase if needed
  MAX_DAILY_REQUESTS: 33,
  MAX_HOURLY_REQUESTS: 5,
};
```

## 💡 Best Practices

### ✅ DO:
- Enable offline maps for your region
- Let maps cache (don't clear cache frequently)
- View trip history list first (no maps), then details
- Use text-based stats when possible

### ❌ DON'T:
- Reload maps unnecessarily
- Enable geocoding (unless critical)
- Enable static thumbnails
- Clear app cache daily

## 📱 For Field Workers

**One-Time Setup** (uses 1 API call):
1. Open any map screen
2. Download offline map for Delhi NCR
3. All future maps work offline (0 API calls!)

**Result**: ~50 employees × 1 download = 50 API calls total, then 0 forever!

## 🎯 Summary

With our conservative settings:
- **Expected: 50-150 calls/month** (with 500 users)
- **Limit: 1,000 calls/month**
- **Safety margin: 85-90%** ✅

**You're safe to create your free Mapbox account!**

---

*Last Updated: December 30, 2024*  
*Mapbox Free Tier: 50,000 map loads/month*  
*Our Target: <1,000/month (98% safety margin)*
