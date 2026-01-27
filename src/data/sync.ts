// Cloud sync via Netlify Blobs

const DEVICE_ID_KEY = 'workout_device_id';
const SYNC_DEBOUNCE_MS = 2000;

// Generate or retrieve persistent device ID
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// All the localStorage keys we want to sync
const SYNC_KEYS = [
  'workout_sessions',
  'saved_workouts',
  'rest_days',
  'custom_exercises',
  'workout_theme',
  'equipment_config',
];

// Get all syncable data
function getSyncData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  }
  data._syncedAt = new Date().toISOString();
  return data;
}

// Restore data from cloud
function restoreFromCloud(data: Record<string, unknown>): void {
  for (const key of SYNC_KEYS) {
    if (data[key] !== undefined) {
      const value = typeof data[key] === 'string'
        ? data[key]
        : JSON.stringify(data[key]);
      localStorage.setItem(key, value as string);
    }
  }
}

// Check if local data is empty (new device/cleared cache)
function isLocalDataEmpty(): boolean {
  const sessions = localStorage.getItem('workout_sessions');
  const workouts = localStorage.getItem('saved_workouts');
  return (!sessions || sessions === '[]') && (!workouts || workouts === '[]');
}

// Sync to cloud
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export async function syncToCloud(): Promise<boolean> {
  try {
    const response = await fetch('/.netlify/functions/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': getDeviceId(),
      },
      body: JSON.stringify({ data: getSyncData() }),
    });
    return response.ok;
  } catch {
    // Silently fail - sync is optional and shouldn't block the app
    return false;
  }
}

// Debounced sync - call this after any data change
export function scheduleSyncToCloud(): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    syncToCloud();
  }, SYNC_DEBOUNCE_MS);
}

// Load from cloud (called on app init)
export async function loadFromCloud(): Promise<boolean> {
  try {
    const response = await fetch('/.netlify/functions/sync', {
      method: 'GET',
      headers: {
        'x-device-id': getDeviceId(),
      },
    });

    if (!response.ok) return false;

    // Check if response is JSON (not HTML error page from local dev)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Silently fail in local dev where Netlify functions aren't available
      return false;
    }

    const result = await response.json();
    if (result.data) {
      // Only restore if local is empty (don't overwrite existing data)
      if (isLocalDataEmpty()) {
        restoreFromCloud(result.data);
        return true;
      }
    }
    return false;
  } catch {
    // Silently fail - sync is optional and shouldn't block the app
    return false;
  }
}

// Initialize sync - check cloud for existing data
export async function initSync(): Promise<void> {
  const restored = await loadFromCloud();
  if (restored) {
    console.log('Data restored from cloud backup');
    // Reload the page to pick up restored data
    window.location.reload();
  }
}
