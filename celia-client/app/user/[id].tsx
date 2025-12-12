import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DUMMY_USERS } from '@/lib/dummyUsers';
import {
  ChevronLeft,
  MapPin,
  Heart,
  GraduationCap,
  Mail,
  Calendar,
  Users,
  Flag,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  college_name: string | null;
  major: string | null;
  graduation_year: number | null;
  bio: string;
  photo_urls: any;
  interests: string[];
  preferred_locations: string[];
}

interface UserStats {
  eventsHosted: number;
  eventsAttended: number;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile: authProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ eventsHosted: 0, eventsAttended: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [myEvents, setMyEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchMyEvents();
  }, []);

  const fetchProfile = async () => {
    if (id === user?.id && authProfile) {
      setProfile(authProfile as any);
      setLoading(false);
      return;
    }

    const dummyUser = DUMMY_USERS.find(u => u.id === id);
    if (dummyUser) {
      setProfile(dummyUser as any);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getUser(id);
      setProfile(data as any);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const hostedEvents = await api.getUserHostedEvents(id);
      const attendedEvents = await api.getUserAttendingEvents(id);

      setStats({
        eventsHosted: hostedEvents.length,
        eventsAttended: attendedEvents.length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const data = await api.getMyEvents();
      setMyEvents(data);
    } catch (error) {
      console.error('Failed to fetch my events:', error);
    }
  };

  const handleInviteToEvent = async (eventId: string) => {
    try {
      await api.createInvitation({
        eventId,
        inviteeId: id,
      });
      Alert.alert('Success', `Invitation sent to ${profile?.full_name}!`);
      setShowInviteModal(false);
    } catch (error: any) {
      if (error.message?.includes('already')) {
        Alert.alert('Already Invited', 'This person is already invited to this event.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send invitation');
      }
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Report Profile',
      'Are you sure you want to report this profile as inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Reported', 'Thank you for your report. We will review this profile.');
          },
        },
      ]
    );
  };

  if (loading || !profile) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const photos = profile.photo_urls || [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          {photos.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentPhotoIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {photos.map((photo: string, index: number) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.photo}
                  />
                ))}
              </ScrollView>
              {photos.length > 1 && (
                <View style={styles.photoIndicators}>
                  {photos.map((_: any, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.photoIndicator,
                        currentPhotoIndex === index && styles.photoIndicatorActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Users size={64} color="#ccc" />
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleReport}
          >
            <Flag size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileContent}>
          <Text style={styles.name}>{profile.full_name}</Text>

          {profile.college_name && (
            <View style={styles.infoRow}>
              <GraduationCap size={20} color="#666" />
              <Text style={styles.infoText}>
                {profile.college_name}
                {profile.major && ` • ${profile.major}`}
                {profile.graduation_year && ` • Class of ${profile.graduation_year}`}
              </Text>
            </View>
          )}

          {profile.preferred_locations && profile.preferred_locations.length > 0 && (
            <View style={styles.infoRow}>
              <MapPin size={20} color="#666" />
              <Text style={styles.infoText}>
                {profile.preferred_locations.join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.eventsHosted}</Text>
              <Text style={styles.statLabel}>Events Hosted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.eventsAttended}</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
          </View>

          {profile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestsGrid}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Heart size={12} color="#3AFF6E" fill="#3AFF6E" />
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => setShowInviteModal(true)}
          >
            <Mail size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>Invite to Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showInviteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite to Event</Text>
              <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                <ChevronLeft size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select an event to invite {profile.full_name?.split(' ')[0]} to:
            </Text>

            {myEvents.length === 0 ? (
              <View style={styles.emptyEvents}>
                <Calendar size={48} color="#ccc" />
                <Text style={styles.emptyEventsText}>No upcoming events</Text>
                <Text style={styles.emptyEventsSubtext}>
                  Create an event first to invite people
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
                {myEvents.map((event) => {
                  const coverPhoto = event.photo_urls?.[0] || null;
                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventCard}
                      onPress={() => handleInviteToEvent(event.id)}
                    >
                      {coverPhoto && (
                        <Image
                          source={{ uri: coverPhoto }}
                          style={styles.eventPhoto}
                        />
                      )}
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventName} numberOfLines={1}>
                          {event.name}
                        </Text>
                        <View style={styles.eventDetails}>
                          <Calendar size={14} color="#666" />
                          <Text style={styles.eventDetailText}>
                            {event.event_date}
                          </Text>
                        </View>
                        <View style={styles.eventDetails}>
                          <MapPin size={14} color="#666" />
                          <Text style={styles.eventDetailText} numberOfLines={1}>
                            {event.location_name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  photoSection: {
    position: 'relative',
    height: 400,
  },
  photo: {
    width,
    height: 400,
  },
  photoPlaceholder: {
    width,
    height: 400,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContent: {
    padding: 24,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#e8f4ff',
  },
  interestTagText: {
    fontSize: 14,
    color: '#3AFF6E',
    fontWeight: '500',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3AFF6E',
    marginTop: 8,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  emptyEvents: {
    alignItems: 'center',
    padding: 48,
  },
  emptyEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyEventsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  eventsList: {
    maxHeight: 400,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventPhoto: {
    width: 80,
    height: 80,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});
