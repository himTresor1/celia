import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Calendar, MapPin, Users, Clock, FileText } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { formatDate, formatTimeRange } from '@/lib/timeUtils';

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

  const [events, setEvents] = useState<Event[]>([]);
  const [invitationStats, setInvitationStats] = useState<
    Record<string, InvitationStats>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past' | 'drafts'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [tab]);

  const fetchEvents = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await api.getMyEvents();
      
      console.log('[EventsScreen] Fetched events data:', data);
      console.log('[EventsScreen] Data type:', typeof data, 'Is array:', Array.isArray(data));

      if (!Array.isArray(data)) {
        console.error('[EventsScreen] Expected array but got:', data);
        setEvents([]);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let filtered = data;

      if (tab === 'upcoming') {
        filtered = data.filter((e: any) => {
          const eventDate = e.eventDate || e.event_date;
          if (!eventDate) return false;
          const eventDateObj = new Date(eventDate);
          eventDateObj.setHours(0, 0, 0, 0);
          return e.status === 'active' && eventDateObj >= today;
        });
      } else if (tab === 'past') {
        filtered = data.filter((e: any) => {
          const eventDate = e.eventDate || e.event_date;
          if (!eventDate) return false;
          const eventDateObj = new Date(eventDate);
          eventDateObj.setHours(0, 0, 0, 0);
          return e.status === 'active' && eventDateObj < today;
        });
      } else if (tab === 'drafts') {
        filtered = data.filter((e: any) => e.status === 'draft');
      }

      console.log('[EventsScreen] Filtered events for tab', tab, ':', filtered.length);
      setEvents(filtered as any);

      const statsMap: Record<string, InvitationStats> = {};
      for (const event of filtered) {
        try {
          const invitations = await api.getEventInvitations(event.id);
          statsMap[event.id] = {
            total: invitations.length,
            going: invitations.filter((i: any) => i.status === 'going').length,
            pending: invitations.filter((i: any) => i.status === 'pending')
              .length,
            declined: invitations.filter((i: any) => i.status === 'declined')
              .length,
          };
        } catch (error) {
          statsMap[event.id] = { total: 0, going: 0, pending: 0, declined: 0 };
        }
      }
      setInvitationStats(statsMap);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };


  const renderEvent = ({ item }: { item: any }) => {
    const coverPhoto = item.photoUrls?.[0] || null;
    const stats = invitationStats[item.id] || {
      total: 0,
      going: 0,
      pending: 0,
      declined: 0,
    };

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
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {item.category.name}
                </Text>
              </View>
            )}
            {!item.isPublic && (
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
                {formatDate(item.eventDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Clock size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatTimeRange(item.startTime, item.endTime)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.locationName}
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
              style={[styles.tabText, tab === 'drafts' && styles.tabTextActive]}
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
