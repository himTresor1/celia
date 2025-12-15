import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Mail, Send } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';

interface SendInvitationModalProps {
  visible: boolean;
  onClose: () => void;
  selectedUserIds: string[];
  onSuccess?: () => void;
}

export default function SendInvitationModal({
  visible,
  onClose,
  selectedUserIds,
  onSuccess,
}: SendInvitationModalProps) {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (visible && selectedUserIds.length > 0) {
      loadMyEvents();
    }
  }, [visible, selectedUserIds]);

  const loadMyEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await api.getMyEvents();
      const upcoming = data.filter((e: any) => e.status === 'active');
      setMyEvents(upcoming);
    } catch (error) {
      console.error('Error loading my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkInvite = async (eventId: string) => {
    if (!user || inviting) return;

    try {
      setInviting(true);
      const result = await api.bulkInvite({
        eventId,
        inviteeIds: selectedUserIds,
      });

      const successMessage = `Successfully sent ${result.data?.invitations?.length || result.invitations?.length || 0} invitation${(result.data?.invitations?.length || result.invitations?.length || 0) !== 1 ? 's' : ''}${result.data?.skipped || result.skipped ? ` (${result.data?.skipped || result.skipped} skipped)` : ''}`;

      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            onClose();
            if (onSuccess) onSuccess();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to send invitations'
      );
    } finally {
      setInviting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Send size={24} color="#3AFF6E" />
              <Text style={styles.title}>Send Invitations</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Choose an event to invite {selectedUserIds.length}{' '}
            {selectedUserIds.length === 1 ? 'person' : 'people'} to:
          </Text>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : myEvents.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.noEventsText}>No upcoming events</Text>
              <Text style={styles.noEventsSubtext}>
                Create an event first
              </Text>
            </View>
          ) : (
            <FlatList
              data={myEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.eventOption}
                  onPress={() => handleBulkInvite(item.id)}
                  disabled={inviting}
                >
                  <View style={styles.eventOptionInfo}>
                    <Text style={styles.eventOptionName}>{item.name}</Text>
                    <Text style={styles.eventOptionDate}>
                      {item.eventDate || item.event_date}
                    </Text>
                  </View>
                  <Mail size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
              style={styles.eventList}
            />
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={inviting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  center: {
    padding: 40,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#999',
  },
  eventList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  eventOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  eventOptionInfo: {
    flex: 1,
  },
  eventOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  eventOptionDate: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

