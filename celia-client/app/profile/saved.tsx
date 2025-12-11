import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { X, Mail } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { theme } from '@/constants/theme';

export default function SavedListScreen() {
  const { user } = useAuth();
  const [savedUsers, setSavedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedUsers();
  }, []);

  const loadSavedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await apiHelpers.getSavedUsers(user.id);
      if (data) {
        setSavedUsers(data);
      }
    } catch (error) {
      console.error('Error loading saved users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemove = async (savedUserId: string) => {
    if (!user) return;

    const { error } = await apiHelpers.removeFromSaved(user.id, savedUserId);
    if (!error) {
      setSavedUsers((prev) => prev.filter((item) => item.saved_user_id !== savedUserId));
    }
  };

  const renderItem = ({ item }: any) => {
    const savedUser = item.saved_user;
    const rating = apiHelpers.displayRating(savedUser.attractiveness_score);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/user/${savedUser.id}`)}
      >
        <Image
          source={{ uri: savedUser.avatar_url || 'https://via.placeholder.com/80' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{savedUser.full_name}</Text>
          <Text style={styles.college}>{savedUser.college_name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>⭐ {rating}/10</Text>
            <Text style={styles.savedDate}>
              Saved {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(savedUser.id)}
          >
            <X size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
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
      <Text style={styles.title}>Saved List</Text>
      <Text style={styles.subtitle}>{savedUsers.length} people saved</Text>

      {savedUsers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No saved users yet</Text>
          <Text style={styles.emptySubtext}>
            Save users from discovery to invite them later
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadSavedUsers();
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
    justifyContent: 'center',
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
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 12,
  },
  savedDate: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    justifyContent: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE5E5',
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
