import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Plus, MapPin, ArrowLeft } from 'lucide-react-native';
import { Colors, Fonts } from '@/constants/theme';
import { DUMMY_USER_UUIDS } from '@/lib/dummyUsers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
}

const SAMPLE_USERS: UserProfile[] = [
  {
    id: DUMMY_USER_UUIDS.sienna,
    name: 'Sienna Brooks',
    age: 21,
    location: 'Boston, MA',
    bio: 'Love hiking and photography. Always up for coffee!',
    avatarUrl: 'https://i.pravatar.cc/400?img=1',
    interests: ['Photography', 'Hiking', 'Coffee'],
  },
  {
    id: DUMMY_USER_UUIDS.alex,
    name: 'Alex Chen',
    age: 22,
    location: 'Cambridge, MA',
    bio: 'CS major, gamer, and foodie. Let\'s grab lunch!',
    avatarUrl: 'https://i.pravatar.cc/400?img=12',
    interests: ['Gaming', 'Technology', 'Food'],
  },
  {
    id: DUMMY_USER_UUIDS.maya,
    name: 'Maya Patel',
    age: 20,
    location: 'Boston, MA',
    bio: 'Art student who loves painting and music festivals',
    avatarUrl: 'https://i.pravatar.cc/400?img=5',
    interests: ['Art', 'Music', 'Painting'],
  },
  {
    id: DUMMY_USER_UUIDS.jordan,
    name: 'Jordan Lee',
    age: 23,
    location: 'Somerville, MA',
    bio: 'Fitness enthusiast and coffee addict ☕',
    avatarUrl: 'https://i.pravatar.cc/400?img=8',
    interests: ['Fitness', 'Coffee', 'Running'],
  },
  {
    id: DUMMY_USER_UUIDS.emma,
    name: 'Emma Wilson',
    age: 21,
    location: 'Boston, MA',
    bio: 'Book lover, writer, and tea enthusiast 📚',
    avatarUrl: 'https://i.pravatar.cc/400?img=9',
    interests: ['Reading', 'Writing', 'Tea'],
  },
];

export default function InviteSwipeScreen() {
  const params = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [invited, setInvited] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating,
      onMoveShouldSetPanResponder: () => !isAnimating,
      onPanResponderMove: (_, gesture) => {
        if (!isAnimating) {
          position.setValue({ x: gesture.dx, y: gesture.dy });
          rotation.setValue(gesture.dx / 20);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isAnimating) return;

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
    if (isAnimating) return;
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
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    });
  };

  const handleInvite = () => {
    if (isAnimating || currentIndex >= SAMPLE_USERS.length) return;

    const user = SAMPLE_USERS[currentIndex];
    setInvited(prev => [...prev, user.id]);
    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: 0, y: -SCREEN_HEIGHT },
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
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    });
  };

  const handlePass = () => {
    if (isAnimating || currentIndex >= SAMPLE_USERS.length) return;
    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: 0, y: SCREEN_HEIGHT },
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
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    });
  };

  const handleFinish = () => {
    router.push('/(tabs)');
  };

  if (currentIndex >= SAMPLE_USERS.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Plus size={64} color={Colors.primary} />
          </View>
          <Text style={styles.completeTitle}>All Set!</Text>
          <Text style={styles.completeSubtitle}>
            You've invited {invited.length} {invited.length === 1 ? 'person' : 'people'} to your event
          </Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>View Event</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = SAMPLE_USERS[currentIndex];
  const nextUser = SAMPLE_USERS[currentIndex + 1];

  const cardRotation = rotation.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const cardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Invite People</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} of {SAMPLE_USERS.length}
          </Text>
        </View>
        <View style={styles.inviteCounter}>
          <Plus size={16} color={Colors.primary} />
          <Text style={styles.inviteCountText}>{invited.length}</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {nextUser && (
          <View style={[styles.card, styles.nextCard]}>
            <Image source={{ uri: nextUser.avatarUrl }} style={styles.cardImage} />
          </View>
        )}

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
              opacity: cardOpacity,
            },
          ]}
        >
          <Image source={{ uri: currentUser.avatarUrl }} style={styles.cardImage} />

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{currentUser.name}</Text>
              <View style={styles.onlineBadge} />
            </View>

            <View style={styles.cardInfo}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.cardLocation}>{currentUser.location}</Text>
            </View>

            <Text style={styles.cardBio}>{currentUser.bio}</Text>

            <View style={styles.interestsContainer}>
              {currentUser.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <X size={32} color="#FF3B30" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
          <Plus size={36} color="#fff" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <Text style={styles.swipeHint}>
        Swipe or use buttons to navigate
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inviteCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteCountText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  nextCard: {
    position: 'absolute',
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
  },
  cardImage: {
    width: '100%',
    height: '60%',
    backgroundColor: '#E8EFF5',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  onlineBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLocation: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  cardBio: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    paddingBottom: 20,
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
  inviteButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    paddingBottom: 10,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  completeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  completeTitle: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
});
