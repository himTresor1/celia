import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { theme } from '@/constants/theme';

export default function InviteesListScreen() {
  const { user } = useAuth();
  const [invitees, setInvitees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInvitees();
  }, []);

  const loadInvitees = async () => {
    if (!user) return;

    try {
      const { data, error } = await apiHelpers.getInvitees(user.id);
      if (data) {
        setInvitees(data);
      }
    } catch (error) {
      console.error('Error loading invitees:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: any) => {
    const invitee = item.invitee;
    const rating = apiHelpers.displayRating(invitee.attractiveness_score);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/user/${invitee.id}`)}
      >
        <Image
          source={{ uri: invitee.avatar_url || 'https://via.placeholder.com/70' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{invitee.full_name}</Text>
          <Text style={styles.college}>{invitee.college_name}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.rating}>⭐ {rating}/10</Text>
            <Text style={styles.inviteCount}>
              {item.total_invitations} invitation{item.total_invitations !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.lastInvited}>
            Last invited {new Date(item.last_invited_at).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity style={styles.inviteButton}>
          <Mail size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
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
      <Text style={styles.title}>Invitees</Text>
      <Text style={styles.subtitle}>{invitees.length} people invited</Text>

      {invitees.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No invitees yet</Text>
          <Text style={styles.emptySubtext}>
            Start inviting people to your events
          </Text>
        </View>
      ) : (
        <FlatList
          data={invitees}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadInvitees();
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
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
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 12,
  },
  inviteCount: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
  lastInvited: {
    fontSize: 12,
    color: '#999',
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5F8F0',
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
