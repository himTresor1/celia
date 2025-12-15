import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { UserMinus, Zap, ArrowLeft, Filter, Send } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { theme } from '@/constants/theme';
import ListFiltersModal from '@/components/ListFiltersModal';
import SendInvitationModal from '@/components/SendInvitationModal';

export default function FriendsListScreen() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [allFriends, setAllFriends] = useState<any[]>([]); // Store unfiltered list

  // Extract unique colleges and interests from friends
  const getFilterOptions = () => {
    const colleges = new Set<string>();
    const interests = new Set<string>();

    allFriends.forEach((item: any) => {
      const friend = item.friend;
      if (friend.college_name || friend.collegeName) {
        colleges.add(friend.college_name || friend.collegeName);
      }
      if (friend.interests && Array.isArray(friend.interests)) {
        friend.interests.forEach((interest: string) => interests.add(interest));
      }
    });

    return {
      colleges: Array.from(colleges).map((college) => ({
        id: college,
        label: college,
        value: college,
      })),
      interests: Array.from(interests).map((interest) => ({
        id: interest,
        label: interest,
        value: interest,
      })),
    };
  };

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allFriends]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      const [friendsResult, pendingResult] = await Promise.all([
        apiHelpers.getFriends(user.id),
        apiHelpers.getPendingFriendRequests(user.id),
      ]);

      if (friendsResult.data) {
        setAllFriends(friendsResult.data);
        setFriends(friendsResult.data);
      }
      if (pendingResult.data) setPending(pendingResult.data);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allFriends];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const friend = item.friend;
        const name = friend.full_name || friend.fullName || '';
        const college = friend.college_name || friend.collegeName || '';
        return name.toLowerCase().includes(query) || 
               college.toLowerCase().includes(query);
      });
    }

    // College filter
    if (filters.collegeId) {
      filtered = filtered.filter((item: any) => {
        const friend = item.friend;
        const college = friend.college_name || friend.collegeName || '';
        return college === filters.collegeId;
      });
    }

    // Interests filter
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter((item: any) => {
        const friend = item.friend;
        const userInterests = friend.interests || [];
        return filters.interests.some((interest: string) => 
          userInterests.includes(interest)
        );
      });
    }

    setFriends(filtered);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === friends.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(friends.map((item) => item.friend.id));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;

    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await apiHelpers.removeFriend(user.id, friendId);
            if (!error) {
              setFriends((prev) => prev.filter((f) => f.friend.id !== friendId));
            }
          },
        },
      ]
    );
  };

  const renderFriend = ({ item }: any) => {
    const friend = item.friend;
    const rating = apiHelpers.displayRating(friend.attractiveness_score);
    const isSelected = selectedUsers.includes(friend.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => toggleSelectUser(friend.id)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Image
          source={{ uri: friend.avatar_url || 'https://via.placeholder.com/70' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{friend.full_name}</Text>
          <Text style={styles.college}>{friend.college_name}</Text>
          <Text style={styles.rating}>⭐ {rating}/10</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFriend(friend.id);
          }}
        >
          <UserMinus size={20} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderPending = ({ item }: any) => {
    const otherUser = item.otherUser;
    const timeLeft = item.expiresAt ? Math.max(0, Math.floor((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))) : 0;

    return (
      <View style={styles.pendingCard}>
        <Image
          source={{ uri: otherUser.avatar_url || 'https://via.placeholder.com/60' }}
          style={styles.avatarSmall}
        />
        <View style={styles.pendingInfo}>
          <Text style={styles.name}>{otherUser.full_name}</Text>
          <View style={styles.pulseStatus}>
            <Text style={styles.pulseText}>
              {item.myPulseSent ? '⚡ You sent' : '⚡ Send pulse'}
              {' · '}
              {item.theirPulseSent ? '⚡ They sent' : '⚡ Waiting'}
            </Text>
          </View>
          <Text style={styles.expiresText}>{timeLeft}h left</Text>
        </View>
        {!item.myPulseSent && (
          <TouchableOpacity
            style={styles.pulseButton}
            onPress={async () => {
              await apiHelpers.sendEnergyPulse(user!.id, otherUser.id);
              loadFriends();
            }}
          >
            <Zap size={20} color="#FFF" fill="#FFF" />
          </TouchableOpacity>
        )}
      </View>
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
          <Text style={styles.title}>Friends</Text>
          <Text style={styles.subtitle}>
            {friends.length} friends
            {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {friends.length > 0 && (
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
        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Pending Connections</Text>
            <FlatList
              data={pending}
              renderItem={renderPending}
              keyExtractor={(item) => item.id}
              style={styles.pendingList}
            />
          </>
        )}

        {friends.length > 0 && (
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={selectAll}
            >
              <Text style={styles.selectAllText}>
                {selectedUsers.length === friends.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {friends.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>
              Send Energy Pulses to connect with others
            </Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.friendshipId}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadFriends();
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
      </View>

      <SendInvitationModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        selectedUserIds={selectedUsers}
        onSuccess={() => {
          setSelectedUsers([]);
          loadFriends();
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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
  headerSpacer: {
    width: 40,
  },
  iconButton: {
    padding: 8,
  },
  topActions: {
    marginBottom: 12,
  },
  selectAllButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3AFF6E',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#3AFF6E',
    backgroundColor: '#F0FFF4',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3AFF6E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  pendingList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  pendingInfo: {
    flex: 1,
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
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  pulseStatus: {
    marginBottom: 4,
  },
  pulseText: {
    fontSize: 12,
    color: '#666',
  },
  expiresText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
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
});
