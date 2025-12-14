import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import {
  Bell,
  Check,
  X,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react-native';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { Fonts } from '@/constants/theme';

interface Invitation {
  id: string;
  status: string;
  personalMessage: string | null;
  respondedAt: string | null;
  createdAt: string;
  event: {
    id: string;
    name: string;
    description: string;
    eventDate: string;
    startTime: string;
    locationName: string;
    photoUrls: string[];
    hostId: string;
  };
  inviter: {
    id: string;
    fullName: string;
    photoUrls: string[];
  };
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'pending' | 'going' | 'declined'>('pending');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<string | null>(
    null
  );
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
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getInvitations(user.id);
      setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      Alert.alert('Error', 'Failed to load invitations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterInvitations = () => {
    const statusMap: Record<typeof tab, string> = {
      pending: 'pending',
      going: 'going', // Backend uses 'going' for accepted
      declined: 'rejected',
    };
    const filtered = invitations.filter((inv) => inv.status === statusMap[tab]);
    setFilteredInvitations(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvitations();
  };

  const handleAccept = async (invitationId: string) => {
    try {
      await api.respondToInvitation(invitationId, 'accepted');
      Alert.alert('Success', "You're going! 🎉");
      fetchInvitations();
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to accept invitation'
      );
    }
  };

  const handleDeclineStart = (invitationId: string) => {
    setSelectedInvitation(invitationId);
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedInvitation) return;

    try {
      await api.respondToInvitation(selectedInvitation, 'rejected');
      Alert.alert('Declined', 'You declined the invitation.');
      setShowDeclineModal(false);
      setSelectedInvitation(null);
      setDeclineReason(null);
      fetchInvitations();
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to decline invitation'
      );
    }
  };

  const handleChangeRSVP = async (invitationId: string) => {
    Alert.alert('Change RSVP', "Change to 'Can't Go'?", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.respondToInvitation(invitationId, 'rejected');
            Alert.alert('Updated', 'Your RSVP has been changed.');
            fetchInvitations();
          } catch (error: any) {
            console.error('Error changing RSVP:', error);
            Alert.alert(
              'Error',
              error.response?.data?.message || 'Failed to change RSVP'
            );
          }
        },
      },
    ]);
  };

  const renderInvitation = ({ item }: { item: Invitation }) => {
    const coverPhoto = item.event.photoUrls?.[0] || null;
    const hostPhoto = item.inviter.photoUrls?.[0] || null;

    return (
      <TouchableOpacity
        style={styles.invitationCard}
        onPress={() => router.push(`/event/${item.event.id}`)}
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
              {item.inviter.fullName} invited you
            </Text>
          </View>

          <Text style={styles.eventName}>{item.event.name}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Calendar size={14} color="#666" />
              <Text style={styles.detailText}>{item.event.eventDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={14} color="#666" />
              <Text style={styles.detailText}>{item.event.startTime}</Text>
            </View>
            <View style={styles.detailRow}>
              <MapPin size={14} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.event.locationName}
              </Text>
            </View>
          </View>

          {item.personalMessage && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText} numberOfLines={2}>
                "{item.personalMessage}"
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
  const declinedCount = invitations.filter(
    (i) => i.status === 'rejected'
  ).length;

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
            <Text style={styles.modalSubtitle}>
              Are you sure you want to decline?
            </Text>

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
                  declineReason === 'not_interested' &&
                    styles.reasonOptionActive,
                ]}
                onPress={() => setDeclineReason('not_interested')}
              >
                <Text
                  style={[
                    styles.reasonText,
                    declineReason === 'not_interested' &&
                      styles.reasonTextActive,
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
