import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import {
  UserPlus,
  UserCheck,
  UserX,
  Users,
  X,
  ChevronLeft,
  Search,
  MessageCircle,
  MapPin,
  GraduationCap,
  Heart,
} from 'lucide-react-native';
import { api } from '@/lib/api';

interface Friend {
  id?: string;
  friendshipId?: string;
  userId?: string;
  friendId?: string;
  status?: 'pending' | 'active' | 'rejected';
  createdAt?: string;
  connectedAt?: string;
  user?: {
    id: string;
    fullName: string;
    photoUrls?: string[];
    avatarUrl?: string;
    bio?: string;
    collegeName?: string;
    interests?: string[];
  };
  friend?: {
    id: string;
    fullName: string;
    photoUrls?: string[];
    avatarUrl?: string;
    bio?: string;
    collegeName?: string;
    interests?: string[];
  };
  otherUser?: {
    id: string;
    fullName: string;
    photoUrls?: string[];
    avatarUrl?: string;
    bio?: string;
    collegeName?: string;
    interests?: string[];
  };
  initiator?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  requestMessage?: string;
}

interface UserSuggestion {
  id: string;
  fullName: string;
  photoUrls?: string[];
  bio?: string;
  collegeName?: string;
  interests?: string[];
  attractivenessScore?: number;
  mutualFriendsCount?: number;
}

type TabType = 'discover' | 'friends' | 'requests' | 'sent';

export default function FriendsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Discover/Suggestions
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');

  // Friends
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsPage, setFriendsPage] = useState(1);
  const [hasMoreFriends, setHasMoreFriends] = useState(true);

  // Requests (received)
  const [requests, setRequests] = useState<Friend[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Sent requests
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      switch (activeTab) {
        case 'discover':
          await loadSuggestions();
          break;
        case 'friends':
          await loadFriends();
          break;
        case 'requests':
          await loadReceivedRequests();
          break;
        case 'sent':
          await loadSentRequests();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const data = await api.getFriendSuggestions(50);
      setSuggestions(data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const response = await api.getFriends(friendsPage, 20);
      const friendsList = response.friends || [];
      if (friendsList.length < 20) {
        setHasMoreFriends(false);
      }
      if (friendsPage === 1) {
        setFriends(friendsList);
      } else {
        setFriends((prev) => [...prev, ...friendsList]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadReceivedRequests = async () => {
    try {
      const data = await api.getFriendRequests('received');
      setRequests(data);
    } catch (error) {
      console.error('Error loading received requests:', error);
    }
  };

  const loadSentRequests = async () => {
    try {
      const data = await api.getFriendRequests('sent');
      setSentRequests(data);
    } catch (error) {
      console.error('Error loading sent requests:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [activeTab]);

  const handleSendRequest = async (userId: string, message?: string) => {
    if (!user) return;

    setSendingRequest(userId);
    try {
      await api.sendFriendRequest(userId, message);
      Alert.alert('Success', 'Friend request sent!');
      setShowMessageModal(false);
      setRequestMessage('');
      setSelectedUserId(null);
      // Remove from suggestions
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
      // Reload sent requests
      await loadSentRequests();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send friend request'
      );
    } finally {
      setSendingRequest(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await api.acceptFriendRequest(requestId);
      Alert.alert('Success', 'Friend request accepted!');
      // Remove from requests and reload friends
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      await loadFriends();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to accept friend request'
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await api.rejectFriendRequest(requestId);
      // Remove from requests
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reject friend request'
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeFriend(friendshipId);
              setFriends((prev) => prev.filter((f) => (f.friendshipId || f.id) !== friendshipId));
              Alert.alert('Success', 'Friend removed');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to remove friend'
              );
            }
          },
        },
      ]
    );
  };

  const openMessageModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowMessageModal(true);
  };

  const renderUserAvatar = (user: UserSuggestion | Friend['user'] | Friend['friend']) => {
    const imageUrl = user?.photoUrls?.[0] || user?.avatarUrl;
    if (imageUrl) {
      return <Image source={{ uri: imageUrl }} style={styles.avatar} />;
    }
    return (
      <View style={styles.avatarPlaceholder}>
        <UserPlus size={24} color="#3AFF6E" />
      </View>
    );
  };

  const renderDiscoverTab = () => {
    const filteredSuggestions = suggestions.filter((s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && suggestions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3AFF6E" />
        </View>
      );
    }

    if (filteredSuggestions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <UserPlus size={48} color="#ccc" />
          <Text style={styles.emptyText}>No suggestions available</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.suggestionsList}>
          {filteredSuggestions.map((suggestion) => (
            <View key={suggestion.id} style={styles.suggestionCard}>
              {renderUserAvatar(suggestion)}
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionName}>{suggestion.fullName}</Text>
                {suggestion.collegeName && (
                  <View style={styles.suggestionDetail}>
                    <GraduationCap size={14} color="#666" />
                    <Text style={styles.suggestionDetailText}>
                      {suggestion.collegeName}
                    </Text>
                  </View>
                )}
                {suggestion.mutualFriendsCount !== undefined && suggestion.mutualFriendsCount > 0 && (
                  <Text style={styles.mutualFriendsText}>
                    {suggestion.mutualFriendsCount} mutual friend
                    {suggestion.mutualFriendsCount !== 1 ? 's' : ''}
                  </Text>
                )}
                {suggestion.interests && suggestion.interests.length > 0 && (
                  <View style={styles.interestsPreview}>
                    {suggestion.interests.slice(0, 3).map((interest, idx) => (
                      <View key={idx} style={styles.interestTag}>
                        <Heart size={10} color="#3AFF6E" />
                        <Text style={styles.interestTagText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.suggestionActions}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openMessageModal(suggestion.id)}
                  disabled={sendingRequest === suggestion.id}
                >
                  {sendingRequest === suggestion.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <UserPlus size={16} color="#fff" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderFriendsTab = () => {
    const filteredFriends = friends.filter((f) => {
      const friend = f.friend || f.user;
      return friend?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading && friends.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3AFF6E" />
        </View>
      );
    }

    if (filteredFriends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Users size={48} color="#ccc" />
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Start connecting with people in the Discover tab
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.friendsList}>
          {filteredFriends.map((friend) => {
            const friendUser = friend.friend || friend.user;
            if (!friendUser) return null;

            return (
              <View key={friend.id} style={styles.friendCard}>
                {renderUserAvatar(friendUser)}
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friendUser.fullName}</Text>
                  {friendUser.collegeName && (
                    <View style={styles.friendDetail}>
                      <GraduationCap size={14} color="#666" />
                      <Text style={styles.friendDetailText}>
                        {friendUser.collegeName}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFriend(friend.friendshipId || friend.id || '')}
                >
                  <UserX size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderRequestsTab = () => {
    if (loading && requests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3AFF6E" />
        </View>
      );
    }

    if (requests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <UserCheck size={48} color="#ccc" />
          <Text style={styles.emptyText}>No pending requests</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.requestsList}>
          {requests.map((request) => {
            const requester = request.otherUser || request.user || request.friend;
            if (!requester) return null;

            return (
              <View key={request.id} style={styles.requestCard}>
                {renderUserAvatar(requester)}
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{requester.fullName}</Text>
                  {requester.collegeName && (
                    <View style={styles.requestDetail}>
                      <GraduationCap size={14} color="#666" />
                      <Text style={styles.requestDetailText}>
                        {requester.collegeName}
                      </Text>
                    </View>
                  )}
                  {request.requestMessage && (
                    <Text style={styles.requestMessage} numberOfLines={2}>
                      "{request.requestMessage}"
                    </Text>
                  )}
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id!)}
                    disabled={processingRequest === request.id}
                  >
                    {processingRequest === request.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <UserCheck size={16} color="#fff" />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={() => handleRejectRequest(request.id!)}
                    disabled={processingRequest === request.id}
                  >
                    <X size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderSentTab = () => {
    if (loading && sentRequests.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3AFF6E" />
        </View>
      );
    }

    if (sentRequests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <UserPlus size={48} color="#ccc" />
          <Text style={styles.emptyText}>No sent requests</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.requestsList}>
          {sentRequests.map((request) => {
            const recipient = request.otherUser || request.friend || request.user;
            if (!recipient) return null;

            return (
              <View key={request.id} style={styles.sentRequestCard}>
                {renderUserAvatar(recipient)}
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{recipient.fullName}</Text>
                  {recipient.collegeName && (
                    <View style={styles.requestDetail}>
                      <GraduationCap size={14} color="#666" />
                      <Text style={styles.requestDetailText}>
                        {recipient.collegeName}
                      </Text>
                    </View>
                  )}
                  {request.requestMessage && (
                    <Text style={styles.requestMessage} numberOfLines={2}>
                      "{request.requestMessage}"
                    </Text>
                  )}
                  <Text style={styles.pendingText}>Pending...</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <UserPlus
            size={18}
            color={activeTab === 'discover' ? '#3AFF6E' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'discover' && styles.tabTextActive,
            ]}
          >
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Users
            size={18}
            color={activeTab === 'friends' ? '#3AFF6E' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends' && styles.tabTextActive,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <UserCheck
            size={18}
            color={activeTab === 'requests' ? '#3AFF6E' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'requests' && styles.tabTextActive,
            ]}
          >
            Requests
          </Text>
          {requests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{requests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <UserPlus
            size={18}
            color={activeTab === 'sent' ? '#3AFF6E' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'sent' && styles.tabTextActive,
            ]}
          >
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      {(activeTab === 'discover' || activeTab === 'friends') && (
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      )}

      {activeTab === 'discover' && renderDiscoverTab()}
      {activeTab === 'friends' && renderFriendsTab()}
      {activeTab === 'requests' && renderRequestsTab()}
      {activeTab === 'sent' && renderSentTab()}

      {/* Message Modal */}
      <Modal
        visible={showMessageModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowMessageModal(false);
          setRequestMessage('');
          setSelectedUserId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Friend Request</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowMessageModal(false);
                  setRequestMessage('');
                  setSelectedUserId(null);
                }}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              Add a personal message (optional)
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Hey! I saw we have mutual friends. Want to connect?"
              value={requestMessage}
              onChangeText={setRequestMessage}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                if (selectedUserId) {
                  handleSendRequest(selectedUserId, requestMessage);
                }
              }}
              disabled={!selectedUserId}
            >
              <Text style={styles.sendButtonText}>Send Request</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#3AFF6E',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  tabContent: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
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
  suggestionsList: {
    padding: 16,
    gap: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 12,
  },
  sentRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionInfo: {
    flex: 1,
    gap: 4,
  },
  friendInfo: {
    flex: 1,
    gap: 4,
  },
  requestInfo: {
    flex: 1,
    gap: 4,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  suggestionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionDetailText: {
    fontSize: 13,
    color: '#666',
  },
  friendDetailText: {
    fontSize: 13,
    color: '#666',
  },
  requestDetailText: {
    fontSize: 13,
    color: '#666',
  },
  mutualFriendsText: {
    fontSize: 12,
    color: '#3AFF6E',
    fontWeight: '500',
    marginTop: 2,
  },
  interestsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
  },
  interestTagText: {
    fontSize: 11,
    color: '#3AFF6E',
    fontWeight: '500',
  },
  suggestionActions: {
    gap: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3AFF6E',
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  removeButton: {
    padding: 8,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#3AFF6E',
    borderRadius: 12,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  declineButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  pendingText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginTop: 4,
  },
  requestMessage: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 6,
  },
  friendsList: {
    padding: 16,
    gap: 12,
  },
  requestsList: {
    padding: 16,
    gap: 12,
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
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 100,
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#3AFF6E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

