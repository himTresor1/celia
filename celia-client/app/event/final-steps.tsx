import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Users, Edit, Check, X } from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { DUMMY_USERS } from '@/lib/dummyUsers';

interface UserProfile {
  id: string;
  full_name: string;
  college_name: string | null;
  photo_urls: any;
  interests: string[];
}

export default function EventFinalStepsScreen() {
  const { eventId, invitedUserIds } = useLocalSearchParams<{
    eventId: string;
    invitedUserIds: string;
  }>();

  const [invitedUsers, setInvitedUsers] = useState<UserProfile[]>(() => {
    const ids = invitedUserIds ? invitedUserIds.split(',') : [];
    return DUMMY_USERS.filter((u) => ids.includes(u.id)) as UserProfile[];
  });

  const handleRemove = (userId: string) => {
    setInvitedUsers(invitedUsers.filter((u) => u.id !== userId));
  };

  const handleConfirm = () => {
    // In production, send invitations via API
    router.push({
      pathname: '/event/[id]',
      params: { id: eventId },
    });
  };

  const handleEdit = () => {
    router.push({
      pathname: '/event/invite-swipe',
      params: {
        eventId,
        savedUserIds: invitedUsers.map((u) => u.id).join(','),
      },
    });
  };

  const renderUserCard = ({ item }: { item: UserProfile }) => {
    const photoUrl = item.photo_urls?.[0] || null;

    return (
      <View style={styles.userCard}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.userImage} />
        ) : (
          <View style={styles.userImagePlaceholder} />
        )}
        <View style={styles.userContent}>
          <Text style={styles.userName}>{item.full_name}</Text>
          {item.college_name && (
            <Text style={styles.userCollege}>{item.college_name}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
        >
          <X size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Review Invitations</Text>
          <Text style={styles.subtitle}>
            {invitedUsers.length}{' '}
            {invitedUsers.length === 1 ? 'person' : 'people'} invited
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Users size={24} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Invitation Summary</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{invitedUsers.length}</Text>
              <Text style={styles.statLabel}>Total Invited</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Accepted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Invited People</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Edit size={16} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {invitedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No one invited yet</Text>
              <Text style={styles.emptySubtext}>
                Tap Edit to add people to your event
              </Text>
            </View>
          ) : (
            <FlatList
              data={invitedUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.listRow}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>

        <View style={styles.suggestionsCard}>
          <Text style={styles.suggestionsTitle}>💡 Suggestions</Text>
          <Text style={styles.suggestionsText}>
            • Consider inviting people with similar interests{'\n'}• Mix of
            personalities can make events more fun{'\n'}• Check saved collection
            for people you liked before
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            invitedUsers.length === 0 && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={invitedUsers.length === 0}
        >
          <Check size={20} color="#fff" />
          <Text style={styles.confirmButtonText}>
            Confirm & Send {invitedUsers.length}{' '}
            {invitedUsers.length === 1 ? 'Invitation' : 'Invitations'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  listContent: {
    gap: 12,
  },
  listRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userCard: {
    width: '48%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.border,
  },
  userImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.border,
  },
  userContent: {
    padding: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  userCollege: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  suggestionsCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0F0FF',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  suggestionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#fff',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
