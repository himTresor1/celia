import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronLeft,
  Edit,
  Trash2,
  User as UserIcon,
  Calendar,
  MapPin,
  Clock,
  Users,
  Heart,
  Check,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { formatDate, formatTime, formatTimeRange } from '@/lib/timeUtils';

interface Event {
  id: string;
  name: string;
  description: string;
  eventDate?: string;
  event_date?: string;
  startTime?: string;
  start_time?: string;
  endTime?: string | null;
  end_time?: string | null;
  locationName?: string;
  location_name?: string;
  photoUrls?: any;
  photo_urls?: any;
  interestTags?: string[];
  interest_tags?: string[];
  capacityLimit?: number | null;
  capacity_limit?: number | null;
  isPublic?: boolean;
  is_public?: boolean;
  status: string;
  cancellationReason?: string | null;
  cancellation_reason?: string | null;
  hostId?: string;
  host_id?: string;
  host?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    email?: string;
    collegeName?: string;
    major?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
  event_categories?: {
    name: string;
  } | null;
  invitations?: Invitation[];
  attendees?: Array<{
    id: string;
    userId: string;
    joinedAt: string;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string;
      collegeName?: string;
      major?: string;
    };
  }>;
}

interface Invitation {
  id: string;
  status: string;
  personalMessage?: string | null;
  personal_message?: string | null;
  respondedAt?: string | null;
  responded_at?: string | null;
  createdAt?: string;
  created_at?: string;
  inviteeId?: string;
  invitee?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    collegeName?: string;
    major?: string;
  };
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    photo_urls: any;
  };
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestFilter, setGuestFilter] = useState<'all' | 'going' | 'pending' | 'declined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');
  const [cancellationMessage, setCancellationMessage] = useState('');

  useEffect(() => {
    fetchEventDetails();
    fetchInvitations();
  }, []);

  useEffect(() => {
    filterInvitations();
  }, [guestFilter, searchQuery, invitations]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.getEvent(id);
      // Backend returns { message, data } structure
      const data = response.data || response;
      setEvent(data as any);
      
      // If invitations are included in the event response, use them
      if (data.invitations && Array.isArray(data.invitations)) {
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    }
    setLoading(false);
  };

  const fetchInvitations = async () => {
    try {
      const response = await api.getEventInvitations(id);
      // Backend returns { message, data } structure
      const data = response.data || response;
      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const filterInvitations = () => {
    let filtered = [...invitations];

    if (guestFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === guestFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((inv) => {
        const invitee = inv.invitee || inv.profiles;
        if (!invitee) return false;
        // Handle both camelCase and snake_case structures
        const name = ('fullName' in invitee ? invitee.fullName : (invitee as any).full_name) || '';
        const email = ('email' in invitee ? (invitee as any).email : '') || '';
        return name.toLowerCase().includes(query) || 
               email.toLowerCase().includes(query);
      });
    }

    setFilteredInvitations(filtered);
  };

  const handleRemoveGuest = async (invitationId: string, guestName: string) => {
    Alert.alert(
      'Remove Guest',
      `Are you sure you want to remove ${guestName} from this event?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteInvitation(invitationId);
              fetchInvitations();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove guest');
            }
          },
        },
      ]
    );
  };

  const handleCancelEvent = async () => {
    if (!cancellationReasonInput.trim()) {
      Alert.alert('Error', 'Please provide a cancellation reason');
      return;
    }

    try {
      await api.updateEvent(id, {
        status: 'cancelled',
        cancellationReason: cancellationReasonInput.trim(),
      });
      setShowCancelModal(false);
      fetchEventDetails();
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to cancel event');
    }
  };

  if (loading || !event) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Handle both camelCase and snake_case field names
  const coverPhoto = event.photoUrls?.[0] || event.photo_urls?.[0] || null;
  const eventDate = event.eventDate || event.event_date;
  const startTime = event.startTime || event.start_time;
  const endTime = event.endTime || event.end_time;
  const locationName = event.locationName || event.location_name;
  const interestTags = event.interestTags || event.interest_tags || [];
  const capacityLimit = event.capacityLimit || event.capacity_limit;
  const isPublic = event.isPublic !== undefined ? event.isPublic : event.is_public;
  const eventCancellationReason = event.cancellationReason || event.cancellation_reason;
  const hostId = event.hostId || event.host_id;
  const category = event.category || event.event_categories;
  
  const isHost = hostId === user?.id;
  const goingCount = invitations.filter((i) => i.status === 'going').length;
  const pendingCount = invitations.filter((i) => i.status === 'pending').length;
  const declinedCount = invitations.filter((i) => i.status === 'declined').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#3AFF6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {coverPhoto && (
          <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
        )}

        <View style={styles.eventInfo}>
          <View style={styles.eventHeader}>
            {category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {category.name}
                </Text>
              </View>
            )}
            {!isPublic && (
              <View style={styles.privateBadge}>
                <Text style={styles.privateBadgeText}>Invite Only</Text>
              </View>
            )}
            {event.status === 'cancelled' && (
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledBadgeText}>Cancelled</Text>
              </View>
            )}
          </View>

          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#3AFF6E" />
              <Text style={styles.detailText}>{formatDate(eventDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#3AFF6E" />
              <Text style={styles.detailText}>
                {formatTimeRange(startTime, endTime)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={20} color="#3AFF6E" />
              <Text style={styles.detailText}>{locationName}</Text>
            </View>
            {capacityLimit && (
              <View style={styles.detailRow}>
                <Users size={20} color="#3AFF6E" />
                <Text style={styles.detailText}>
                  Capacity: {capacityLimit}
                </Text>
              </View>
            )}
          </View>

          {interestTags && interestTags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interest Tags</Text>
              <View style={styles.interestsGrid}>
                {interestTags.map((tag, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Heart size={12} color="#3AFF6E" fill="#3AFF6E" />
                    <Text style={styles.interestTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {event.status === 'cancelled' && eventCancellationReason && (
            <View style={styles.cancellationCard}>
              <View style={styles.cancellationHeader}>
                <AlertCircle size={20} color="#FF3B30" />
                <Text style={styles.cancellationTitle}>Event Cancelled</Text>
              </View>
              <Text style={styles.cancellationReason}>
                {eventCancellationReason}
              </Text>
            </View>
          )}

          {isHost && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Guest List</Text>
                <Text style={styles.guestCount}>
                  {invitations.length} {invitations.length === 1 ? 'guest' : 'guests'}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{goingCount}</Text>
                  <Text style={styles.statLabel}>Going</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{pendingCount}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{declinedCount}</Text>
                  <Text style={styles.statLabel}>Declined</Text>
                </View>
              </View>

              <View style={styles.guestFilters}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    guestFilter === 'all' && styles.filterChipActive,
                  ]}
                  onPress={() => setGuestFilter('all')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      guestFilter === 'all' && styles.filterChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    guestFilter === 'going' && styles.filterChipActive,
                  ]}
                  onPress={() => setGuestFilter('going')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      guestFilter === 'going' && styles.filterChipTextActive,
                    ]}
                  >
                    Going
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    guestFilter === 'pending' && styles.filterChipActive,
                  ]}
                  onPress={() => setGuestFilter('pending')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      guestFilter === 'pending' && styles.filterChipTextActive,
                    ]}
                  >
                    Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    guestFilter === 'declined' && styles.filterChipActive,
                  ]}
                  onPress={() => setGuestFilter('declined')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      guestFilter === 'declined' && styles.filterChipTextActive,
                    ]}
                  >
                    Declined
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder="Search guests..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {filteredInvitations.map((invitation) => {
                // Handle both invitee and profiles structures
                const invitee = invitation.invitee || invitation.profiles;
                if (!invitee) return null;
                
                const photoUrl = 'avatarUrl' in invitee 
                  ? invitee.avatarUrl 
                  : ('photo_urls' in invitee ? invitee.photo_urls?.[0] : null);
                const fullName = 'fullName' in invitee 
                  ? invitee.fullName 
                  : ('full_name' in invitee ? invitee.full_name : 'Unknown');
                const statusIcon =
                  invitation.status === 'going' ? (
                    <Check size={16} color="#34C759" />
                  ) : invitation.status === 'declined' ? (
                    <X size={16} color="#FF3B30" />
                  ) : (
                    <Clock size={16} color="#FF9500" />
                  );

                return (
                  <View key={invitation.id} style={styles.guestItem}>
                    {photoUrl ? (
                      <Image
                        source={{ uri: photoUrl }}
                        style={styles.guestPhoto}
                      />
                    ) : (
                      <View style={styles.guestPhotoPlaceholder}>
                        <UserIcon size={20} color="#666" />
                      </View>
                    )}

                    <View style={styles.guestInfo}>
                      <Text style={styles.guestName}>
                        {fullName}
                      </Text>
                      <View style={styles.guestStatus}>
                        {statusIcon}
                        <Text style={styles.guestStatusText}>
                          {invitation.status.charAt(0).toUpperCase() +
                            invitation.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    {event.status !== 'cancelled' && (
                      <TouchableOpacity
                        onPress={() =>
                          handleRemoveGuest(
                            invitation.id,
                            fullName
                          )
                        }
                        style={styles.removeGuestButton}
                      >
                        <Trash2 size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {filteredInvitations.length === 0 && (
                <Text style={styles.noGuestsText}>No guests found</Text>
              )}
            </View>
          )}

          {isHost && event.status !== 'cancelled' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}
            >
              <AlertCircle size={20} color="#FF3B30" />
              <Text style={styles.cancelButtonText}>Cancel Event</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showCancelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Event</Text>
            <Text style={styles.modalSubtitle}>
              This action cannot be undone. All guests will be notified.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Cancellation Reason *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Why are you cancelling?"
                value={cancellationReasonInput}
                onChangeText={setCancellationReasonInput}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>
                Optional Message to Guests
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Add a message..."
                value={cancellationMessage}
                onChangeText={setCancellationMessage}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCancelEvent}
              >
                <Text style={styles.modalConfirmButtonText}>
                  Confirm Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  coverPhoto: {
    width: '100%',
    height: 240,
  },
  eventInfo: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#3AFF6E',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  privateBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#666',
  },
  privateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  cancelledBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  cancelledBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  eventName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  guestCount: {
    fontSize: 14,
    color: '#666',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#e8f4ff',
  },
  interestTagText: {
    fontSize: 14,
    color: '#3AFF6E',
    fontWeight: '500',
  },
  cancellationCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffe0e0',
    marginBottom: 20,
  },
  cancellationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cancellationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  cancellationReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  guestFilters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 8,
  },
  guestPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  guestPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  guestStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guestStatusText: {
    fontSize: 14,
    color: '#666',
  },
  removeGuestButton: {
    padding: 8,
  },
  noGuestsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    paddingVertical: 24,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF3B30',
    backgroundColor: '#fff',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
