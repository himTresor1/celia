// This file is only loaded on native platforms (iOS/Android)
// Metro will not process this file on web, avoiding CSS import issues

import MapboxModule from '@rnmapbox/maps';

export const Mapbox = MapboxModule.default || MapboxModule;
export const Camera = MapboxModule.Camera;
export const PointAnnotation = MapboxModule.PointAnnotation;

