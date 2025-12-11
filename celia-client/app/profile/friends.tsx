import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { UserMinus, Zap } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { theme } from '@/constants/theme';

export default function FriendsListScreen() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    if (!user) return;

    try {
      const [friendsResult, pendingResult] = await Promise.all([
        apiHelpers.getFriends(user.id),
        apiHelpers.getPendingFriendRequests(user.id),
      ]);

      if (friendsResult.data) setFriends(friendsResult.data);
      if (pendingResult.data) setPending(pendingResult.data);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;

    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await apiHelpers.removeFriend(user.id, friendId);
            if (!error) {
              setFriends((prev) => prev.filter((f) => f.friend.id !== friendId));
            }
          },
        },
      ]
    );
  };

  const renderFriend = ({ item }: any) => {
    const friend = item.friend;
    const rating = apiHelpers.displayRating(friend.attractiveness_score);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/user/${friend.id}`)}
      >
        <Image
          source={{ uri: friend.avatar_url || 'https://via.placeholder.com/70' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{friend.full_name}</Text>
          <Text style={styles.college}>{friend.college_name}</Text>
          <Text style={styles.rating}>⭐ {rating}/10</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFriend(friend.id)}
        >
          <UserMinus size={20} color="#FF3B30" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderPending = ({ item }: any) => {
    const otherUser = item.otherUser;
    const timeLeft = item.expiresAt ? Math.max(0, Math.floor((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))) : 0;

    return (
      <View style={styles.pendingCard}>
        <Image
          source={{ uri: otherUser.avatar_url || 'https://via.placeholder.com/60' }}
          style={styles.avatarSmall}
        />
        <View style={styles.pendingInfo}>
          <Text style={styles.name}>{otherUser.full_name}</Text>
          <View style={styles.pulseStatus}>
            <Text style={styles.pulseText}>
              {item.myPulseSent ? '⚡ You sent' : '⚡ Send pulse'}
              {' · '}
              {item.theirPulseSent ? '⚡ They sent' : '⚡ Waiting'}
            </Text>
          </View>
          <Text style={styles.expiresText}>{timeLeft}h left</Text>
        </View>
        {!item.myPulseSent && (
          <TouchableOpacity
            style={styles.pulseButton}
            onPress={async () => {
              await apiHelpers.sendEnergyPulse(user!.id, otherUser.id);
              loadFriends();
            }}
          >
            <Zap size={20} color="#FFF" fill="#FFF" />
          </TouchableOpacity>
        )}
      </View>
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
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>
      <Text style={styles.subtitle}>{friends.length} friends</Text>

      {pending.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Pending Connections</Text>
          <FlatList
            data={pending}
            renderItem={renderPending}
            keyExtractor={(item) => item.id}
            style={styles.pendingList}
          />
        </>
      )}

      {friends.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Send Energy Pulses to connect with others
          </Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.friendshipId}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadFriends();
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  pendingList: {
    maxHeight: 200,
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
  pendingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  pendingInfo: {
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
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  pulseStatus: {
    marginBottom: 4,
  },
  pulseText: {
    fontSize: 12,
    color: '#666',
  },
  expiresText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
