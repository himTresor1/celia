import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Mail, ArrowLeft, Filter, Send } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { theme } from '@/constants/theme';
import ListFiltersModal from '@/components/ListFiltersModal';
import SendInvitationModal from '@/components/SendInvitationModal';

export default function InviteesListScreen() {
  const { user } = useAuth();
  const [invitees, setInvitees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [allInvitees, setAllInvitees] = useState<any[]>([]); // Store unfiltered list

  // Extract unique colleges and interests from invitees
  const getFilterOptions = () => {
    const colleges = new Set<string>();
    const interests = new Set<string>();

    allInvitees.forEach((item: any) => {
      const invitee = item.invitee || item.user;
      if (invitee?.college_name || invitee?.collegeName) {
        colleges.add(invitee.college_name || invitee.collegeName);
      }
      if (invitee?.interests && Array.isArray(invitee.interests)) {
        invitee.interests.forEach((interest: string) => interests.add(interest));
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
    loadInvitees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allInvitees]);

  const loadInvitees = async () => {
    if (!user) return;

    try {
      const { data, error } = await apiHelpers.getInvitees(user.id);
      if (data) {
        const items = Array.isArray(data) ? data : data.items || [];
        setAllInvitees(items);
        setInvitees(items);
      }
    } catch (error) {
      console.error('Error loading invitees:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allInvitees];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((item: any) => {
        const invitee = item.invitee || item.user;
        const name = invitee?.full_name || invitee?.fullName || '';
        const college = invitee?.college_name || invitee?.collegeName || '';
        return name.toLowerCase().includes(query) || 
               college.toLowerCase().includes(query);
      });
    }

    // College filter
    if (filters.collegeId) {
      filtered = filtered.filter((item: any) => {
        const invitee = item.invitee || item.user;
        const college = invitee?.college_name || invitee?.collegeName || '';
        return college === filters.collegeId;
      });
    }

    // Interests filter
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter((item: any) => {
        const invitee = item.invitee || item.user;
        const userInterests = invitee?.interests || [];
        return filters.interests.some((interest: string) => 
          userInterests.includes(interest)
        );
      });
    }

    setInvitees(filtered);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === invitees.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(invitees.map((item) => {
        const invitee = item.invitee || item.user;
        return invitee?.id || item.id;
      }));
    }
  };

  const renderItem = ({ item }: any) => {
    const invitee = item.invitee || item.user;
    const rating = apiHelpers.displayRating(invitee?.attractiveness_score || 0);
    const userId = invitee?.id || item.id;
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
          source={{ uri: invitee?.avatar_url || 'https://via.placeholder.com/70' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{invitee?.full_name || 'Unknown'}</Text>
          <Text style={styles.college}>{invitee?.college_name || ''}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.rating}>⭐ {rating}/10</Text>
            <Text style={styles.inviteCount}>
              {item.total_invitations || item.totalInvitations || 0} invitation{(item.total_invitations || item.totalInvitations || 0) !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.lastInvited}>
            Last invited {new Date(item.last_invited_at || item.lastInvitedAt || Date.now()).toLocaleDateString()}
          </Text>
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
          <Text style={styles.title}>Invitees</Text>
          <Text style={styles.subtitle}>
            {invitees.length} people invited
            {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {invitees.length > 0 && (
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
        {invitees.length > 0 && (
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={selectAll}
            >
              <Text style={styles.selectAllText}>
                {selectedUsers.length === invitees.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {invitees.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No invitees yet</Text>
          <Text style={styles.emptySubtext}>
            Start inviting people to your events
          </Text>
        </View>
      ) : (
        <FlatList
          data={invitees}
          renderItem={renderItem}
          keyExtractor={(item) => {
            const invitee = item.invitee || item.user;
            return invitee?.id || item.id || `invitee-${item.total_invitations}`;
          }}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadInvitees();
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
          loadInvitees();
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
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
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 12,
  },
  inviteCount: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  lastInvited: {
    fontSize: 12,
    color: '#999',
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
