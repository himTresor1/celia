import { useState, useRef, useEffect } from 'react';
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
  StatusBar,
  TextInput,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Search, Filter, X, Heart, MapPin, GraduationCap, Sparkles } from 'lucide-react-native';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80; // Reduced for easier swiping
const ROTATION_DEG = 15;

interface UserProfile {
  id: string;
  full_name: string;
  college_name: string | null;
  photo_urls: any;
  interests: string[];
  preferred_locations: string[];
  bio?: string;
}

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [invited, setInvited] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.5)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const availableUsers = DUMMY_USERS.filter(
      (u) => !user?.id || u.id !== user.id
    ) as UserProfile[];
    setUsers(availableUsers);
  };

  // Track touch/mouse start position for web compatibility
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  // Web-compatible mouse/touch handlers
  const handleWebStart = (e: any) => {
    if (isAnimating || currentIndex >= users.length) return;
    e.preventDefault?.();
    e.stopPropagation?.();
    const touch = e.touches?.[0] || e;
    startX.current = touch.clientX || touch.pageX;
    startY.current = touch.clientY || touch.pageY;
    isDragging.current = true;
    position.setOffset({ x: position.x._value, y: position.y._value });
    position.setValue({ x: 0, y: 0 });
  };

  const handleWebMove = (e: any) => {
    if (!isDragging.current || isAnimating || currentIndex >= users.length) return;
    e.preventDefault?.();
    e.stopPropagation?.();
    const touch = e.touches?.[0] || e;
    const currentX = touch.clientX || touch.pageX;
    const currentY = touch.clientY || touch.pageY;
    const dx = currentX - startX.current;
    const dy = (currentY - startY.current) * 0.3;
    
    position.setValue({ x: dx, y: dy });
    rotation.setValue(dx / 20);
  };

  const handleWebEnd = (e: any) => {
    if (!isDragging.current) return;
    e.preventDefault?.();
    e.stopPropagation?.();
    isDragging.current = false;
    position.flattenOffset();
    
    if (isAnimating || currentIndex >= users.length) {
      Animated.parallel([
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(rotation, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }),
      ]).start();
      return;
    }

    const touch = e.changedTouches?.[0] || e;
    const endX = touch.clientX || touch.pageX;
    const dx = endX - startX.current;

    const swipeRight = dx > SWIPE_THRESHOLD;
    const swipeLeft = dx < -SWIPE_THRESHOLD;

    if (swipeRight) {
      handleInvite();
    } else if (swipeLeft) {
      handlePass();
    } else {
      Animated.parallel([
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }),
        Animated.spring(rotation, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 7,
        }),
      ]).start();
    }
  };

  // PanResponder for native platforms
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating && currentIndex < users.length,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !isAnimating && currentIndex < users.length && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        position.setOffset({ x: position.x._value, y: position.y._value });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        if (!isAnimating && currentIndex < users.length) {
          const dx = gesture.dx;
          const dy = gesture.dy * 0.3;
          
          position.setValue({ x: dx, y: dy });
          rotation.setValue(dx / 20);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();
        
        if (isAnimating || currentIndex >= users.length) {
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }),
            Animated.spring(rotation, {
              toValue: 0,
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }),
          ]).start();
          return;
        }

        const swipeRight = gesture.dx > SWIPE_THRESHOLD;
        const swipeLeft = gesture.dx < -SWIPE_THRESHOLD;

        if (swipeRight) {
          handleInvite();
        } else if (swipeLeft) {
          handlePass();
        } else {
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }),
            Animated.spring(rotation, {
              toValue: 0,
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        position.flattenOffset();
        isDragging.current = false;
        Animated.parallel([
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(rotation, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }),
        ]).start();
      },
    })
  ).current;

  const handleInvite = () => {
    if (isAnimating || currentIndex >= users.length) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const user = users[currentIndex];
    setInvited(prev => [...prev, user.id]);
    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH + 100, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: ROTATION_DEG,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      moveToNextCard();
    });
  };

  const handlePass = () => {
    if (isAnimating || currentIndex >= users.length) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAnimating(true);

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: -ROTATION_DEG,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      moveToNextCard();
    });
  };

  const moveToNextCard = () => {
    position.setValue({ x: 0, y: 0 });
    rotation.setValue(0);
    setCurrentIndex(prev => prev + 1);
    setIsAnimating(false);

    // Animate next card
    if (currentIndex + 1 < users.length) {
      Animated.parallel([
        Animated.spring(nextCardOpacity, {
          toValue: 1,
          useNativeDriver: false,
        }),
        Animated.spring(nextCardScale, {
          toValue: 1,
          useNativeDriver: false,
        }),
      ]).start(() => {
        nextCardOpacity.setValue(0.5);
        nextCardScale.setValue(0.95);
      });
    }
  };

  const getSwipeOverlayOpacity = () => {
    return position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
    });
  };

  const getPassOverlayOpacity = () => {
    return position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
    });
  };

  if (users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3AFF6E', '#2EE05C']}
          style={styles.completeContainer}
        >
          <View style={styles.completeIcon}>
            <Sparkles size={64} color="#fff" />
          </View>
          <Text style={styles.completeTitle}>All Done! 🎉</Text>
          <Text style={styles.completeSubtitle}>
            You've reviewed {users.length} {users.length === 1 ? 'person' : 'people'}
          </Text>
          <Text style={styles.completeSubtitle}>
            {invited.length} {invited.length === 1 ? 'invitation' : 'invitations'} sent
          </Text>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => {
              setCurrentIndex(0);
              setInvited([]);
              fetchUsers();
            }}
          >
            <Text style={styles.finishButtonText}>Discover More</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];
  const photoUrl = currentUser.photo_urls?.[0] || null;
  const location = currentUser.preferred_locations?.[0] || currentUser.college_name;

  const cardRotation = rotation.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: [`-${ROTATION_DEG}deg`, '0deg', `${ROTATION_DEG}deg`],
  });

  const cardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Discover, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </Text>
          <Text style={styles.subtitle}>Connect with your community</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#3AFF6E" />
          </TouchableOpacity>
          {invited.length > 0 && (
            <View style={styles.inviteBadge}>
              <Text style={styles.inviteBadgeText}>{invited.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, college, interests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results Counter */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {users.length - currentIndex} {users.length - currentIndex === 1 ? 'person' : 'people'} remaining
        </Text>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer} pointerEvents="box-none">
        {/* Next Card (Background) */}
        {nextUser && (
          <Animated.View
            style={[
              styles.card,
              styles.nextCard,
              {
                opacity: nextCardOpacity,
                transform: [{ scale: nextCardScale }],
              },
            ]}
            pointerEvents="none"
          >
            <Image
              source={{ uri: nextUser.photo_urls?.[0] || '' }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>
        )}

        {/* Current Card */}
        {currentUser && (
          <Animated.View
            {...(Platform.OS === 'web' ? {} : panResponder.panHandlers)}
            onTouchStart={Platform.OS === 'web' ? handleWebStart : undefined}
            onTouchMove={Platform.OS === 'web' ? handleWebMove : undefined}
            onTouchEnd={Platform.OS === 'web' ? handleWebEnd : undefined}
            onMouseDown={Platform.OS === 'web' ? handleWebStart : undefined}
            onMouseMove={Platform.OS === 'web' ? (e: any) => {
              if (isDragging.current) handleWebMove(e);
            } : undefined}
            onMouseUp={Platform.OS === 'web' ? handleWebEnd : undefined}
            onMouseLeave={Platform.OS === 'web' ? () => {
              if (isDragging.current) {
                isDragging.current = false;
                position.flattenOffset();
                Animated.parallel([
                  Animated.spring(position, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                    tension: 50,
                    friction: 7,
                  }),
                  Animated.spring(rotation, {
                    toValue: 0,
                    useNativeDriver: false,
                    tension: 50,
                    friction: 7,
                  }),
                ]).start();
              }
            } : undefined}
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
            pointerEvents={isAnimating ? 'none' : 'auto'}
          >
            {/* Pass Overlay */}
            <Animated.View
              style={[
                styles.overlay,
                styles.passOverlay,
                { opacity: getPassOverlayOpacity() },
              ]}
            >
              <Text style={styles.overlayText}>PASS</Text>
            </Animated.View>

            {/* Invite Overlay */}
            <Animated.View
              style={[
                styles.overlay,
                styles.inviteOverlay,
                { opacity: getSwipeOverlayOpacity() },
              ]}
            >
              <Text style={styles.overlayText}>INVITE</Text>
            </Animated.View>

            {/* Card Image */}
            <Image
              source={{ uri: photoUrl || '' }}
              style={styles.cardImage}
              resizeMode="cover"
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.cardGradient}
            />

            {/* Card Content */}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardName}>{currentUser.full_name}</Text>
                  <View style={styles.onlineBadge} />
                </View>
                {currentUser.college_name && (
                  <View style={styles.collegeRow}>
                    <GraduationCap size={16} color="#fff" />
                    <Text style={styles.collegeText}>{currentUser.college_name}</Text>
                  </View>
                )}
              </View>

              {location && (
                <View style={styles.locationRow}>
                  <MapPin size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.locationText}>{location}</Text>
                </View>
              )}

              {currentUser.bio && (
                <Text style={styles.cardBio} numberOfLines={2}>
                  {currentUser.bio}
                </Text>
              )}

              {currentUser.interests && currentUser.interests.length > 0 && (
                <View style={styles.interestsContainer}>
                  {currentUser.interests.slice(0, 3).map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={handlePass}
          disabled={isAnimating}
        >
          <X size={32} color="#FF3B30" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInvite}
          disabled={isAnimating}
        >
          <Heart size={36} color="#fff" fill="#fff" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Swipe Hint */}
      <Text style={styles.swipeHint}>
        Swipe right to invite • Swipe left to pass
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3AFF6E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  inviteBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    width: '100%',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: 24,
    backgroundColor: '#fff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      cursor: 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    }),
  },
  nextCard: {
    zIndex: 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8EFF5',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    zIndex: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  onlineBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3AFF6E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  collegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collegeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cardBio: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderRadius: 16,
    padding: 20,
  },
  passOverlay: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  inviteOverlay: {
    borderColor: '#3AFF6E',
    backgroundColor: 'rgba(58, 255, 110, 0.2)',
  },
  overlayText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#fff',
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
  inviteButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3AFF6E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3AFF6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingBottom: 20,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  completeTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  finishButton: {
    marginTop: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#3AFF6E',
    fontSize: 18,
    fontWeight: '700',
  },
});
