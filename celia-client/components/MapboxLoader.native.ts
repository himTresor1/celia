import * as MapboxModule from '@rnmapbox/maps';

console.log('[Mapbox] Native module loaded');
console.log('[Mapbox] Module exports:', Object.keys(MapboxModule).join(', '));

// Check if required components are available
const hasRequiredExports = [
  'MapView',
  'Camera',
  'PointAnnotation',
  'setAccessToken'
].every(exportName => exportName in MapboxModule);

if (!hasRequiredExports) {
  console.error('[Mapbox] Missing required exports. Available exports:', Object.keys(MapboxModule));
}

// Create a wrapper with better error handling
export const Mapbox = {
  ...MapboxModule,
  setAccessToken: (token: string) => {
    try {
      console.log('[Mapbox] Setting access token...');
      if ('default' in MapboxModule && MapboxModule.default && typeof MapboxModule.default.setAccessToken === 'function') {
        console.log('[Mapbox] Using default export for setAccessToken');
        MapboxModule.default.setAccessToken(token);
      } else if (typeof MapboxModule.setAccessToken === 'function') {
        console.log('[Mapbox] Using direct setAccessToken');
        MapboxModule.setAccessToken(token);
      } else {
        console.error('[Mapbox] Could not find setAccessToken function');
      }
      console.log('[Mapbox] Access token set successfully');
    } catch (error) {
      console.error('[Mapbox] Error setting access token:', error);
    }
  }
};

// Export components with null checks
export const Camera = MapboxModule.Camera || (() => {
  console.error('[Mapbox] Camera component not found in @rnmapbox/maps');
  return null;
})();

export const PointAnnotation = MapboxModule.PointAnnotation || (() => {
  console.error('[Mapbox] PointAnnotation component not found in @rnmapbox/maps');
  return null;
})();

// Log SDK version if available
if ('SDKVersion' in MapboxModule) {
  console.log(`[Mapbox] SDK Version: ${MapboxModule.SDKVersion}`);
}

