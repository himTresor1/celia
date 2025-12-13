import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiHelpers } from '@/lib/apiHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, Send, User as UserIcon, Calendar, MapPin, Users } from 'lucide-react-native';
import { DUMMY_USERS } from '@/lib/dummyUsers';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  start_time: string;
  location_name: string;
  photo_urls: any;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  photo_urls: any;
}

export default function SendInvitationsScreen() {
  const { eventId, selectedUserIds } = useLocalSearchParams<{
    eventId: string;
    selectedUserIds: string;
  }>();
  const { user } = useAuth();

  const dummyEvent: Event = {
    id: eventId,
    name: 'Study Session',
    description: 'Group study for final exams',
    event_date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '20:00',
    location_name: 'Main Library',
    photo_urls: ['https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'],
    category_id: '1',
    interest_tags: ['Reading & Writing', 'Science & Research'],
    capacity_limit: 10,
    is_public: false,
    status: 'active',
    host_id: user?.id || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const dummyGuests: UserProfile[] = selectedUserIds
    ? selectedUserIds.split(',').map((id) => {
        // Find the user in DUMMY_USERS by ID
        const user = DUMMY_USERS.find((u) => u.id === id);
        if (user) {
          return {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            photo_urls: user.photo_urls,
          };
        }
        // Fallback if user not found
        return {
          id,
          full_name: 'Guest',
          email: 'guest@example.com',
          photo_urls: [],
        };
      })
    : [];

  const [event] = useState<Event>(dummyEvent);
  const [guests, setGuests] = useState<UserProfile[]>(dummyGuests);
  const [personalMessage, setPersonalMessage] = useState('');
  const [loading] = useState(false);
  const [sendingInvitations, setSendingInvitations] = useState(false);

  const handleSendInvitations = async () => {
    if (!event || guests.length === 0) return;

    setSendingInvitations(true);

    try {
      const guestIds = guests.map(g => g.id);

      const { data, error } = await apiHelpers.bulkInviteToEvent(
        eventId,
        guestIds,
        personalMessage || undefined
      );

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      Alert.alert(
        'Success!',
        `${data.invitations.length} invitation${data.invitations.length !== 1 ? 's' : ''} sent successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/events'),
          },
        ]
      );

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send invitations');
    } finally {
      setSendingInvitations(false);
    }
  };

  const handleRemoveGuest = (guestId: string) => {
    const updatedGuests = guests.filter((g) => g.id !== guestId);
    setGuests(updatedGuests);

    if (updatedGuests.length === 0) {
      router.back();
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </View>
    );
  }

  const coverPhoto = event.photo_urls?.[0] || null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#3AFF6E" />
        </TouchableOpacity>
        <Text style={styles.title}>Send Invitations</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eventSummaryCard}>
          <Text style={styles.sectionTitle}>Event Summary</Text>
          {coverPhoto && (
            <Image source={{ uri: coverPhoto }} style={styles.coverPhoto} />
          )}
          <View style={styles.eventDetails}>
            <Text style={styles.eventName}>{event.name}</Text>
            <View style={styles.eventDetailRow}>
              <Calendar size={16} color="#666" />
              <Text style={styles.eventDetailText}>
                {event.event_date} at {event.start_time}
              </Text>
            </View>
            <View style={styles.eventDetailRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.eventDetailText}>{event.location_name}</Text>
            </View>
            <View style={styles.eventDetailRow}>
              <Users size={16} color="#666" />
              <Text style={styles.eventDetailText}>
                {guests.length} {guests.length === 1 ? 'guest' : 'guests'} invited
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invited Guests</Text>
          <View style={styles.guestsList}>
            {guests.map((guest) => {
              const photoUrl = guest.photo_urls?.[0] || null;
              return (
                <View key={guest.id} style={styles.guestItem}>
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.guestPhoto} />
                  ) : (
                    <View style={styles.guestPhotoPlaceholder}>
                      <UserIcon size={20} color="#666" />
                    </View>
                  )}
                  <View style={styles.guestInfo}>
                    <Text style={styles.guestName}>{guest.full_name}</Text>
                    <Text style={styles.guestEmail}>{guest.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveGuest(guest.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Personal Message (Optional, 0-200 characters)
          </Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Add a personal message to your invitation..."
            value={personalMessage}
            onChangeText={setPersonalMessage}
            multiline
            numberOfLines={4}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {personalMessage.length}/200
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            • Guests will receive an invitation notification
          </Text>
          <Text style={styles.infoText}>
            • They can RSVP as "Going" or "Decline"
          </Text>
          <Text style={styles.infoText}>
            • You'll be able to see all RSVPs in the guest list
          </Text>
          <Text style={styles.infoText}>
            • Your event will appear in the Events tab
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            sendingInvitations && styles.sendButtonDisabled,
          ]}
          onPress={handleSendInvitations}
          disabled={sendingInvitations}
        >
          <Send size={20} color="#fff" />
          <Text style={styles.sendButtonText}>
            {sendingInvitations
              ? 'Sending...'
              : `Send ${guests.length} ${guests.length === 1 ? 'Invitation' : 'Invitations'}`}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
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
  eventSummaryCard: {
    margin: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverPhoto: {
    width: '100%',
    height: 180,
  },
  eventDetails: {
    padding: 16,
    gap: 12,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  guestsList: {
    gap: 12,
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  guestPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  guestPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  guestEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#e8f4ff',
    borderRadius: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#3AFF6E',
    padding: 16,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
