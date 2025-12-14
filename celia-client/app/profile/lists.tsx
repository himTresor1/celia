import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Users, Mail, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { theme } from '@/constants/theme';

export default function MyListsScreen() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    saved: 0,
    friends: 0,
    invitees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [savedResult, friendsResult, inviteesResult] = await Promise.all([
        apiHelpers.getSavedUsers(user.id),
        apiHelpers.getFriends(user.id),
        apiHelpers.getInvitees(user.id),
      ]);

      setCounts({
        saved: savedResult.data?.length || 0,
        friends: friendsResult.data?.length || 0,
        invitees: inviteesResult.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading counts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Lists</Text>
      <Text style={styles.subtitle}>
        Manage your connections and saved users
      </Text>

      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push('/profile/saved')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
          <Heart size={28} color="#FF3B30" fill="#FF3B30" />
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.listName}>Saved List</Text>
          <Text style={styles.listDescription}>
            Users you've saved for future invitations
          </Text>
          <Text style={styles.listCount}>{counts.saved} people</Text>
        </View>
        <ChevronRight size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push('/profile/friends')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#E5F1FF' }]}>
          <Users size={28} color="#007AFF" />
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.listName}>Friends</Text>
          <Text style={styles.listDescription}>Connected via Energy Pulse</Text>
          <Text style={styles.listCount}>{counts.friends} friends</Text>
        </View>
        <ChevronRight size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.listCard}
        onPress={() => router.push('/profile/invitees')}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#FFF3E5' }]}>
          <Mail size={28} color="#FF9500" />
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.listName}>Invitees</Text>
          <Text style={styles.listDescription}>
            Everyone you've ever invited
          </Text>
          <Text style={styles.listCount}>{counts.invitees} people</Text>
        </View>
        <ChevronRight size={24} color="#666" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  listCount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
