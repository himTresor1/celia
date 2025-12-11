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
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  Calendar,
  User,
} from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SavedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState<string | null>(null);
  const [events] = useState<string[]>(['All', 'Event 1', 'Event 2', 'General']);

  useEffect(() => {
    loadSavedUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterEvent, savedUsers]);

  const loadSavedUsers = async () => {
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
      console.error('Error loading saved users:', error);
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

  const handleRemove = async (userId: string) => {
    try {
      const newSaved = savedUsers.filter((u) => u.id !== userId);
      setSavedUsers(newSaved);

      // Update storage
      const generalIds = newSaved.filter((u) => !u.eventId).map((u) => u.id);
      await AsyncStorage.setItem(SAVED_USERS_KEY, JSON.stringify(generalIds));
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const renderUserCard = ({ item }: { item: SavedUser }) => {
    const photoUrl = item.photo_urls?.[0] || null;

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => router.push(`/user/${item.id}`)}
      >
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
          onPress={() => handleRemove(item.id)}
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
          </Text>
        </View>
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
});
