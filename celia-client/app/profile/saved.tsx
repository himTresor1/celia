import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { X, Mail, Send, ArrowLeft, Filter } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { api } from '@/lib/api';
import { theme } from '@/constants/theme';
import ListFiltersModal from '@/components/ListFiltersModal';
import SendInvitationModal from '@/components/SendInvitationModal';

export default function SavedListScreen() {
  const { user } = useAuth();
  const [savedUsers, setSavedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [inviting, setInviting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [allSavedUsers, setAllSavedUsers] = useState<any[]>([]); // Store unfiltered list

  // Extract unique colleges and interests from saved users
  const getFilterOptions = () => {
    const colleges = new Set<string>();
    const interests = new Set<string>();

    allSavedUsers.forEach((item: any) => {
      const savedUser = item.user || item.saved_user || item;
      if (savedUser.college_name || savedUser.collegeName) {
        colleges.add(savedUser.college_name || savedUser.collegeName);
      }
      if (savedUser.interests && Array.isArray(savedUser.interests)) {
        savedUser.interests.forEach((interest: string) => interests.add(interest));
      }
    });

    return {
      colleges: Array.from(colleges).map((college, index) => ({
        id: college,
        label: college,
        value: college,
      })),
      interests: Array.from(interests).map((interest, index) => ({
        id: interest,
        label: interest,
        value: interest,
      })),
    };
  };

  useEffect(() => {
    loadSavedUsers();
    loadMyEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allSavedUsers]);

  const loadSavedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await apiHelpers.getSavedUsers(user.id);
      if (data) {
        // Handle both direct array and paginated response
        const items = Array.isArray(data) ? data : data.items || [];
        setAllSavedUsers(items);
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

  const applyFilters = () => {
    let filtered = [...allSavedUsers];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const savedUser = item.user || item.saved_user || item;
        const name = savedUser.full_name || savedUser.fullName || '';
        const college = savedUser.college_name || savedUser.collegeName || '';
        return name.toLowerCase().includes(query) || 
               college.toLowerCase().includes(query);
      });
    }

    // College filter
    if (filters.collegeId) {
      filtered = filtered.filter((item: any) => {
        const savedUser = item.user || item.saved_user || item;
        const college = savedUser.college_name || savedUser.collegeName || '';
        return college === filters.collegeId;
      });
    }

    // Interests filter
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter((item: any) => {
        const savedUser = item.user || item.saved_user || item;
        const userInterests = savedUser.interests || [];
        return filters.interests.some((interest: string) => 
          userInterests.includes(interest)
        );
      });
    }

    setSavedUsers(filtered);
  };

  const handleRemove = async (savedUserId: string) => {
    if (!user) return;

    const { error } = await apiHelpers.removeFromSaved(savedUserId);
    if (!error) {
      // Update both filtered and unfiltered lists
      setAllSavedUsers((prev) =>
        prev.filter((item) => {
          const savedUser = item.user || item.saved_user || item;
          const userId =
            savedUser.id || item.savedUserId || savedUser.saved_user_id;
          return userId !== savedUserId;
        })
      );
      // applyFilters will update savedUsers automatically via useEffect
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
    if (selectedUsers.length === savedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(
        savedUsers.map((item) => {
          // Use same logic as renderItem to extract user ID
          // API returns: { id, savedAt, context, notes, user: { id, fullName, ... } }
          const savedUser = item.user || item.saved_user || item;
          return savedUser.id || item.savedUserId || savedUser.saved_user_id;
        })
      );
    }
  };


  const renderItem = ({ item }: any) => {
    // Handle both nested saved_user structure and flat structure
    // API returns: { id, savedAt, context, notes, user: { id, fullName, ... } }
    const savedUser = item.user || item.saved_user || item;
    const userId = savedUser.id || item.savedUserId || savedUser.saved_user_id;
    const rating = apiHelpers.displayRating(
      savedUser.attractivenessScore ||
        savedUser.attractiveness_score ||
        0
    );
    const isSelected = selectedUsers.includes(userId);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => toggleSelectUser(userId)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Image
          source={{
            uri:
              savedUser.avatarUrl ||
              savedUser.avatar_url ||
              'https://via.placeholder.com/80',
          }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>
            {savedUser.full_name || savedUser.fullName}
          </Text>
          <Text style={styles.college}>
            {savedUser.college_name || savedUser.collegeName}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {rating}/10</Text>
            <Text style={styles.savedDate}>
              Saved{' '}
              {new Date(
                item.savedAt || item.created_at
              ).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRemove(userId);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Saved List</Text>
          <Text style={styles.subtitle}>
            {savedUsers.length} people saved
            {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {savedUsers.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowFilters(true)}
              >
                <Filter size={20} color="#3AFF6E" />
              </TouchableOpacity>
              {selectedUsers.length > 0 && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowInviteModal(true)}
                >
                  <Send size={20} color="#3AFF6E" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      <View style={styles.container}>
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
          keyExtractor={(item, index) => {
            const savedUser = item.user || item.saved_user || item;
            return (
              savedUser.id ||
              item.id ||
              savedUser.saved_user_id ||
              item.savedUserId ||
              `saved-${index}`
            );
          }}
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

        <SendInvitationModal
          visible={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          selectedUserIds={selectedUsers}
          onSuccess={() => {
            setSelectedUsers([]);
            loadSavedUsers();
            loadMyEvents();
          }}
        />

        <ListFiltersModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={(appliedFilters) => {
            setFilters(appliedFilters);
          }}
          filterOptions={getFilterOptions()}
          currentFilters={filters}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
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
  content: {
    flex: 1,
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
