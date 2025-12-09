import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Search, ChevronLeft, Check, User as UserIcon } from 'lucide-react-native';
import { DUMMY_USERS } from '@/lib/dummyUsers';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  bio: string;
  photo_urls: any;
  interests: string[];
  college_name: string;
  preferred_locations: string[];
}

export default function SelectGuestsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { user } = useAuth();

  const [users] = useState<UserProfile[]>(DUMMY_USERS);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(DUMMY_USERS);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInterest, setFilterInterest] = useState<string | null>(null);
  const [loading] = useState(false);
  const interests = ['Sports & Fitness', 'Arts & Music', 'Technology & Gaming', 'Food & Cooking', 'Travel & Adventure', 'Reading & Writing', 'Movies & TV', 'Photography & Design', 'Outdoor Activities', 'Business & Entrepreneurship', 'Environmental Sustainability'];

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterInterest]);

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.college_name?.toLowerCase().includes(query)
      );
    }

    if (filterInterest) {
      filtered = filtered.filter((u) =>
        u.interests?.includes(filterInterest)
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const handleContinue = () => {
    router.push({
      pathname: '/event/send-invitations',
      params: {
        eventId,
        selectedUserIds: Array.from(selectedUsers).join(','),
      },
    });
  };

  const renderUserCard = ({ item }: { item: UserProfile }) => {
    const isSelected = selectedUsers.has(item.id);
    const photoUrl = item.photo_urls?.[0] || null;

    return (
      <TouchableOpacity
        style={[styles.userCard, isSelected && styles.userCardSelected]}
        onPress={() => toggleUserSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.userCardContent}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.userPhoto} />
          ) : (
            <View style={styles.userPhotoPlaceholder}>
              <UserIcon size={32} color="#666" />
            </View>
          )}

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.full_name}</Text>
            {item.college_name && (
              <Text style={styles.userCollege}>{item.college_name}</Text>
            )}
            {item.interests && item.interests.length > 0 && (
              <View style={styles.userInterests}>
                {item.interests.slice(0, 3).map((interest, index) => (
                  <View key={index} style={styles.interestBadge}>
                    <Text style={styles.interestBadgeText}>{interest}</Text>
                  </View>
                ))}
                {item.interests.length > 3 && (
                  <Text style={styles.moreInterests}>
                    +{item.interests.length - 3}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View
            style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected,
            ]}
          >
            {isSelected && <Check size={16} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#3AFF6E" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Select Guests</Text>
          <Text style={styles.subtitle}>
            {selectedUsers.size} selected
          </Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or college..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !filterInterest && styles.filterChipActive,
            ]}
            onPress={() => setFilterInterest(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !filterInterest && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.filterChip,
                filterInterest === interest && styles.filterChipActive,
              ]}
              onPress={() => setFilterInterest(interest)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterInterest === interest && styles.filterChipTextActive,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} found
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedUsers.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue with {selectedUsers.size} {selectedUsers.size === 1 ? 'guest' : 'guests'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterScroll: {
    marginTop: 12,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  userCardSelected: {
    borderColor: '#3AFF6E',
    backgroundColor: '#f0f8ff',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  userCollege: {
    fontSize: 14,
    color: '#666',
  },
  userInterests: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  interestBadge: {
    backgroundColor: '#e8f4ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  interestBadgeText: {
    fontSize: 11,
    color: '#3AFF6E',
    fontWeight: '500',
  },
  moreInterests: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  continueButton: {
    backgroundColor: '#3AFF6E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
