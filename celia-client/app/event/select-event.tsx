import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  start_time: string;
  location_name: string;
  photo_urls: any;
  event_categories: {
    name: string;
  } | null;
}

export default function SelectEventScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock events - in production, fetch from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    // Mock data - replace with actual API call
    const mockEvents: Event[] = [
      {
        id: 'event-1',
        name: 'Tech Networking Mixer',
        description: 'Connect with fellow tech enthusiasts',
        event_date: '2025-11-28',
        start_time: '6:00 PM',
        location_name: 'Innovation Hub',
        photo_urls: [
          'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg',
        ],
        event_categories: { name: 'Networking' },
      },
      {
        id: 'event-2',
        name: 'Saturday Beach Volleyball',
        description: 'Casual volleyball game at the beach',
        event_date: '2025-11-30',
        start_time: '2:00 PM',
        location_name: 'Santa Monica Beach',
        photo_urls: [
          'https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg',
        ],
        event_categories: { name: 'Sports' },
      },
      {
        id: 'event-3',
        name: 'Friendsgiving Potluck',
        description: 'Early Thanksgiving celebration with friends',
        event_date: '2025-11-27',
        start_time: '5:00 PM',
        location_name: '456 Elm Street',
        photo_urls: [
          'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg',
        ],
        event_categories: { name: 'Social' },
      },
    ];
    setEvents(mockEvents);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchEvents();
      setRefreshing(false);
    }, 1000);
  };

  const handleSelectEvent = (eventId: string) => {
    router.push({
      pathname: '/event/filter-questions',
      params: { eventId },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const coverPhoto = item.photo_urls?.[0] || null;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleSelectEvent(item.id)}
        activeOpacity={0.8}
      >
        {coverPhoto && (
          <Image source={{ uri: coverPhoto }} style={styles.eventImage} />
        )}
        <View style={styles.eventOverlay} />
        <View style={styles.eventContent}>
          {item.event_categories && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {item.event_categories.name}
              </Text>
            </View>
          )}
          <Text style={styles.eventName}>{item.name}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Calendar size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.detailText}>
                {formatDate(item.event_date)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.detailText}>{item.start_time}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.location_name}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Select an Event</Text>
          <Text style={styles.subtitle}>Choose an event to find matches</Text>
        </View>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={64} color={Colors.textLight} />
          <Text style={styles.emptyText}>No events available</Text>
          <Text style={styles.emptySubtext}>
            Create an event to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eventCard: {
    width: '48%',
    height: 240,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  eventContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  eventDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
