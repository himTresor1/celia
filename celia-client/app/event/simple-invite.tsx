import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Check, Users } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { DUMMY_USERS } from '@/lib/dummyUsers';

interface UserProfile {
  id: string;
  full_name: string;
  college_name: string | null;
  photo_urls: any;
  interests: string[];
}

export default function SimpleInviteScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const eventId = params.eventId as string;

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    // Use dummy users directly - no database calls
    const availableUsers = DUMMY_USERS.filter(
      (u) => !user?.id || u.id !== user.id
    );
    setUsers(availableUsers);
    setLoading(false);
  };

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSendInvites = () => {
    if (selectedUsers.size === 0) {
      Alert.alert('No Users Selected', 'Please select at least one person to invite.');
      return;
    }

    setSaving(true);
    
    // Frontend only - no database calls
    Alert.alert(
      'Success!',
      `Sent ${selectedUsers.size} invitation${selectedUsers.size === 1 ? '' : 's'}!`,
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/events'),
        },
      ]
    );
    
    setSaving(false);
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => {
    const isSelected = selectedUsers.has(item.id);
    const photoUrl = item.photo_urls?.[0] || null;

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => toggleUser(item.id)}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.userPhoto} />
        ) : (
          <View style={styles.userPhotoPlaceholder}>
            <Users size={32} color="#ccc" />
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name}</Text>
          {item.college_name && (
            <Text style={styles.userCollege}>{item.college_name}</Text>
          )}
          {item.interests && item.interests.length > 0 && (
            <Text style={styles.userInterests} numberOfLines={1}>
              {item.interests.slice(0, 2).join(', ')}
            </Text>
          )}
        </View>

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={20} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3AFF6E" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite People</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.selectionInfo}>
        <Text style={styles.selectionText}>
          {selectedUsers.size} {selectedUsers.size === 1 ? 'person' : 'people'} selected
        </Text>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Users size={64} color="#ccc" />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            There are no other users to invite yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendButton, (selectedUsers.size === 0 || saving) && styles.sendButtonDisabled]}
          onPress={handleSendInvites}
          disabled={selectedUsers.size === 0 || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>
              Send {selectedUsers.size > 0 ? `${selectedUsers.size} ` : ''}Invitation{selectedUsers.size !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  selectionInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  selectionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  userItemSelected: {
    borderColor: '#3AFF6E',
    backgroundColor: '#f0fff4',
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userCollege: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userInterests: {
    fontSize: 12,
    color: '#999',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sendButton: {
    backgroundColor: '#3AFF6E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
