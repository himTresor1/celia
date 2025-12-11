import { useEffect, useMemo, useRef, useState } from 'react';
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
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Plus, MapPin, ArrowLeft, Grid, List } from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { DUMMY_USER_UUIDS, DUMMY_USERS } from '@/lib/dummyUsers';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;
const ROTATION_DEG = 12;

interface UserProfile {
  id: string;
  full_name: string;
  college_name?: string | null;
  preferred_locations?: string[];
  bio?: string;
  photo_urls?: string[];
  interests?: string[];
}

export default function InviteSwipeScreen() {
  const params = useLocalSearchParams<{
    eventId?: string;
    savedUserIds?: string;
  }>();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [invited, setInvited] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('swipe');
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.5)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Use saved users passed from previous screen if present, otherwise fallback to sample selection
    const savedIds = params.savedUserIds
      ? (params.savedUserIds as string).split(',').filter(Boolean)
      : [];

    let selectedUsers = DUMMY_USERS.filter((u) =>
      savedIds.includes(u.id)
    ) as UserProfile[];

    // Fallback: just take a few from dummy data so the screen is never empty
    if (selectedUsers.length === 0) {
      selectedUsers = DUMMY_USERS.slice(0, 8) as UserProfile[];
    }

    setUsers(selectedUsers);
    setCurrentIndex(0);
    setInvited([]);
  }, [params.savedUserIds]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating,
      onMoveShouldSetPanResponder: () => !isAnimating,
      onPanResponderMove: (_, gesture) => {
        if (!isAnimating) {
          const dx = gesture.dx;
          const dy = gesture.dy * 0.3;
          position.setValue({ x: dx, y: dy });
          rotation.setValue(dx / 20);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isAnimating) return;

        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          if (gesture.dx > 0) {
            handleInvite();
          } else {
            handlePass();
          }
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

  const handleInvite = () => {
    if (isAnimating || currentIndex >= users.length) return;

    const user = users[currentIndex];
    setInvited((prev) => [...prev, user.id]);
    setIsAnimating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH + 120, y: -40 },
        duration: 260,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: ROTATION_DEG,
        duration: 260,
        useNativeDriver: false,
      }),
    ]).start(() => {
      position.setValue({ x: 0, y: 0 });
      rotation.setValue(0);
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    });
  };

  const handlePass = () => {
    if (isAnimating || currentIndex >= users.length) return;
    setIsAnimating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: -SCREEN_WIDTH - 120, y: 40 },
        duration: 260,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: -ROTATION_DEG,
        duration: 260,
        useNativeDriver: false,
      }),
    ]).start(() => {
      position.setValue({ x: 0, y: 0 });
      rotation.setValue(0);
      setCurrentIndex((prev) => prev + 1);
      setIsAnimating(false);
    });
  };

  const handleFinish = () => {
    router.push({
      pathname: '/event/final-steps',
      params: {
        eventId: params.eventId as string,
        invitedUserIds: invited.join(','),
      },
    });
  };

  if (users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No people to invite yet</Text>
          <Text style={styles.emptySubtitle}>
            Try selecting some matches first, then return here.
          </Text>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => router.back()}
          >
            <Text style={styles.finishButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Plus size={64} color={Colors.primary} />
          </View>
          <Text style={styles.completeTitle}>All Set!</Text>
          <Text style={styles.completeSubtitle}>
            You've invited {invited.length}{' '}
            {invited.length === 1 ? 'person' : 'people'} to your event
          </Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>View Event</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];

  const cardRotation = rotation.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: [`-${ROTATION_DEG}deg`, '0deg', `${ROTATION_DEG}deg`],
  });

  const cardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.5, 1, 0.5],
  });

  const remainingUsers = users.filter((_, index) => index >= currentIndex);

  const renderListItem = ({ item }: { item: UserProfile }) => {
    const isInvited = invited.includes(item.id);
    const photoUrl = item.photo_urls?.[0];
    const location = item.preferred_locations?.[0] || item.college_name || '—';
    return (
      <TouchableOpacity
        style={[styles.listItem, isInvited && styles.listItemInvited]}
        onPress={() => {
          if (isInvited) {
            setInvited(invited.filter((id) => id !== item.id));
          } else {
            setInvited([...invited, item.id]);
          }
        }}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.listItemImage} />
        ) : (
          <View style={styles.listItemImage} />
        )}
        <View style={styles.listItemContent}>
          <Text style={styles.listItemName}>{item.full_name}</Text>
          <View style={styles.listItemInfo}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.listItemLocation}>{location}</Text>
          </View>
          {item.bio && (
            <Text style={styles.listItemBio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
          <View style={styles.listItemInterests}>
            {item.interests?.slice(0, 2).map((interest, i) => (
              <View key={i} style={styles.listInterestTag}>
                <Text style={styles.listInterestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={[
            styles.listItemCheckbox,
            isInvited && styles.listItemCheckboxSelected,
          ]}
        >
          {isInvited && <Plus size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Invite People</Text>
          <Text style={styles.headerSubtitle}>
            {viewMode === 'swipe'
              ? `${currentIndex + 1} of ${users.length}`
              : `${remainingUsers.length} remaining`}
          </Text>
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
          <View style={styles.inviteCounter}>
            <Plus size={16} color={Colors.primary} />
            <Text style={styles.inviteCountText}>{invited.length}</Text>
          </View>
        </View>
      </View>

      {viewMode === 'swipe' ? (
        <>
          <View style={styles.cardContainer}>
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
              <Image
                source={{ uri: currentUser.photo_urls?.[0] || '' }}
                style={styles.cardImage}
                resizeMode="cover"
              />

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                style={styles.cardGradient}
              />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>{currentUser.full_name}</Text>
                  <View style={styles.onlineBadge} />
                </View>

                <View style={styles.cardInfo}>
                  <MapPin size={14} color="#fff" />
                  <Text style={styles.cardLocation}>
                    {currentUser.preferred_locations?.[0] ||
                      currentUser.college_name ||
                      '—'}
                  </Text>
                </View>

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
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.passButton} onPress={handlePass}>
              <X size={32} color="#FF3B30" strokeWidth={3} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleInvite}
            >
              <Plus size={36} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <Text style={styles.swipeHint}>Swipe or use buttons to navigate</Text>
        </>
      ) : (
        <FlatList
          data={remainingUsers}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.listRow}
          showsVerticalScrollIndicator={false}
        />
      )}

      {invited.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>
              Continue with {invited.length}{' '}
              {invited.length === 1 ? 'invitation' : 'invitations'}
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#fff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
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
    height: '100%',
    backgroundColor: '#E8EFF5',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 12,
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 30,
    fontFamily: Fonts.bold,
    color: '#fff',
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
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  cardBio: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: 'rgba(255,255,255,0.9)',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#fff',
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
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemInvited: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F8FF',
  },
  listItemImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E8EFF5',
  },
  listItemContent: {
    padding: 12,
  },
  listItemName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  listItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  listItemLocation: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  listItemBio: {
    fontSize: 12,
    fontFamily: Fonts.regular,
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
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  listItemCheckbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
});
