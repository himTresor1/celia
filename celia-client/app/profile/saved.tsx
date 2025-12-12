import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { X, Mail, Send } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { api } from '@/lib/api';
import { theme } from '@/constants/theme';

export default function SavedListScreen() {
  const { user } = useAuth();
  const [savedUsers, setSavedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadSavedUsers();
    loadMyEvents();
  }, []);

  const loadSavedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await apiHelpers.getSavedUsers(user.id);
      if (data) {
        setSavedUsers(data);
      }
    } catch (error) {
      console.error('Error loading saved users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMyEvents = async () => {
    if (!user) return;

    try {
      const data = await api.getMyEvents();
      const upcoming = data.filter((e: any) => e.status === 'active');
      setMyEvents(upcoming);
    } catch (error) {
      console.error('Error loading my events:', error);
    }
  };

  const handleRemove = async (savedUserId: string) => {
    if (!user) return;

    const { error } = await apiHelpers.removeFromSaved(user.id, savedUserId);
    if (!error) {
      setSavedUsers((prev) => prev.filter((item) => item.saved_user_id !== savedUserId));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === savedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(savedUsers.map((item) => item.saved_user_id));
    }
  };

  const handleBulkInvite = async (eventId: string) => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Users Selected', 'Please select users to invite');
      return;
    }

    setInviting(true);
    try {
      await apiHelpers.bulkInviteToEvent(eventId, selectedUsers);
      Alert.alert(
        'Success',
        `Sent ${selectedUsers.length} invitation${selectedUsers.length !== 1 ? 's' : ''}!`
      );
      setShowInviteModal(false);
      setSelectedUsers([]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send invitations');
    } finally {
      setInviting(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const savedUser = item.saved_user;
    const rating = apiHelpers.displayRating(savedUser.attractiveness_score);
    const isSelected = selectedUsers.includes(savedUser.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => toggleSelectUser(savedUser.id)}
      >
        <View
          style={[styles.checkbox, isSelected && styles.checkboxSelected]}
        >
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Image
          source={{ uri: savedUser.avatar_url || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{savedUser.full_name}</Text>
          <Text style={styles.college}>{savedUser.college_name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {rating}/10</Text>
            <Text style={styles.savedDate}>
              Saved {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRemove(savedUser.id);
            }}
          >
            <X size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Saved List</Text>
          <Text style={styles.subtitle}>
            {savedUsers.length} people saved
            {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
          </Text>
        </View>
        {savedUsers.length > 0 && (
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.selectAllButton} onPress={selectAll}>
              <Text style={styles.selectAllText}>
                {selectedUsers.length === savedUsers.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {savedUsers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No saved users yet</Text>
          <Text style={styles.emptySubtext}>
            Save users from discovery to invite them later
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadSavedUsers();
          }}
          contentContainerStyle={styles.list}
        />
      )}

      {selectedUsers.length > 0 && (
        <View style={styles.floatingButton}>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>
              Invite {selectedUsers.length} to Event
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Event</Text>
            <Text style={styles.modalSubtitle}>
              Choose an event to invite {selectedUsers.length}{' '}
              {selectedUsers.length === 1 ? 'person' : 'people'} to:
            </Text>

            {myEvents.length === 0 ? (
              <View style={styles.noEvents}>
                <Text style={styles.noEventsText}>No upcoming events</Text>
                <Text style={styles.noEventsSubtext}>Create an event first</Text>
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
                      <Text style={styles.eventOptionDate}>{item.eventDate}</Text>
                    </View>
                    <Mail size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                )}
                style={styles.eventList}
              />
            )}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowInviteModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  topActions: {
    flexDirection: 'row',
    gap: 12,
  },
  selectAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F8FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  college: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 12,
  },
  savedDate: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    justifyContent: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
  noEvents: {
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
  modalCancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
