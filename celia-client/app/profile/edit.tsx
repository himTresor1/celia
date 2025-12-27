import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Save,
  GraduationCap,
  MapPin,
  Heart,
  X,
  Plus,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationPicker, { SelectedLocation } from '@/components/LocationPicker';
import { Colors, BorderRadius } from '@/constants/theme';

interface Interest {
  id: string;
  name: string;
}

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [collegeName, setCollegeName] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);

  // UI State
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const availableInterests: Interest[] = [
    { id: '1', name: 'Sports & Fitness' },
    { id: '2', name: 'Arts & Music' },
    { id: '3', name: 'Technology & Gaming' },
    { id: '4', name: 'Food & Cooking' },
    { id: '5', name: 'Travel & Adventure' },
    { id: '6', name: 'Reading & Writing' },
    { id: '7', name: 'Movies & TV' },
    { id: '8', name: 'Dance & Theater' },
    { id: '9', name: 'Photography & Design' },
    { id: '10', name: 'Outdoor Activities' },
    { id: '11', name: 'Science & Research' },
    { id: '12', name: 'Business & Entrepreneurship' },
    { id: '13', name: 'Fashion & Beauty' },
    { id: '14', name: 'Volunteering' },
    { id: '15', name: 'Social Justice & Activism' },
    { id: '16', name: 'Anime & Comics' },
    { id: '17', name: 'Yoga & Wellness' },
    { id: '18', name: 'Music Production' },
    { id: '19', name: 'Podcasting' },
    { id: '20', name: 'Environmental Sustainability' },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Use profile from auth context as base, but fetch fresh if needed
      // For now, we'll use what we have in context or fetch fresh
      const userData = await api.getUser(user.id);

      setCollegeName(userData.collegeName || '');
      setMajor(userData.major || '');
      setGraduationYear(
        userData.graduationYear ? userData.graduationYear.toString() : ''
      );
      setBio(userData.bio || '');
      setInterests(userData.interests || []);
      setPreferredLocations(userData.preferredLocations || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestName: string) => {
    if (interests.includes(interestName)) {
      setInterests(interests.filter((i) => i !== interestName));
    } else {
      if (interests.length >= 10) {
        Alert.alert('Limit Reached', 'You can select up to 10 interests');
        return;
      }
      setInterests([...interests, interestName]);
    }
  };

  const handleAddLocation = (location: SelectedLocation) => {
    if (preferredLocations.length >= 5) {
      Alert.alert(
        'Limit Reached',
        'You can select up to 5 preferred locations'
      );
      return;
    }

    // Check for duplicates
    if (preferredLocations.includes(location.name)) {
      Alert.alert('Duplicate', 'This location is already added');
      return;
    }

    setPreferredLocations([...preferredLocations, location.name]);
    setShowLocationPicker(false);
  };

  const removeLocation = (locationName: string) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== locationName));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const payload = {
        collegeName: collegeName.trim() || null,
        major: major.trim() || null,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        bio: bio.trim() || null,
        interests,
        preferredLocations,
        // Preserve other fields
        profileCompleted: true,
      };

      await api.updateUser(user.id, payload);

      // Refresh auth context
      if (refreshProfile) {
        await refreshProfile();
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3AFF6E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about yourself..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{bio.length}/500</Text>
            </View>
          </View>

          {/* Education Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <GraduationCap size={20} color="#1a1a1a" />
              <Text style={styles.sectionTitle}>Education</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>College / University</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Stanford University"
                value={collegeName}
                onChangeText={setCollegeName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Major</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChangeText={setMajor}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Class Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025"
                  value={graduationYear}
                  onChangeText={setGraduationYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#1a1a1a" />
              <Text style={styles.sectionTitle}>Interests</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Select 3-10 interests that describe you
            </Text>

            <View style={styles.interestsGrid}>
              {availableInterests.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    interests.includes(interest.name) &&
                      styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.name)}
                >
                  <Text
                    style={[
                      styles.interestChipText,
                      interests.includes(interest.name) &&
                        styles.interestChipTextSelected,
                    ]}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Locations Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#1a1a1a" />
              <Text style={styles.sectionTitle}>Preferred Locations</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Where are you looking to connect? (Max 5)
            </Text>

            <View style={styles.locationsList}>
              {preferredLocations.map((loc, index) => (
                <View key={index} style={styles.locationItem}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.locationText}>{loc}</Text>
                  <TouchableOpacity onPress={() => removeLocation(loc)}>
                    <X size={16} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}

              {preferredLocations.length < 5 && (
                <TouchableOpacity
                  style={styles.addLocationButton}
                  onPress={() => setShowLocationPicker(true)}
                >
                  <Plus size={16} color="#3AFF6E" />
                  <Text style={styles.addLocationText}>Add Location</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <LocationPicker onLocationSelect={handleAddLocation} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#3AFF6E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputContainer: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  textArea: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  interestChipSelected: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  interestChipText: {
    fontSize: 14,
    color: '#666',
  },
  interestChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  locationsList: {
    gap: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3AFF6E',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: 'rgba(58, 255, 110, 0.05)',
  },
  addLocationText: {
    fontSize: 15,
    color: '#3AFF6E',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
