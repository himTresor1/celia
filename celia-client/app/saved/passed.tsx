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
import { ArrowLeft, Search, X, Heart, User } from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PASSED_USERS_KEY = 'passed_users_just_looking';
const SAVED_USERS_KEY = 'saved_users_general';

interface UserProfile {
  id: string;
  full_name: string;
  college_name: string | null;
  photo_urls: any;
  interests: string[];
  bio?: string;
}

export default function PassedUsersScreen() {
  const [passedUsers, setPassedUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedUsers, setSavedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPassedUsers();
    loadSavedUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, passedUsers]);

  const loadPassedUsers = async () => {
    try {
      const passed = await AsyncStorage.getItem(PASSED_USERS_KEY);
      if (passed) {
        const passedIds = JSON.parse(passed);
        const users = DUMMY_USERS.filter((u) =>
          passedIds.includes(u.id)
        ) as UserProfile[];
        setPassedUsers(users);
        setFilteredUsers(users);
      }
    } catch (error) {
      console.error('Error loading passed users:', error);
    }
  };

  const loadSavedUsers = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_USERS_KEY);
      if (saved) {
        setSavedUsers(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading saved users:', error);
    }
  };

  const filterUsers = () => {
    let filtered = [...passedUsers];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(query) ||
          u.college_name?.toLowerCase().includes(query) ||
          u.interests?.some((i) => i.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSave = async (userId: string) => {
    const newSaved = new Set(savedUsers);
    if (newSaved.has(userId)) {
      newSaved.delete(userId);
    } else {
      newSaved.add(userId);
    }
    setSavedUsers(newSaved);
    try {
      await AsyncStorage.setItem(
        SAVED_USERS_KEY,
        JSON.stringify(Array.from(newSaved))
      );
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleRemove = async (userId: string) => {
    const newPassed = passedUsers.filter((u) => u.id !== userId);
    setPassedUsers(newPassed);
    setFilteredUsers(newPassed);
    try {
      const passedIds = newPassed.map((u) => u.id);
      await AsyncStorage.setItem(PASSED_USERS_KEY, JSON.stringify(passedIds));
    } catch (error) {
      console.error('Error removing passed user:', error);
    }
  };

  const renderUserCard = ({ item }: { item: UserProfile }) => {
    const photoUrl = item.photo_urls?.[0] || null;
    const isSaved = savedUsers.has(item.id);

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
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSave(item.id)}
          >
            <Heart
              size={18}
              color={isSaved ? Colors.primary : Colors.textSecondary}
              fill={isSaved ? Colors.primary : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item.id)}
          >
            <X size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
          <Text style={styles.title}>Passed People</Text>
          <Text style={styles.subtitle}>
            {filteredUsers.length}{' '}
            {filteredUsers.length === 1 ? 'person' : 'people'} you passed
          </Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search passed people..."
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
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={Colors.textLight} />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matches found' : 'No passed people yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery
              ? 'Try adjusting your search'
              : 'People you pass will appear here for later review'}
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
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
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
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
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
