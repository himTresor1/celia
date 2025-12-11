import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Alert, Modal } from 'react-native';
import { Bell, Check, X, Calendar, MapPin, Clock, AlertCircle, User as UserIcon } from 'lucide-react-native';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { Fonts } from '@/constants/theme';

interface Invitation {
  id: string;
  status: string;
  personal_message: string | null;
  responded_at: string | null;
  created_at: string;
  events: {
    id: string;
    name: string;
    description: string;
    event_date: string;
    start_time: string;
    location_name: string;
    photo_urls: any;
    host_id: string;
  };
  profiles: {
    id: string;
    full_name: string;
    photo_urls: any;
  };
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'pending' | 'going' | 'declined'>('pending');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchInvitations();
    }, [])
  );

  useEffect(() => {
    filterInvitations();
  }, [tab, invitations]);

  const fetchInvitations = async () => {
    // MOCK DATA - Replace database fetch with hardcoded invitations
    const mockInvitations: Invitation[] = [
      {
        id: 'inv-1',
        status: 'pending',
        personal_message: 'Hey! Would love to have you at my study session. Bring your notes!',
        responded_at: null,
        created_at: new Date().toISOString(),
        events: {
          id: 'event-1',
          name: 'CS Study Group',
          description: 'Final exam prep session',
          event_date: '2025-11-25',
          start_time: new Date('2025-11-25T18:00:00').toISOString(),
          location_name: 'Main Library, Room 204',
          photo_urls: ['https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg'],
          host_id: 'user-1',
        },
        profiles: {
          id: 'user-1',
          full_name: 'Sarah Johnson',
          photo_urls: ['https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'],
        },
      },
      {
        id: 'inv-2',
        status: 'pending',
        personal_message: 'Pizza party at my place! No studying allowed 🍕',
        responded_at: null,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        events: {
          id: 'event-2',
          name: 'Weekend Pizza Party',
          description: 'Chill hangout with great food and music',
          event_date: '2025-11-26',
          start_time: new Date('2025-11-26T19:00:00').toISOString(),
          location_name: '123 College Ave, Apt 4B',
          photo_urls: ['https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg'],
          host_id: 'user-2',
        },
        profiles: {
          id: 'user-2',
          full_name: 'Michael Chen',
          photo_urls: ['https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'],
        },
      },
      {
        id: 'inv-3',
        status: 'going',
        personal_message: null,
        responded_at: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 259200000).toISOString(),
        events: {
          id: 'event-3',
          name: 'Campus Coffee Meetup',
          description: 'Casual networking over coffee',
          event_date: '2025-11-24',
          start_time: new Date('2025-11-24T10:00:00').toISOString(),
          location_name: 'Starbucks on Main St',
          photo_urls: ['https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg'],
          host_id: 'user-3',
        },
        profiles: {
          id: 'user-3',
          full_name: 'Emily Davis',
          photo_urls: ['https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'],
        },
      },
      {
        id: 'inv-4',
        status: 'declined',
        personal_message: 'Join us for game night!',
        responded_at: new Date(Date.now() - 432000000).toISOString(),
        created_at: new Date(Date.now() - 518400000).toISOString(),
        events: {
          id: 'event-4',
          name: 'Board Game Night',
          description: 'Settlers of Catan tournament',
          event_date: '2025-11-20',
          start_time: new Date('2025-11-20T20:00:00').toISOString(),
          location_name: 'Student Center Game Room',
          photo_urls: ['https://images.pexels.com/photos/776654/pexels-photo-776654.jpeg'],
          host_id: 'user-4',
        },
        profiles: {
          id: 'user-4',
          full_name: 'James Wilson',
          photo_urls: ['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'],
        },
      },
    ];

    setInvitations(mockInvitations);
    setLoading(false);
    setRefreshing(false);

    /* OLD DATABASE CODE - COMMENTED OUT
    const { data, error } = await supabase
      .from('event_invitations')
      .select(`
        *,
        events:event_id (
          id,
          name,
          description,
          event_date,
          start_time,
          location_name,
          photo_urls,
          host_id
        ),
        profiles:inviter_id (
          id,
          full_name,
          photo_urls
        )
      `)
      .eq('invitee_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
    } else {
      const formattedData = data?.map((inv: any) => ({
        ...inv,
        profiles: inv.profiles || { id: inv.inviter_id, full_name: 'Unknown', photo_urls: null },
      })) || [];
      setInvitations(formattedData);
    }

    */
  };

  const filterInvitations = () => {
    const filtered = invitations.filter((inv) => inv.status === tab);
    setFilteredInvitations(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvitations();
  };

  const handleAccept = async (invitationId: string) => {
    const { error } = await supabase
      .from('event_invitations')
      .update({
        status: 'going',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', "You're going! 🎉");
      fetchInvitations();
    }
  };

  const handleDeclineStart = (invitationId: string) => {
    setSelectedInvitation(invitationId);
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedInvitation) return;

    const { error } = await supabase
      .from('event_invitations')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString(),
      })
      .eq('id', selectedInvitation);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Declined', 'You declined the invitation.');
      setShowDeclineModal(false);
      setSelectedInvitation(null);
      setDeclineReason(null);
      fetchInvitations();
    }
  };

  const handleChangeRSVP = async (invitationId: string) => {
    Alert.alert(
      'Change RSVP',
      "Change to 'Can't Go'?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('event_invitations')
              .update({
                status: 'declined',
                responded_at: new Date().toISOString(),
              })
              .eq('id', invitationId);

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Updated', 'Your RSVP has been changed.');
              fetchInvitations();
            }
          },
        },
      ]
    );
  };

  const renderInvitation = ({ item }: { item: Invitation }) => {
    const coverPhoto = item.events.photo_urls?.[0] || null;
    const hostPhoto = item.profiles.photo_urls?.[0] || null;

    return (
      <TouchableOpacity
        style={styles.invitationCard}
        onPress={() => router.push(`/invitation/${item.id}`)}
        activeOpacity={0.7}
      >
        {coverPhoto && (
          <Image source={{ uri: coverPhoto }} style={styles.eventPhoto} />
        )}

        <View style={styles.cardContent}>
          <View style={styles.hostRow}>
            {hostPhoto ? (
              <Image source={{ uri: hostPhoto }} style={styles.hostPhoto} />
            ) : (
              <View style={styles.hostPhotoPlaceholder}>
                <UserIcon size={16} color="#666" />
              </View>
            )}
            <Text style={styles.hostText}>
              {item.profiles.full_name} invited you
            </Text>
          </View>

          <Text style={styles.eventName}>{item.events.name}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Calendar size={14} color="#666" />
              <Text style={styles.detailText}>{item.events.event_date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={14} color="#666" />
              <Text style={styles.detailText}>{item.events.start_time}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.events.location_name}
              </Text>
            </View>
          </View>

          {item.personal_message && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText} numberOfLines={2}>
                "{item.personal_message}"
              </Text>
            </View>
          )}

          {item.status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item.id)}
              >
                <Check size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDeclineStart(item.id)}
              >
                <X size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'going' && (
            <TouchableOpacity
              style={styles.changeRSVPButton}
              onPress={() => handleChangeRSVP(item.id)}
            >
              <Text style={styles.changeRSVPText}>Change RSVP</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const pendingCount = invitations.filter((i) => i.status === 'pending').length;
  const goingCount = invitations.filter((i) => i.status === 'going').length;
  const declinedCount = invitations.filter((i) => i.status === 'declined').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Invitations</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === 'pending' && styles.tabActive]}
            onPress={() => setTab('pending')}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'pending' && styles.tabTextActive,
              ]}
            >
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'going' && styles.tabActive]}
            onPress={() => setTab('going')}
          >
            <Text
              style={[styles.tabText, tab === 'going' && styles.tabTextActive]}
            >
              Going {goingCount > 0 && `(${goingCount})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'declined' && styles.tabActive]}
            onPress={() => setTab('declined')}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'declined' && styles.tabTextActive,
              ]}
            >
              Declined {declinedCount > 0 && `(${declinedCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredInvitations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={64} color="#ccc" />
          <Text style={styles.emptyText}>No invitations</Text>
          <Text style={styles.emptySubtext}>
            {tab === 'pending'
              ? "You'll see new event invitations here"
              : tab === 'going'
              ? 'Events you accepted will appear here'
              : 'Declined invitations will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredInvitations}
          renderItem={renderInvitation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Modal
        visible={showDeclineModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeclineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Decline Invitation</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to decline?</Text>

            <View style={styles.reasonOptions}>
              <Text style={styles.reasonLabel}>Reason (optional):</Text>
              <TouchableOpacity
                style={[
                  styles.reasonOption,
                  declineReason === 'schedule' && styles.reasonOptionActive,
                ]}
                onPress={() => setDeclineReason('schedule')}
              >
                <Text
                  style={[
                    styles.reasonText,
                    declineReason === 'schedule' && styles.reasonTextActive,
                  ]}
                >
                  Schedule conflict
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reasonOption,
                  declineReason === 'not_interested' && styles.reasonOptionActive,
                ]}
                onPress={() => setDeclineReason('not_interested')}
              >
                <Text
                  style={[
                    styles.reasonText,
                    declineReason === 'not_interested' && styles.reasonTextActive,
                  ]}
                >
                  Not interested
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.reasonOption,
                  declineReason === 'too_far' && styles.reasonOptionActive,
                ]}
                onPress={() => setDeclineReason('too_far')}
              >
                <Text
                  style={[
                    styles.reasonText,
                    declineReason === 'too_far' && styles.reasonTextActive,
                  ]}
                >
                  Too far
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDeclineModal(false);
                  setSelectedInvitation(null);
                  setDeclineReason(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleDeclineConfirm}
              >
                <Text style={styles.modalConfirmButtonText}>Decline</Text>
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
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.bold,
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
    fontFamily: Fonts.regular,
    color: '#666',
  },
  tabTextActive: {
    fontFamily: Fonts.medium,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  invitationCard: {
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
  cardContent: {
    padding: 16,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  hostPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  hostPhotoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#666',
  },
  eventName: {
    fontSize: 20,
    fontFamily: Fonts.bold,
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
    fontFamily: Fonts.regular,
    color: '#666',
    flex: 1,
  },
  messageBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: '#fff',
  },
  changeRSVPButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    alignItems: 'center',
  },
  changeRSVPText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
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
    fontFamily: Fonts.bold,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#666',
    marginBottom: 24,
  },
  reasonOptions: {
    marginBottom: 24,
  },
  reasonLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  reasonOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  reasonOptionActive: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  reasonText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: '#666',
  },
  reasonTextActive: {
    fontFamily: Fonts.medium,
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
    fontFamily: Fonts.medium,
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
    fontFamily: Fonts.medium,
    color: '#fff',
  },
});
