import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { MapPin, Search, X, Navigation } from 'lucide-react-native';
import axios from 'axios';

// Import Mapbox using platform-specific files
// Metro will automatically use .native.ts on iOS/Android and .web.ts on web
import { Mapbox, Camera, PointAnnotation } from './MapboxLoader';

// Initialize Mapbox with access token
// Priority: EXPO_PUBLIC env var > app.json extra config > fallback token
const MAPBOX_ACCESS_TOKEN = 
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 
  Constants.expoConfig?.extra?.mapboxAccessToken || 
  'sk.eyJ1IjoiZWxvaW1hbiIsImEiOiJjbWplbTZkYTIwaTljM2NzbHF2NW11c28xIn0.mNYoYxigf376xbgpFk9oew';

// Initialize Mapbox only on native platforms
if (Platform.OS !== 'web' && Mapbox && typeof Mapbox.setAccessToken === 'function') {
  if (MAPBOX_ACCESS_TOKEN) {
    Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
  } else {
    console.warn('Mapbox access token not found. Please set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env file.');
  }
}

export interface SelectedLocation {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  placeId?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: SelectedLocation) => void;
  initialLocation?: SelectedLocation | null;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeName?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  // Show error message on web platform
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webNotSupported}>
          <MapPin size={48} color="#999" />
          <Text style={styles.webNotSupportedText}>
            Map selection is not available on web.{'\n'}
            Please use the mobile app to select a location.
          </Text>
        </View>
      </View>
    );
  }

  // Show error if Mapbox is not available (on native platforms)
  if (Platform.OS !== 'web' && (!Mapbox || !Camera || !PointAnnotation)) {
    return (
      <View style={styles.container}>
        <View style={styles.webNotSupported}>
          <MapPin size={48} color="#999" />
          <Text style={styles.webNotSupportedText}>
            Mapbox is not available.{'\n'}
            Please ensure @rnmapbox/maps is properly installed.
          </Text>
        </View>
      </View>
    );
  }
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(
    initialLocation || null
  );
  const [mapRegion, setMapRegion] = useState({
    center: initialLocation
      ? [initialLocation.longitude, initialLocation.latitude]
      : [-122.4194, 37.7749], // Default to San Francisco
    zoom: 14,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const cameraRef = useRef<Camera>(null);

  // Search for locations using Mapbox Geocoding API
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            limit: 5,
            types: 'poi,address,place',
          },
        }
      );

      const results: SearchResult[] = response.data.features.map(
        (feature: any, index: number) => ({
          id: feature.id || `result-${index}`,
          name: feature.text || feature.place_name?.split(',')[0] || 'Unknown',
          address: feature.place_name || feature.text || '',
          latitude: feature.center[1],
          longitude: feature.center[0],
          placeName: feature.place_name,
        })
      );

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error: any) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Failed to search locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            limit: 1,
          },
        }
      );

      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          name: feature.text || feature.place_name?.split(',')[0] || 'Selected Location',
          address: feature.place_name || feature.text || '',
          latitude,
          longitude,
          placeId: feature.id,
        };
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }

    return {
      name: 'Selected Location',
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      latitude,
      longitude,
    };
  };

  // Handle map press to select location
  const handleMapPress = async (feature: any) => {
    const coordinates = feature.geometry.coordinates;
    const longitude = coordinates[0];
    const latitude = coordinates[1];

    setIsLoadingLocation(true);
    const location = await reverseGeocode(latitude, longitude);
    setSelectedLocation(location);
    setMapRegion({
      center: [longitude, latitude],
      zoom: mapRegion.zoom,
    });
    setIsLoadingLocation(false);
  };

  // Handle search result selection
  const handleSearchResultSelect = async (result: SearchResult) => {
    setSearchQuery(result.name);
    setShowSearchResults(false);
    Keyboard.dismiss();

    const location: SelectedLocation = {
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      address: result.address,
    };

    setSelectedLocation(location);
    setMapRegion({
      center: [result.longitude, result.latitude],
      zoom: 16,
    });

    // Animate camera to selected location
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [result.longitude, result.latitude],
        zoomLevel: 16,
        animationDuration: 1000,
      });
    }
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use your current location.'
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const locationData = await reverseGeocode(latitude, longitude);

      setSelectedLocation(locationData);
      setMapRegion({
        center: [longitude, latitude],
        zoom: 16,
      });

      // Animate camera to current location
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 16,
          animationDuration: 1000,
        });
      }
    } catch (error: any) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle region change (when user pans/zooms)
  const handleRegionDidChange = async () => {
    if (cameraRef.current) {
      // Get center coordinates from camera
      // Note: This is a simplified approach - in production you might want to track region changes differently
    }
  };

  // Confirm location selection
  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else {
      Alert.alert('No Location Selected', 'Please select a location on the map or search for one.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim()) {
                setShowSearchResults(true);
              }
            }}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowSearchResults(true);
              }
            }}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#3AFF6E" style={styles.searchLoader} />
          )}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
            >
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultSelect(item)}
                >
                  <MapPin size={16} color="#3AFF6E" />
                  <View style={styles.searchResultText}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.searchResultsList}
            />
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {Mapbox && (
          <Mapbox.MapView
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
            onPress={handleMapPress}
          >
            {Camera && (
              <Camera
                ref={cameraRef}
                defaultSettings={{
                  centerCoordinate: mapRegion.center as [number, number],
                  zoomLevel: mapRegion.zoom,
                }}
                onRegionDidChange={handleRegionDidChange}
              />
            )}

            {/* Selected Location Marker */}
            {selectedLocation && PointAnnotation && (
              <PointAnnotation
                id="selected-location"
                coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker}>
                    <MapPin size={24} color="#fff" fill="#fff" />
                  </View>
                </View>
              </PointAnnotation>
            )}
          </Mapbox.MapView>
        )}

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#3AFF6E" />
          ) : (
            <Navigation size={20} color="#3AFF6E" />
          )}
        </TouchableOpacity>
      </View>

      {/* Selected Location Info */}
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <View style={styles.locationInfoContent}>
            <MapPin size={16} color="#3AFF6E" />
            <View style={styles.locationInfoText}>
              <Text style={styles.locationName} numberOfLines={1}>
                {selectedLocation.name}
              </Text>
              {selectedLocation.address && (
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {selectedLocation.address}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {!selectedLocation && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Tap on the map or search to select a location
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 12,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3AFF6E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationInfoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInfoText: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#3AFF6E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  webNotSupported: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
  },
  webNotSupportedText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

