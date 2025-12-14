import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  Calendar,
  User,
  Send,
  Mail,
} from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { apiHelpers } from '@/lib/apiHelpers';

const SAVED_USERS_KEY = 'saved_users_general';
const SAVED_USERS_BY_EVENT_KEY = 'saved_users_by_event';

interface UserProfile {
  id: string;
  full_name: string;
  college_name: string | null;
  photo_urls: any;
  interests: string[];
  bio?: string;
}

interface SavedUser extends UserProfile {
  savedAt: string;
  eventId?: string;
}

export default function SavedCollectionScreen() {
  const { user } = useAuth();
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SavedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState<string | null>(null);
  const [events] = useState<string[]>(['All', 'Event 1', 'Event 2', 'General']);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadSavedUsers();
    loadMyEvents();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterEvent, savedUsers]);

  const loadSavedUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Load from API instead of AsyncStorage to get real user IDs
      const { data, error } = await apiHelpers.getSavedUsers(user.id);
      if (data) {
        // Handle both direct array and paginated response
        const items = Array.isArray(data) ? data : data.items || [];
        // Transform API response to match SavedUser interface
        const allSaved: SavedUser[] = items.map((item: any) => {
          const savedUser = item.user || item.saved_user || item;
          return {
            id: savedUser.id || item.savedUserId || savedUser.saved_user_id,
            full_name: savedUser.fullName || savedUser.full_name,
            avatar_url: savedUser.avatarUrl || savedUser.avatar_url,
            college_name: savedUser.collegeName || savedUser.college_name,
            interests: savedUser.interests || [],
            attractiveness_score:
              savedUser.attractivenessScore ||
              savedUser.attractiveness_score ||
              0,
            savedAt:
              item.savedAt || item.created_at || new Date().toISOString(),
            eventId: item.context === 'event_browse' ? item.eventId : undefined,
          } as SavedUser;
        });
        setSavedUsers(allSaved);
        setFilteredUsers(allSaved);
      } else if (error) {
        console.error('Error loading saved users from API:', error);
        // Fallback to AsyncStorage if API fails
        await loadFromAsyncStorage();
      }
    } catch (error) {
      console.error('Error loading saved users:', error);
      // Fallback to AsyncStorage if API fails
      await loadFromAsyncStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromAsyncStorage = async () => {
    try {
      const generalSaved = await AsyncStorage.getItem(SAVED_USERS_KEY);
      const eventSaved = await AsyncStorage.getItem(SAVED_USERS_BY_EVENT_KEY);

      const generalIds = generalSaved ? JSON.parse(generalSaved) : [];
      const eventData = eventSaved ? JSON.parse(eventSaved) : {};

      const allSaved: SavedUser[] = [];

      // Add general saved users
      generalIds.forEach((userId: string) => {
        const user = DUMMY_USERS.find((u) => u.id === userId);
        if (user) {
          allSaved.push({
            ...user,
            savedAt: new Date().toISOString(),
          } as SavedUser);
        }
      });

      // Add event-specific saved users
      Object.keys(eventData).forEach((eventId) => {
        eventData[eventId].forEach((userId: string) => {
          const user = DUMMY_USERS.find((u) => u.id === userId);
          if (user && !allSaved.find((u) => u.id === userId)) {
            allSaved.push({
              ...user,
              savedAt: new Date().toISOString(),
              eventId,
            } as SavedUser);
          }
        });
      });

      setSavedUsers(allSaved);
      setFilteredUsers(allSaved);
    } catch (error) {
      console.error('Error loading saved users from AsyncStorage:', error);
    }
  };

  const filterUsers = () => {
    let filtered = [...savedUsers];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(query) ||
          u.college_name?.toLowerCase().includes(query) ||
          u.interests?.some((i) => i.toLowerCase().includes(query))
      );
    }

    if (filterEvent && filterEvent !== 'All') {
      if (filterEvent === 'General') {
        filtered = filtered.filter((u) => !u.eventId);
      } else {
        filtered = filtered.filter((u) => u.eventId === filterEvent);
      }
    }

    setFilteredUsers(filtered);
  };

  const loadMyEvents = async () => {
    if (!user) return;

    try {
      const data = await api.getMyEvents();
      const upcoming = data.filter(
        (e: any) => e.status === 'active' || e.status === 'draft'
      );
      setMyEvents(upcoming);
    } catch (error) {
      console.error('Error loading my events:', error);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleBulkInvite = async (eventId: string) => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Users Selected', 'Please select users to invite');
      return;
    }

    setInviting(true);
    try {
      const result = await apiHelpers.bulkInviteToEvent(eventId, selectedUsers);
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert(
          'Success',
          `Sent ${selectedUsers.length} invitation${
            selectedUsers.length !== 1 ? 's' : ''
          }!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowInviteModal(false);
                setSelectedUsers([]);
                loadMyEvents();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error sending bulk invitations:', error);
      Alert.alert('Error', error.message || 'Failed to send invitations');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string, e?: any) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const newSaved = savedUsers.filter((u) => u.id !== userId);
      setSavedUsers(newSaved);
      setFilteredUsers(
        newSaved.filter((u) => {
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
              u.full_name?.toLowerCase().includes(query) ||
              u.college_name?.toLowerCase().includes(query) ||
              u.interests?.some((i) => i.toLowerCase().includes(query))
            );
          }
          if (filterEvent && filterEvent !== 'All') {
            if (filterEvent === 'General') {
              return !u.eventId;
            }
            return u.eventId === filterEvent;
          }
          return true;
        })
      );

      // Update storage
      const generalIds = newSaved.filter((u) => !u.eventId).map((u) => u.id);
      await AsyncStorage.setItem(SAVED_USERS_KEY, JSON.stringify(generalIds));
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const renderUserCard = ({ item }: { item: SavedUser }) => {
    const photoUrl = item.photo_urls?.[0] || null;
    const isSelected = selectedUsers.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.userCard, isSelected && styles.userCardSelected]}
        onPress={() => toggleSelectUser(item.id)}
        activeOpacity={0.7}
      >
        {/* Selection Checkbox */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>

        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.userImage} />
        ) : (
          <View style={styles.userImagePlaceholder}>
            <User size={32} color={Colors.textLight} />
          </View>
        )}
        <View style={styles.userContent}>
          <Text style={styles.userName}>{item.full_name}</Text>
          {item.college_name && (
            <Text style={styles.userCollege}>{item.college_name}</Text>
          )}
          {item.interests && item.interests.length > 0 && (
            <View style={styles.userInterests}>
              {item.interests.slice(0, 2).map((interest, i) => (
                <View key={i} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => handleRemove(item.id, e)}
        >
          <X size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
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
          <Text style={styles.title}>Saved Collection</Text>
          <Text style={styles.subtitle}>
            {filteredUsers.length}{' '}
            {filteredUsers.length === 1 ? 'person' : 'people'} saved
            {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
          </Text>
        </View>
        {filteredUsers.length > 0 && (
          <TouchableOpacity style={styles.selectAllButton} onPress={selectAll}>
            <Text style={styles.selectAllText}>
              {selectedUsers.length === filteredUsers.length
                ? 'Deselect'
                : 'Select All'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          horizontal
          data={events}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterEvent === item && styles.filterChipActive,
              ]}
              onPress={() => setFilterEvent(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterEvent === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        />
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={64} color={Colors.textLight} />
          <Text style={styles.emptyText}>
            {searchQuery || filterEvent
              ? 'No matches found'
              : 'No saved people yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || filterEvent
              ? 'Try adjusting your search or filters'
              : 'Start browsing and save people you like'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.listRow}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Invite Button */}
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

      {/* Invite Modal */}
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
                    <Mail size={20} color={Colors.primary} />
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
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#fff',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
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
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  listRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userCard: {
    width: '48%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  userCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#F0F8FF',
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    backgroundColor: '#fff',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border,
  },
  userImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userContent: {
    padding: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  userCollege: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  userInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  interestTag: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.primary,
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
