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
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Grid,
  List,
  Heart,
  X,
  MapPin,
  GraduationCap,
} from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const ROTATION_DEG = 15;

interface UserProfile {
  id: string;
  full_name: string;
  college_name: string | null;
  photo_urls: any;
  interests: string[];
  bio?: string;
  preferred_locations?: string[];
}

interface FilterAnswers {
  style?: string[];
  age?: string[];
  personality?: string[];
  interests?: string[];
}

export default function BrowseResultsScreen() {
  const { eventId, filters } = useLocalSearchParams<{
    eventId: string;
    filters: string;
  }>();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  const [savedUsers, setSavedUsers] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.5)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;

  // Track touch/mouse start position for web compatibility
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    filterUsers();
  }, [filters]);

  const filterUsers = () => {
    try {
      const filterAnswers: FilterAnswers = filters ? JSON.parse(filters) : {};
      let filtered = [...DUMMY_USERS] as UserProfile[];

      // Map filter question options to actual interest names in dummy data
      const interestMapping: Record<string, string[]> = {
        Technology: ['Technology & Gaming'],
        Sports: ['Sports & Fitness'],
        Arts: ['Arts & Music', 'Photography & Design'],
        Music: ['Arts & Music'],
        Food: ['Food & Cooking'],
        Travel: ['Travel & Adventure'],
        Fitness: ['Sports & Fitness'],
        Reading: ['Reading & Writing'],
      };

      // Filter by interests if provided
      if (filterAnswers.interests && filterAnswers.interests.length > 0) {
        const matchedInterests: string[] = [];
        filterAnswers.interests.forEach((filterInterest) => {
          const mapped = interestMapping[filterInterest] || [filterInterest];
          matchedInterests.push(...mapped);
        });

        filtered = filtered.filter((user) =>
          matchedInterests.some((interest) =>
            user.interests?.some(
              (userInterest) =>
                userInterest.includes(interest) ||
                interest.includes(userInterest)
            )
          )
        );
      }

      // If no filters or no matches, show all users (for testing)
      if (filtered.length === 0) {
        filtered = DUMMY_USERS.slice(0, 10) as UserProfile[];
      }

      setUsers(filtered);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error filtering users:', error);
      // Fallback to showing first 10 users
      setUsers(DUMMY_USERS.slice(0, 10) as UserProfile[]);
    }
  };

  const toggleSave = async (userId: string) => {
    const newSaved = new Set(savedUsers);
    if (newSaved.has(userId)) {
      newSaved.delete(userId);
      // Remove from backend
      try {
        if (user?.id) {
          await api.removeFromSaved(userId);
        }
      } catch (error) {
        console.error('Failed to remove user from backend:', error);
      }
    } else {
      newSaved.add(userId);
      // Save to backend
      try {
        if (user?.id) {
          await api.addToSaved(userId, 'event_browse');
        }
      } catch (error) {
        console.error('Failed to save user to backend:', error);
        // Still update local state even if API call fails
      }
    }
    setSavedUsers(newSaved);
  };

  const handleContinue = () => {
    router.push({
      pathname: '/event/invite-swipe',
      params: {
        eventId,
        savedUserIds: Array.from(savedUsers).join(','),
      },
    });
  };

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
      handleSave();
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
          handleSave();
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

  const handleSave = () => {
    if (isAnimating || currentIndex >= users.length) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const user = users[currentIndex];
    toggleSave(user.id);
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
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeTitle}>All Done! 🎉</Text>
          <Text style={styles.completeSubtitle}>
            You've reviewed {users.length}{' '}
            {users.length === 1 ? 'person' : 'people'}
          </Text>
          <Text style={styles.completeSubtitle}>
            {savedUsers.size} {savedUsers.size === 1 ? 'person' : 'people'}{' '}
            saved
          </Text>
          {savedUsers.size > 0 && (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleContinue}
            >
              <Text style={styles.finishButtonText}>
                Continue with {savedUsers.size}{' '}
                {savedUsers.size === 1 ? 'person' : 'people'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];
  const photoUrl = currentUser.photo_urls?.[0] || null;
  const location =
    currentUser.preferred_locations?.[0] || currentUser.college_name;
  const isSaved = savedUsers.has(currentUser.id);

  const cardRotation = rotation.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: [`-${ROTATION_DEG}deg`, '0deg', `${ROTATION_DEG}deg`],
  });

  const cardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.3, 1, 0.3],
  });

  const renderListItem = ({ item }: { item: UserProfile }) => {
    const photoUrl = item.photo_urls?.[0] || null;
    const isSaved = savedUsers.has(item.id);
    const itemLocation = item.preferred_locations?.[0] || item.college_name;

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => router.push(`/user/${item.id}`)}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.listItemImage} />
        ) : (
          <View style={styles.listItemImagePlaceholder} />
        )}
        <View style={styles.listItemContent}>
          <Text style={styles.listItemName}>{item.full_name}</Text>
          {item.college_name && (
            <Text style={styles.listItemCollege}>{item.college_name}</Text>
          )}
          {item.bio && (
            <Text style={styles.listItemBio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
          {item.interests && item.interests.length > 0 && (
            <View style={styles.listItemInterests}>
              {item.interests.slice(0, 2).map((interest: string, i: number) => (
                <View key={i} style={styles.listInterestTag}>
                  <Text style={styles.listInterestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.listItemSaveButton}
          onPress={() => toggleSave(item.id)}
        >
          <Heart
            size={20}
            color={isSaved ? Colors.primary : Colors.textSecondary}
            fill={isSaved ? Colors.primary : 'none'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Matches Found</Text>
          <Text style={styles.subtitle}>
            {viewMode === 'swipe'
              ? `${users.length - currentIndex} ${
                  users.length - currentIndex === 1 ? 'person' : 'people'
                } remaining`
              : `${users.length} ${
                  users.length === 1 ? 'person' : 'people'
                } found`}
          </Text>
        </View>
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
      </View>

      {viewMode === 'swipe' ? (
        <>
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
                onTouchStart={
                  Platform.OS === 'web' ? handleWebStart : undefined
                }
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

                {/* Save Overlay */}
                <Animated.View
                  style={[
                    styles.overlay,
                    styles.saveOverlay,
                    { opacity: getSwipeOverlayOpacity() },
                  ]}
                >
                  <Text style={styles.overlayText}>SAVE</Text>
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
                      <Text style={styles.cardName}>
                        {currentUser.full_name}
                      </Text>
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

                  {currentUser.interests &&
                    currentUser.interests.length > 0 && (
                      <View style={styles.interestsContainer}>
                        {currentUser.interests
                          .slice(0, 3)
                          .map((interest, index) => (
                            <View key={index} style={styles.interestTag}>
                              <Text style={styles.interestText}>
                                {interest}
                              </Text>
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
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isAnimating}
            >
              <Heart
                size={36}
                color="#fff"
                fill={isSaved ? '#fff' : 'none'}
                strokeWidth={3}
              />
            </TouchableOpacity>
          </View>

          {/* Swipe Hint */}
          <Text style={styles.swipeHint}>
            Swipe right to save • Swipe left to pass
          </Text>
        </>
      ) : (
        <FlatList
          data={users.filter((_, index) => index >= currentIndex)}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.listRow}
          showsVerticalScrollIndicator={false}
        />
      )}

      {savedUsers.size > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              Continue with {savedUsers.size}{' '}
              {savedUsers.size === 1 ? 'person' : 'people'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#fff',
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
  viewModeContainer: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
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
    backgroundColor: Colors.primary,
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
  saveOverlay: {
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
  saveButton: {
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
    lineHeight: 26,
  },
  finishButton: {
    marginTop: 32,
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
    fontWeight: '700',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
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
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
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
    backgroundColor: Colors.border,
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
