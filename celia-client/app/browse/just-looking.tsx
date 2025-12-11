import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Heart, X, Save, Info } from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

interface UserProfile {
  id: string;
  full_name: string;
  college_name: string | null;
  photo_urls: any;
  interests: string[];
  bio?: string;
}

const SAVED_USERS_KEY = 'saved_users_general';

export default function JustLookingScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [savedUsers, setSavedUsers] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPressHoldModal, setShowPressHoldModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSavedUsers();
    fetchUsers();
  }, []);

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

  const saveUsers = async (userIds: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        SAVED_USERS_KEY,
        JSON.stringify(Array.from(userIds))
      );
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const fetchUsers = () => {
    const availableUsers = DUMMY_USERS.filter(
      (u) => !user?.id || u.id !== user.id
    ) as UserProfile[];
    setUsers(availableUsers);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !isAnimating && currentIndex < users.length,
      onMoveShouldSetPanResponder: () =>
        !isAnimating && currentIndex < users.length,
      onPanResponderGrant: () => {
        position.setOffset({ x: position.x._value, y: position.y._value });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        if (!isAnimating && currentIndex < users.length) {
          position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
          rotation.setValue(gesture.dx / 20);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();
        if (isAnimating || currentIndex >= users.length) return;

        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          handleSwipeComplete();
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          Animated.spring(rotation, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipeComplete = () => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH + 100, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      position.setValue({ x: 0, y: 0 });
      rotation.setValue(0);
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    });
  };

  const handleSave = async (userId: string) => {
    const newSaved = new Set(savedUsers);
    if (newSaved.has(userId)) {
      newSaved.delete(userId);
    } else {
      newSaved.add(userId);
    }
    setSavedUsers(newSaved);
    await saveUsers(newSaved);
  };

  const handleLongPress = (user: UserProfile) => {
    setSelectedUser(user);
    setShowPressHoldModal(true);
  };

  const handlePressHoldAction = async (action: 'save' | 'info' | 'remove') => {
    if (!selectedUser) return;

    if (action === 'save') {
      await handleSave(selectedUser.id);
    } else if (action === 'info') {
      router.push(`/user/${selectedUser.id}`);
    } else if (action === 'remove') {
      const newSaved = new Set(savedUsers);
      newSaved.delete(selectedUser.id);
      setSavedUsers(newSaved);
      await saveUsers(newSaved);
    }

    setShowPressHoldModal(false);
    setSelectedUser(null);
  };

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>All Done! 🎉</Text>
          <Text style={styles.completeSubtitle}>
            You've browsed {users.length}{' '}
            {users.length === 1 ? 'person' : 'people'}
          </Text>
          <Text style={styles.completeSubtitle}>
            {savedUsers.size} {savedUsers.size === 1 ? 'person' : 'people'}{' '}
            saved
          </Text>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => {
              setCurrentIndex(0);
              fetchUsers();
            }}
          >
            <Text style={styles.finishButtonText}>Browse More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewSavedButton}
            onPress={() => router.push('/saved/collection')}
          >
            <Text style={styles.viewSavedButtonText}>
              View Saved Collection
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = users[currentIndex];
  const photoUrl = currentUser.photo_urls?.[0] || null;
  const isSaved = savedUsers.has(currentUser.id);

  const cardRotation = rotation.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

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
          <Text style={styles.title}>Just Looking</Text>
          <Text style={styles.subtitle}>Browse and save people for later</Text>
        </View>
        {savedUsers.size > 0 && (
          <TouchableOpacity
            style={styles.savedBadge}
            onPress={() => router.push('/saved/collection')}
          >
            <Heart size={16} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.savedBadgeText}>{savedUsers.size}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: cardRotation },
              ],
            },
          ]}
          onLongPress={() => handleLongPress(currentUser)}
        >
          {photoUrl && (
            <Image source={{ uri: photoUrl }} style={styles.cardImage} />
          )}
          <View style={styles.cardContent}>
            <Text style={styles.cardName}>{currentUser.full_name}</Text>
            {currentUser.college_name && (
              <Text style={styles.cardCollege}>{currentUser.college_name}</Text>
            )}
            {currentUser.bio && (
              <Text style={styles.cardBio}>{currentUser.bio}</Text>
            )}
            {currentUser.interests && currentUser.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {currentUser.interests.slice(0, 3).map((interest, i) => (
                  <View key={i} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => handleSave(currentUser.id)}
          >
            <Heart
              size={24}
              color={isSaved ? Colors.primary : Colors.textSecondary}
              fill={isSaved ? Colors.primary : 'none'}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={handleSwipeComplete}
          disabled={isAnimating}
        >
          <X size={32} color="#FF3B30" strokeWidth={3} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveActionButton}
          onPress={() => handleSave(currentUser.id)}
          disabled={isAnimating}
        >
          <Heart
            size={36}
            color={isSaved ? Colors.primary : Colors.textSecondary}
            fill={isSaved ? Colors.primary : 'none'}
            strokeWidth={3}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Swipe to browse • Press & hold for quick actions
      </Text>

      {/* Press & Hold Modal */}
      <Modal
        visible={showPressHoldModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPressHoldModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Actions</Text>
            {selectedUser && (
              <Text style={styles.modalSubtitle}>{selectedUser.full_name}</Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => handlePressHoldAction('save')}
              >
                <Save size={24} color={Colors.primary} />
                <Text style={styles.modalActionText}>
                  {selectedUser && savedUsers.has(selectedUser.id)
                    ? 'Remove'
                    : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => handlePressHoldAction('info')}
              >
                <Info size={24} color={Colors.primary} />
                <Text style={styles.modalActionText}>View Profile</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPressHoldModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
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
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
  },
  savedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 600,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '60%',
    backgroundColor: Colors.border,
  },
  cardContent: {
    flex: 1,
    padding: 24,
  },
  cardName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  cardCollege: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  cardBio: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingVertical: 24,
    paddingBottom: 32,
  },
  passButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveActionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textLight,
    paddingBottom: 20,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  finishButton: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  viewSavedButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  viewSavedButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    gap: 12,
    marginBottom: 16,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
