# Offline Functionality

## Overview

SolarMed AI is designed to operate seamlessly in offline environments, with automatic synchronization when internet connectivity is available. This document outlines the offline capabilities and how they work.

## Offline Storage

### IndexedDB

The application uses IndexedDB for local data storage:

```javascript
const db = {
  patients: 'patients',
  diagnoses: 'diagnoses',
  energy: 'energy',
  settings: 'settings'
};
```

Each store maintains its own version of the data with timestamps for conflict resolution.

### Service Worker

The service worker (`sw.js`) handles:
- Caching of static assets
- API response caching
- Background synchronization
- Offline page serving

## Data Synchronization

### Sync Queue

When offline, all data modifications are queued:

```javascript
{
  store: 'patients',
  action: 'add|update|delete',
  data: { ... },
  timestamp: 'ISO string'
}
```

### Background Sync

The service worker registers a background sync:

```javascript
registration.sync.register('sync-data');
```

### Conflict Resolution

Conflicts are resolved using a last-write-wins strategy with timestamps:

1. Compare timestamps of local and server versions
2. Keep the most recent version
3. Log conflicts for manual review if needed

## Offline Features

### Patient Management
- Create and update patient records
- View patient history
- Add diagnoses
- Upload photos (queued for sync)

### Diagnosis
- Create new diagnoses
- View past diagnoses
- Add symptoms and observations
- Record treatment plans

### Energy Monitoring
- View current energy status
- Access historical data
- Set alerts and thresholds

## Sync Process

1. **Initial Load**
   - Load cached data from IndexedDB
   - Display offline indicator
   - Queue any pending changes

2. **Online Detection**
   - Monitor network status
   - Trigger background sync
   - Update UI status

3. **Sync Execution**
   - Process sync queue
   - Handle conflicts
   - Update local cache
   - Notify user of results

## Error Handling

### Network Errors
- Retry with exponential backoff
- Queue for later sync
- Notify user of status

### Storage Errors
- Fallback to memory cache
- Log errors for debugging
- Attempt recovery on next session

### Sync Errors
- Mark failed items
- Retry on next sync
- Allow manual retry

## Performance Considerations

### Cache Management
- Limit cache size
- Implement LRU eviction
- Compress stored data

### Memory Usage
- Batch large operations
- Clear unused data
- Monitor memory pressure

## Testing Offline Mode

1. Enable offline mode in browser dev tools
2. Test all core functionality
3. Verify data persistence
4. Check sync behavior
5. Test error handling

## Troubleshooting

### Common Issues

1. **Sync Not Working**
   - Check network status
   - Verify service worker
   - Clear cache and retry

2. **Data Not Persisting**
   - Check IndexedDB
   - Verify storage permissions
   - Monitor storage quota

3. **Performance Issues**
   - Clear old data
   - Optimize queries
   - Check memory usage

### Debug Tools

- Chrome DevTools Application tab
- Service Worker logs
- IndexedDB viewer
- Network panel

## Best Practices

1. **Data Management**
   - Keep data size minimal
   - Use efficient data structures
   - Implement proper indexing

2. **User Experience**
   - Clear offline indicators
   - Show sync progress
   - Provide manual sync option

3. **Error Recovery**
   - Graceful degradation
   - Clear error messages
   - Recovery procedures

## Security Considerations

1. **Data Protection**
   - Encrypt sensitive data
   - Secure local storage
   - Clear data on logout

2. **Access Control**
   - Verify permissions
   - Validate data
   - Audit changes

## Future Improvements

1. **Planned Features**
   - Multi-device sync
   - Better conflict resolution
   - Offline analytics

2. **Performance**
   - Compression
   - Better caching
   - Optimized sync

3. **User Experience**
   - Better offline UI
   - Sync progress details
   - Error recovery guides 