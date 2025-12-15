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
  Modal,
  FlatList,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import {
  Search,
  Filter,
  X,
  Heart,
  MapPin,
  GraduationCap,
  Sparkles,
  Calendar,
  Eye,
  Grid,
  List,
} from 'lucide-react-native';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, BorderRadius } from '@/constants/theme';
import { apiHelpers } from '@/lib/apiHelpers';
import { api } from '@/lib/api';

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

const PASSED_USERS_KEY = 'passed_users_just_looking';
const SAVED_USERS_KEY = 'saved_users_general';

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [invited, setInvited] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  const [isJustLooking, setIsJustLooking] = useState(false);
  const [savedUsers, setSavedUsers] = useState<Set<string>>(new Set());
  const [passedUsers, setPassedUsers] = useState<Set<string>>(new Set());

  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.5)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    fetchUsers();
    checkFirstVisit();
    loadSavedAndPassedUsers();
  }, []);

  const loadSavedAndPassedUsers = async () => {
    try {
      // Load passed users from AsyncStorage (frontend only)
      const passed = await AsyncStorage.getItem(PASSED_USERS_KEY);
      if (passed) {
        setPassedUsers(new Set(JSON.parse(passed)));
      }
      
      // Load saved users from API to sync with backend
      if (user?.id) {
        const { data } = await apiHelpers.getSavedUsers(user.id);
        if (data) {
          const items = Array.isArray(data) ? data : data.items || [];
          const savedIds = new Set(
            items.map((item: any) => {
              const savedUser = item.user || item.saved_user || item;
              return savedUser.id || item.savedUserId || savedUser.saved_user_id;
            })
          );
          setSavedUsers(savedIds);
        }
      }
    } catch (error) {
      console.error('Error loading saved/passed users:', error);
    }
  };

  const savePassedUser = async (userId: string) => {
    const newPassed = new Set(passedUsers);
    newPassed.add(userId);
    setPassedUsers(newPassed);
    try {
      await AsyncStorage.setItem(
        PASSED_USERS_KEY,
        JSON.stringify(Array.from(newPassed))
      );
    } catch (error) {
      console.error('Error saving passed user:', error);
    }
  };

  const saveUser = async (userId: string) => {
    const isCurrentlySaved = savedUsers.has(userId);
    
    try {
      if (isCurrentlySaved) {
        // Remove from saved
        await apiHelpers.removeFromSaved(userId);
        const newSaved = new Set(savedUsers);
        newSaved.delete(userId);
        setSavedUsers(newSaved);
      } else {
        // Add to saved via API
        const { error } = await apiHelpers.addToSaved(userId, 'just_looking');
        if (!error) {
          const newSaved = new Set(savedUsers);
          newSaved.add(userId);
          setSavedUsers(newSaved);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          console.error('Error saving user:', error);
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const checkFirstVisit = async () => {
    try {
      const hasSeenModal = await AsyncStorage.getItem('hasSeenChoiceModal');
      if (!hasSeenModal) {
        // Show modal after a short delay to let the screen render
        setTimeout(() => {
          setShowChoiceModal(true);
        }, 500);
      }
    } catch (error) {
      console.error('Error checking first visit:', error);
    }
  };

  const handleSelectEvent = async () => {
    await AsyncStorage.setItem('hasSeenChoiceModal', 'true');
    setShowChoiceModal(false);
    setIsJustLooking(false);
    router.push('/event/select-event');
  };

  const handleJustLooking = async () => {
    await AsyncStorage.setItem('hasSeenChoiceModal', 'true');
    setShowChoiceModal(false);
    setIsJustLooking(true);
  };

  const handleSkipModal = async () => {
    await AsyncStorage.setItem('hasSeenChoiceModal', 'true');
    setShowChoiceModal(false);
  };

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
    const currentX = (position.x as any).__getValue
      ? (position.x as any).__getValue()
      : 0;
    const currentY = (position.y as any).__getValue
      ? (position.y as any).__getValue()
      : 0;
    position.setOffset({ x: currentX, y: currentY });
    position.setValue({ x: 0, y: 0 });
  };

  const handleWebMove = (e: any) => {
    if (!isDragging.current || isAnimating || currentIndex >= users.length)
      return;
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
      onStartShouldSetPanResponder: () =>
        !isAnimating && currentIndex < users.length,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          !isAnimating &&
          currentIndex < users.length &&
          Math.abs(gestureState.dx) > 5
        );
      },
      onPanResponderGrant: () => {
        const currentX = (position.x as any).__getValue
          ? (position.x as any).__getValue()
          : 0;
        const currentY = (position.y as any).__getValue
          ? (position.y as any).__getValue()
          : 0;
        position.setOffset({ x: currentX, y: currentY });
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

    // Always add to saved list so the counter reflects swipes/likes
    saveUser(user.id);

    if (!isJustLooking) {
      // Normal mode, also track invited separately
      setInvited((prev) => [...prev, user.id]);
    }

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
    const user = users[currentIndex];

    // In "Just Looking" mode, track passed users
    if (isJustLooking) {
      savePassedUser(user.id);
    }

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
    setCurrentIndex((prev) => prev + 1);
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
            You've reviewed {users.length}{' '}
            {users.length === 1 ? 'person' : 'people'}
          </Text>
          <Text style={styles.completeSubtitle}>
            {invited.length}{' '}
            {invited.length === 1 ? 'invitation' : 'invitations'} sent
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
  const location =
    currentUser.preferred_locations?.[0] || currentUser.college_name;

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
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'swipe' && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode('swipe')}
            >
              <Grid
                size={18}
                color={viewMode === 'swipe' ? '#fff' : Colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'list' && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode('list')}
            >
              <List
                size={18}
                color={viewMode === 'list' ? '#fff' : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color="#3AFF6E" />
          </TouchableOpacity>
          {isJustLooking && savedUsers.size > 0 && (
            <TouchableOpacity
              style={styles.inviteBadge}
              onPress={() => router.push('/saved/collection')}
            >
              <Heart size={14} color="#fff" fill="#fff" />
              <Text style={styles.inviteBadgeText}>{savedUsers.size}</Text>
            </TouchableOpacity>
          )}
          {!isJustLooking && invited.length > 0 && (
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
          {viewMode === 'swipe'
            ? `${users.length - currentIndex} ${
                users.length - currentIndex === 1 ? 'person' : 'people'
              } remaining`
            : `${users.length} ${
                users.length === 1 ? 'person' : 'people'
              } found`}
        </Text>
        {isJustLooking && passedUsers.size > 0 && (
          <TouchableOpacity
            style={styles.passedUsersButton}
            onPress={() => router.push({ pathname: '/saved/passed' as any })}
          >
            <Text style={styles.passedUsersText}>
              {passedUsers.size} passed - View later
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {viewMode === 'swipe' ? (
        /* Card Stack */
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
              {...(Platform.OS === 'web'
                ? {
                    onMouseDown: handleWebStart as any,
                    onMouseMove: ((e: any) => {
                      if (isDragging.current) handleWebMove(e);
                    }) as any,
                    onMouseUp: handleWebEnd as any,
                    onMouseLeave: (() => {
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
                    }) as any,
                  }
                : {})}
              pointerEvents={isAnimating ? 'none' : 'auto'}
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
                      <Text style={styles.collegeText}>
                        {currentUser.college_name}
                      </Text>
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
                    {currentUser.interests
                      .slice(0, 3)
                      .map((interest, index) => (
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
      ) : (
        /* List View - 2 cards per row */
        <FlatList
          data={users.filter((_, index) => index >= currentIndex)}
          renderItem={({ item }: { item: UserProfile }) => {
            const photoUrl = item.photo_urls?.[0] || null;
            const isSaved = savedUsers.has(item.id);
            const isPassed = passedUsers.has(item.id);
            const location = item.preferred_locations?.[0] || item.college_name;

            return (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => router.push(`/user/${item.id}`)}
              >
                {photoUrl ? (
                  <Image
                    source={{ uri: photoUrl }}
                    style={styles.listItemImage}
                  />
                ) : (
                  <View style={styles.listItemImagePlaceholder} />
                )}
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemName}>{item.full_name}</Text>
                  {item.college_name && (
                    <Text style={styles.listItemCollege}>
                      {item.college_name}
                    </Text>
                  )}
                  {item.bio && (
                    <Text style={styles.listItemBio} numberOfLines={2}>
                      {item.bio}
                    </Text>
                  )}
                  {item.interests && item.interests.length > 0 && (
                    <View style={styles.listItemInterests}>
                      {item.interests
                        .slice(0, 2)
                        .map((interest: string, i: number) => (
                          <View key={i} style={styles.listInterestTag}>
                            <Text style={styles.listInterestText}>
                              {interest}
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.listItemSaveButton}
                  onPress={() => saveUser(item.id)}
                >
                  <Heart
                    size={20}
                    color={isSaved ? Colors.primary : Colors.textSecondary}
                    fill={isSaved ? Colors.primary : 'none'}
                  />
                </TouchableOpacity>
                {isPassed && (
                  <View style={styles.passedBadge}>
                    <Text style={styles.passedBadgeText}>Passed</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.listRow}
          showsVerticalScrollIndicator={false}
        />
      )}

      {viewMode === 'swipe' && (
        <>
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
              <Heart
                size={36}
                color="#fff"
                fill={
                  isJustLooking && savedUsers.has(users[currentIndex]?.id)
                    ? '#fff'
                    : 'none'
                }
                strokeWidth={3}
              />
            </TouchableOpacity>
          </View>

          {/* Swipe Hint */}
          <Text style={styles.swipeHint}>
            {isJustLooking
              ? 'Swipe right to save • Swipe left to pass'
              : 'Swipe right to invite • Swipe left to pass'}
          </Text>
        </>
      )}

      {/* View Saved List Link (always visible) */}
      <TouchableOpacity
        style={styles.viewSavedLink}
        onPress={() => router.push('/saved/collection')}
        activeOpacity={0.7}
      >
        <Text style={styles.viewSavedLinkText}>
          View saved list ({savedUsers.size})
        </Text>
      </TouchableOpacity>

      {/* Choice Modal */}
      <Modal
        visible={showChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleSkipModal}
            >
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Choose Your Path</Text>
            <Text style={styles.modalSubtitle}>
              How would you like to find people?
            </Text>

            <View style={styles.choiceContainer}>
              {/* Option A: Select from Events */}
              <TouchableOpacity
                style={styles.choiceCard}
                onPress={handleSelectEvent}
                activeOpacity={0.8}
              >
                <View style={styles.choiceIconContainer}>
                  <Calendar size={32} color={Colors.primary} />
                </View>
                <Text style={styles.choiceTitle}>Select from Events</Text>
                <Text style={styles.choiceDescription}>
                  Choose an event and find people who match
                </Text>
              </TouchableOpacity>

              {/* Option B: Just Looking */}
              <TouchableOpacity
                style={styles.choiceCard}
                onPress={handleJustLooking}
                activeOpacity={0.8}
              >
                <View style={styles.choiceIconContainer}>
                  <Eye size={32} color={Colors.primary} />
                </View>
                <Text style={styles.choiceTitle}>Just Looking</Text>
                <Text style={styles.choiceDescription}>
                  Browse people casually and save them for later
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipModal}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
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
  viewModeContainer: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    padding: 4,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: Colors.primary,
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
    flexDirection: 'row',
    gap: 4,
  },
  inviteBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  passedUsersButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  passedUsersText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  listRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  listItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border,
  },
  listItemImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border,
  },
  listItemContent: {
    padding: 12,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  listItemCollege: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  listItemBio: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  listItemInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  listInterestTag: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listInterestText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  listItemSaveButton: {
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
  passedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passedBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
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
    paddingBottom: 4,
  },
  viewSavedLink: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewSavedLinkText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
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
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 28,
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
  choiceContainer: {
    gap: 16,
  },
  choiceCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E8EFF5',
  },
  choiceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  choiceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
