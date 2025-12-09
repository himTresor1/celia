import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Calendar, MapPin, Users, Clock, FileText } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location_name: string;
  photo_urls: any;
  category_id: string;
  capacity_limit: number | null;
  is_public: boolean;
  status: string;
  host_id: string;
  created_at: string;
  event_categories: {
    name: string;
  } | null;
}

interface InvitationStats {
  total: number;
  going: number;
  pending: number;
  declined: number;
}

export default function EventsScreen() {
  const { user } = useAuth();

  // MOCK DATA - Events you created
  const mockEvents: Event[] = [
    {
      id: 'my-event-1',
      name: 'Tech Networking Mixer',
      description: 'Connect with fellow tech enthusiasts and entrepreneurs. Bring your business cards!',
      event_date: '2025-11-28',
      start_time: '6:00 PM',
      end_time: '9:00 PM',
      location_name: 'Innovation Hub, Building 7',
      photo_urls: ['https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg'],
      category_id: 'cat-1',
      capacity_limit: 50,
      is_public: false,
      status: 'active',
      host_id: user?.id || '',
      created_at: new Date().toISOString(),
      event_categories: { name: 'Networking' },
    },
    {
      id: 'my-event-2',
      name: 'Saturday Beach Volleyball',
      description: 'Casual volleyball game at the beach. All skill levels welcome!',
      event_date: '2025-11-30',
      start_time: '2:00 PM',
      end_time: '5:00 PM',
      location_name: 'Santa Monica Beach, Court 3',
      photo_urls: ['https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg'],
      category_id: 'cat-2',
      capacity_limit: 12,
      is_public: true,
      status: 'active',
      host_id: user?.id || '',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      event_categories: { name: 'Sports' },
    },
    {
      id: 'my-event-3',
      name: 'Friendsgiving Potluck',
      description: 'Early Thanksgiving celebration with friends. Bring your favorite dish to share!',
      event_date: '2025-11-27',
      start_time: '5:00 PM',
      end_time: '10:00 PM',
      location_name: '456 Elm Street, Apt 12',
      photo_urls: ['https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg'],
      category_id: 'cat-3',
      capacity_limit: 20,
      is_public: false,
      status: 'active',
      host_id: user?.id || '',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      event_categories: { name: 'Social' },
    },
  ];

  // MOCK INVITATION STATS - Who you invited and their responses
  const mockInvitationStats: Record<string, InvitationStats> = {
    'my-event-1': { total: 15, going: 8, pending: 5, declined: 2 },
    'my-event-2': { total: 10, going: 7, pending: 2, declined: 1 },
    'my-event-3': { total: 18, going: 12, pending: 4, declined: 2 },
  };

  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [invitationStats] = useState<Record<string, InvitationStats>>(mockInvitationStats);
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past' | 'drafts'>('upcoming');

  useEffect(() => {
    // Filter events based on tab
    const today = new Date().toISOString().split('T')[0];
    let filtered = [...mockEvents];

    if (tab === 'upcoming') {
      filtered = mockEvents.filter(e => e.status === 'active' && e.event_date >= today);
    } else if (tab === 'past') {
      filtered = mockEvents.filter(e => e.status === 'active' && e.event_date < today);
    } else if (tab === 'drafts') {
      filtered = mockEvents.filter(e => e.status === 'draft');
    }

    setEvents(filtered);
  }, [tab]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const coverPhoto = item.photo_urls?.[0] || null;
    const stats = invitationStats[item.id] || { total: 0, going: 0, pending: 0, declined: 0 };

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => router.push(`/event/${item.id}`)}
      >
        {coverPhoto && (
          <Image source={{ uri: coverPhoto }} style={styles.eventPhoto} />
        )}

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            {item.event_categories && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {item.event_categories.name}
                </Text>
              </View>
            )}
            {!item.is_public && (
              <View style={styles.privateBadge}>
                <Text style={styles.privateBadgeText}>Invite Only</Text>
              </View>
            )}
            {item.status === 'draft' && (
              <View style={styles.draftBadge}>
                <FileText size={12} color="#FF9500" />
                <Text style={styles.draftBadgeText}>Draft</Text>
              </View>
            )}
            {item.status === 'cancelled' && (
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledBadgeText}>Cancelled</Text>
              </View>
            )}
          </View>

          <Text style={styles.eventName}>{item.name}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(item.event_date)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Clock size={16} color="#666" />
              <Text style={styles.detailText}>
                {item.start_time}
                {item.end_time && ` - ${item.end_time}`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.location_name}
              </Text>
            </View>
          </View>

          {item.status !== 'draft' && (
            <View style={styles.rsvpStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.going}</Text>
                <Text style={styles.statLabel}>Going</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.declined}</Text>
                <Text style={styles.statLabel}>Declined</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === 'upcoming' && styles.tabActive]}
            onPress={() => setTab('upcoming')}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'upcoming' && styles.tabTextActive,
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'past' && styles.tabActive]}
            onPress={() => setTab('past')}
          >
            <Text
              style={[styles.tabText, tab === 'past' && styles.tabTextActive]}
            >
              Past
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'drafts' && styles.tabActive]}
            onPress={() => setTab('drafts')}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'drafts' && styles.tabTextActive,
              ]}
            >
              Drafts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={64} color="#ccc" />
          <Text style={styles.emptyText}>No events yet</Text>
          <Text style={styles.emptySubtext}>
            {tab === 'drafts'
              ? 'Draft events will appear here'
              : tab === 'past'
              ? 'Past events will appear here'
              : 'Create your first event to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tabActive: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  eventPhoto: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#3AFF6E',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  privateBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  privateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  draftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff5e6',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  draftBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  cancelledBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
  },
  cancelledBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  eventName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  rsvpStats: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
});
