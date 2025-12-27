import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import {
  User,
  LogOut,
  Settings,
  Heart,
  MapPin,
  GraduationCap,
  CheckCircle,
  Users,
  Mail,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { apiHelpers } from '@/lib/apiHelpers';

export default function ProfileScreen() {
  const { profile, signOut, user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const { data } = await apiHelpers.getUserStats(user.id);
    if (data) {
      setStats(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const photoUrls = profile?.photo_urls as any;
  const photos = Array.isArray(photoUrls) ? photoUrls : [];
  const interests = profile?.interests || [];
  const locations = profile?.preferred_locations || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Settings size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          {photos.length > 0 ? (
            <View style={styles.photosContainer}>
              {photos.slice(0, 3).map((url: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: url }}
                  style={styles.profilePhoto}
                />
              ))}
              {photos.length > 3 && (
                <View style={styles.morePhotos}>
                  <Text style={styles.morePhotosText}>
                    +{photos.length - 3}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.avatarContainer}>
              <User size={48} color="#3AFF6E" />
            </View>
          )}

          <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>

          {profile?.bio && (
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}
        </View>

        {stats && (
          <View style={styles.metricsSection}>
            <View style={styles.metricCard}>
              <Calendar size={24} color="#3AFF6E" />
              <Text style={styles.metricNumber}>{stats.eventsCreated}</Text>
              <Text style={styles.metricLabel}>Events Created</Text>
            </View>
            <View style={styles.metricCard}>
              <Mail size={24} color="#FF9500" />
              <Text style={styles.metricNumber}>
                {stats.invitationsReceived}
              </Text>
              <Text style={styles.metricLabel}>Invitations</Text>
            </View>
            <View style={styles.metricCard}>
              <Users size={24} color="#007AFF" />
              <Text style={styles.metricNumber}>{stats.friendsCount}</Text>
              <Text style={styles.metricLabel}>Friends</Text>
            </View>
          </View>
        )}

        {stats && (
          <View style={styles.attractivenessSection}>
            <Text style={styles.attractivenessLabel}>
              Attractiveness Rating
            </Text>
            <Text style={styles.attractivenessScore}>⭐ {stats.rating}/10</Text>
            <Text style={styles.streakText}>
              🔥 {stats.socialStreakDays || 0} day streak
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.listsButton}
          onPress={() => router.push('/(tabs)/friends')}
        >
          <View style={styles.listsButtonContent}>
            <Users size={24} color="#3AFF6E" />
            <Text style={styles.listsButtonText}>Friends & Requests</Text>
          </View>
          <ChevronRight size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listsButton}
          onPress={() => router.push('/profile/lists')}
        >
          <View style={styles.listsButtonContent}>
            <Users size={24} color="#3AFF6E" />
            <Text style={styles.listsButtonText}>My Lists</Text>
          </View>
          <ChevronRight size={24} color="#666" />
        </TouchableOpacity>

        {profile?.college_name && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.collegeCard}>
              <GraduationCap size={24} color="#3AFF6E" />
              <View style={styles.collegeInfo}>
                <View style={styles.collegeHeader}>
                  <Text style={styles.collegeName}>{profile.college_name}</Text>
                  {profile.college_verified && (
                    <CheckCircle size={16} color="#34C759" />
                  )}
                </View>
                {profile.major && (
                  <Text style={styles.collegeMajor}>{profile.major}</Text>
                )}
                {profile.graduation_year && (
                  <Text style={styles.collegeYear}>
                    Class of {profile.graduation_year}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {interests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#1a1a1a" />
              <Text style={styles.sectionTitle}>Interests</Text>
            </View>
            <View style={styles.interestsContainer}>
              {interests.map((interest: string, index: number) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {locations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#1a1a1a" />
              <Text style={styles.sectionTitle}>Preferred Cities</Text>
            </View>
            <View style={styles.locationsContainer}>
              {locations.map((location: string, index: number) => (
                <View key={index} style={styles.locationCard}>
                  <MapPin size={16} color="#3AFF6E" />
                  <Text style={styles.locationText}>{location}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              console.log('Navigating to Edit Profile');
              router.push('/profile/edit');
            }}
          >
            <Settings size={20} color="#3AFF6E" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#FF3B30" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  morePhotos: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePhotosText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  bioCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    width: '100%',
  },
  bioText: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    textAlign: 'center',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  collegeCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  collegeInfo: {
    flex: 1,
  },
  collegeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  collegeMajor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  collegeYear: {
    fontSize: 14,
    color: '#999',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3AFF6E',
  },
  interestText: {
    fontSize: 14,
    color: '#3AFF6E',
    fontWeight: '500',
  },
  locationsContainer: {
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  actions: {
    padding: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3AFF6E',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  metricsSection: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  attractivenessSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
  },
  attractivenessLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  attractivenessScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3AFF6E',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '600',
  },
  listsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3AFF6E',
  },
  listsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listsButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
