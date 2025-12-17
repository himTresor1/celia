import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Camera, X, MapPin, GraduationCap, Heart } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface College {
  id: string;
  name: string;
  domain: string | null;
  location: string | null;
}

interface Interest {
  id: string;
  name: string;
}

export default function ProfileSetupScreen() {
  const { user, profile, completeProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [collegeEmail, setCollegeEmail] = useState('');
  const [collegeEmailSent, setCollegeEmailSent] = useState(false);
  const [collegeEmailVerified, setCollegeEmailVerified] = useState(false);
  const [collegeOtp, setCollegeOtp] = useState('');
  const [generatedCollegeOtp, setGeneratedCollegeOtp] = useState<string | null>(
    null
  );
  const [sendingCollegeOtp, setSendingCollegeOtp] = useState(false);
  const [collegeOtpError, setCollegeOtpError] = useState<string | null>(null);
  const [showCollegeVerificationModal, setShowCollegeVerificationModal] =
    useState(false);
  const [collegeEmailError, setCollegeEmailError] = useState<string | null>(
    null
  );
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');

  const [collegeSearch, setCollegeSearch] = useState('');

  const colleges: College[] = [
    {
      id: '1',
      name: 'Harvard University',
      domain: 'harvard.edu',
      location: 'Cambridge, MA',
    },
    {
      id: '2',
      name: 'Stanford University',
      domain: 'stanford.edu',
      location: 'Stanford, CA',
    },
    { id: '3', name: 'MIT', domain: 'mit.edu', location: 'Cambridge, MA' },
    {
      id: '4',
      name: 'Yale University',
      domain: 'yale.edu',
      location: 'New Haven, CT',
    },
    {
      id: '5',
      name: 'Princeton University',
      domain: 'princeton.edu',
      location: 'Princeton, NJ',
    },
    {
      id: '6',
      name: 'Columbia University',
      domain: 'columbia.edu',
      location: 'New York, NY',
    },
    {
      id: '7',
      name: 'University of Chicago',
      domain: 'uchicago.edu',
      location: 'Chicago, IL',
    },
    {
      id: '8',
      name: 'UC Berkeley',
      domain: 'berkeley.edu',
      location: 'Berkeley, CA',
    },
    { id: '9', name: 'UCLA', domain: 'ucla.edu', location: 'Los Angeles, CA' },
    {
      id: '10',
      name: 'Cornell University',
      domain: 'cornell.edu',
      location: 'Ithaca, NY',
    },
  ];

  const interests: Interest[] = [
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

  const handleAddPhotoUrl = async () => {
    if (photoUrls.length >= 5) {
      Alert.alert('Maximum Photos', 'You can only add up to 5 photos');
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Permission to access camera roll is required!'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUrls([...photoUrls, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  // Check if profile is already completed and load existing data
  useEffect(() => {
    const initializeProfile = async () => {
      if (!user || !profile) {
        setInitializing(false);
        return;
      }

      // If profile is already completed, redirect to main app
      if (profile.is_profile_completed) {
        router.replace('/(tabs)');
        return;
      }

      // Load existing profile data if available
      if (profile.full_name) {
        setFullName(profile.full_name);
      }
      if (profile.bio) {
        setBio(profile.bio);
      }
      if (
        profile.photo_urls &&
        Array.isArray(profile.photo_urls) &&
        profile.photo_urls.length > 0
      ) {
        setPhotoUrls(profile.photo_urls);
      }
      if (
        profile.interests &&
        Array.isArray(profile.interests) &&
        profile.interests.length > 0
      ) {
        setSelectedInterests(profile.interests);
      }
      if (profile.college_name) {
        const existingCollege = colleges.find(
          (c) => c.name === profile.college_name
        );
        if (existingCollege) {
          setSelectedCollege(existingCollege);
        }
      }
      if (profile.college_verified) {
        setCollegeEmailVerified(true);
      }
      if (
        profile.preferred_locations &&
        Array.isArray(profile.preferred_locations) &&
        profile.preferred_locations.length > 0
      ) {
        setPreferredLocations(profile.preferred_locations);
      }

      setInitializing(false);
    };

    initializeProfile();
  }, [user, profile]);

  const toggleInterest = (interestName: string) => {
    if (selectedInterests.includes(interestName)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interestName));
    } else if (selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interestName]);
    }
  };

  const handleAddLocation = () => {
    if (locationInput.trim() && preferredLocations.length < 3) {
      setPreferredLocations([...preferredLocations, locationInput.trim()]);
      setLocationInput('');
    }
  };

  const handleRemoveLocation = (index: number) => {
    setPreferredLocations(preferredLocations.filter((_, i) => i !== index));
  };

  const isCollegeEmailValid = (email: string): boolean => {
    if (!email.trim() || !selectedCollege) return false;

    const emailLower = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailLower)) return false;

    if (selectedCollege.domain) {
      const expectedDomain = `@${selectedCollege.domain.toLowerCase()}`;
      return emailLower.endsWith(expectedDomain);
    }

    return true;
  };

  const handleSendCollegeVerificationCode = () => {
    if (!selectedCollege) {
      setCollegeEmailError('Please select your college first');
      return;
    }

    const email = collegeEmail.trim().toLowerCase();
    if (!email) {
      setCollegeEmailError('Please enter your college email');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setCollegeEmailError('Please enter a valid email address');
      return;
    }

    // Enforce college domain when available
    if (selectedCollege.domain) {
      const expectedDomain = `@${selectedCollege.domain.toLowerCase()}`;
      if (!email.endsWith(expectedDomain)) {
        setCollegeEmailError(
          `Please use your ${selectedCollege.domain} email address`
        );
        return;
      }
    }

    setCollegeEmailError(null);
    setSendingCollegeOtp(true);

    try {
      // For now we generate a local OTP. In production this would be sent via email.
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCollegeOtp(code);
      setCollegeEmailSent(true);
      setCollegeOtp('');
      setCollegeOtpError(null);
      setCollegeEmailVerified(false);

      Alert.alert(
        'Verification code sent',
        `Enter the 6-digit code we sent to ${email}.\n\n(Dev note: in this build the code is ${code}. In production this will be emailed to the user.)`
      );
    } finally {
      setSendingCollegeOtp(false);
    }
  };

  const handleVerifyCollegeOtp = () => {
    if (!generatedCollegeOtp) {
      setCollegeOtpError('Please request a verification code first');
      return;
    }

    if (!collegeOtp || collegeOtp.length !== 6) {
      setCollegeOtpError('Please enter the 6-digit code');
      return;
    }

    if (collegeOtp !== generatedCollegeOtp) {
      setCollegeOtpError('Incorrect code. Please try again.');
      return;
    }

    setCollegeOtpError(null);
    setCollegeEmailVerified(true);
    setGeneratedCollegeOtp(null);

    Alert.alert('Verified', 'Your college email has been verified.');
  };

  const validateStep = () => {
    setError(null);

    if (step === 1) {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        return false;
      }
      if (photoUrls.length === 0) {
        setError('Please add at least 1 photo');
        return false;
      }
      if (bio.length > 0 && (bio.length < 50 || bio.length > 500)) {
        setError('Bio must be between 50 and 500 characters');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (selectedInterests.length < 3) {
        setError('Please select at least 3 interests');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!selectedCollege) {
        setError('Please select your college');
        return false;
      }
      if (!collegeEmailVerified) {
        setError('Please verify your college email');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError(null);

    try {
      const profileData = {
        fullName,
        bio: bio.trim() || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        interests: selectedInterests,
        collegeName: selectedCollege?.name,
        collegeId: selectedCollege?.id,
        collegeVerified: collegeEmailVerified,
        preferredLocations,
        profileCompleted: true,
      };

      await api.updateUser(user!.id, profileData);
      await completeProfile();
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Error completing profile:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to save profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const renderProgressBar = () => (
    <View style={styles.progressBar}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={[styles.progressDot, step >= s && styles.progressDotActive]}
        />
      ))}
    </View>
  );

  // Show loading while checking profile status
  if (initializing) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3AFF6E" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Step {step} of 4</Text>
        {renderProgressBar()}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Create Your Profile</Text>
            <Text style={styles.stepSubtitle}>
              Add photos and tell us about yourself
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Photos * (1-5 photos, minimum 1 required)
              </Text>
              <View style={styles.photosContainer}>
                {photoUrls.map((url, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: url }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photoUrls.length < 5 && (
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={handleAddPhotoUrl}
                  >
                    <Camera size={32} color="#666" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.helperText}>
                For this demo, we're using placeholder images. In production,
                you'd integrate with expo-image-picker.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio (50-500 characters)</Text>
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
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Your Interests</Text>
            <Text style={styles.stepSubtitle}>
              Choose 3-10 interests (Selected: {selectedInterests.length})
            </Text>

            <View style={styles.interestsGrid}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    selectedInterests.includes(interest.name) &&
                      styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.name)}
                >
                  <Heart
                    size={16}
                    color={
                      selectedInterests.includes(interest.name)
                        ? '#fff'
                        : '#666'
                    }
                    fill={
                      selectedInterests.includes(interest.name)
                        ? '#fff'
                        : 'none'
                    }
                  />
                  <Text
                    style={[
                      styles.interestChipText,
                      selectedInterests.includes(interest.name) &&
                        styles.interestChipTextSelected,
                    ]}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Your College</Text>
            <Text style={styles.stepSubtitle}>
              Choose your college from the list
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Search College *</Text>
              <View style={styles.searchContainer}>
                <GraduationCap size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search for your college..."
                  value={collegeSearch}
                  onChangeText={setCollegeSearch}
                />
              </View>
            </View>

            {selectedCollege && (
              <View style={styles.selectedCollegeCard}>
                <GraduationCap size={24} color="#3AFF6E" />
                <View style={styles.selectedCollegeInfo}>
                  <Text style={styles.selectedCollegeName}>
                    {selectedCollege.name}
                  </Text>
                  {selectedCollege.location && (
                    <Text style={styles.selectedCollegeLocation}>
                      {selectedCollege.location}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setSelectedCollege(null)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.collegesList}>
              {filteredColleges.map((college) => (
                <TouchableOpacity
                  key={college.id}
                  style={styles.collegeItem}
                  onPress={() => {
                    setSelectedCollege(college);
                    setCollegeSearch('');
                    setCollegeEmail('');
                    setCollegeEmailSent(false);
                    setCollegeOtp('');
                    setGeneratedCollegeOtp(null);
                    setCollegeOtpError(null);
                    setCollegeEmailError(null);
                    setCollegeEmailVerified(false);
                    setShowCollegeVerificationModal(true);
                  }}
                >
                  <Text style={styles.collegeName}>{college.name}</Text>
                  {college.location && (
                    <Text style={styles.collegeLocation}>
                      {college.location}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Preferred Cities</Text>
            <Text style={styles.stepSubtitle}>
              Select up to 3 cities where you'd like to attend events
            </Text>
            <Text style={styles.stepSubtitle}>
              Select up to 3 cities where you'd like to attend events (Optional)
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Add City (up to 3)</Text>
              <View style={styles.locationInputContainer}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.locationInput}
                  placeholder="e.g., New York, Los Angeles, Boston"
                  value={locationInput}
                  onChangeText={setLocationInput}
                />
                <TouchableOpacity
                  style={styles.addLocationButton}
                  onPress={handleAddLocation}
                  disabled={preferredLocations.length >= 3}
                >
                  <Text style={styles.addLocationButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {preferredLocations.length > 0 && (
              <View style={styles.locationsList}>
                {preferredLocations.map((location, index) => (
                  <View key={index} style={styles.locationChip}>
                    <MapPin size={16} color="#3AFF6E" />
                    <Text style={styles.locationChipText}>{location}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveLocation(index)}
                    >
                      <X size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            loading && styles.nextButtonDisabled,
            step === 1 && styles.nextButtonFull,
          ]}
          onPress={step === 4 ? handleComplete : handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Creating Profile...' : step === 4 ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* College Email Verification Modal */}
      <Modal
        visible={showCollegeVerificationModal && selectedCollege !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCollegeVerificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCollegeVerificationModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <GraduationCap size={24} color="#3AFF6E" />
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Verify Your College</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedCollege?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowCollegeVerificationModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Enter your college email address to verify your student
                  status. We'll send you a verification code.
                </Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>College Email *</Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      collegeEmailVerified && styles.modalInputDisabled,
                      collegeEmailError && styles.modalInputError,
                    ]}
                    placeholder={`your-email@${
                      selectedCollege?.domain || 'edu'
                    }`}
                    value={collegeEmail}
                    onChangeText={(text) => {
                      setCollegeEmail(text);
                      setCollegeEmailError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!collegeEmailVerified}
                    placeholderTextColor="#999"
                  />
                  {collegeEmailError && (
                    <Text style={styles.modalErrorText}>
                      {collegeEmailError}
                    </Text>
                  )}
                </View>

                {!collegeEmailSent && (
                  <TouchableOpacity
                    style={[
                      styles.modalSendCodeButton,
                      (sendingCollegeOtp ||
                        collegeEmailVerified ||
                        !isCollegeEmailValid(collegeEmail)) &&
                        styles.modalSendCodeButtonDisabled,
                    ]}
                    onPress={handleSendCollegeVerificationCode}
                    disabled={
                      sendingCollegeOtp ||
                      collegeEmailVerified ||
                      !isCollegeEmailValid(collegeEmail)
                    }
                  >
                    {sendingCollegeOtp ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalSendCodeButtonText}>
                        Send Verification Code
                      </Text>
                    )}
                  </TouchableOpacity>
                )}

                {collegeEmailSent && !collegeEmailVerified && (
                  <View style={styles.modalOtpSection}>
                    <Text style={styles.modalLabel}>Verification Code</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Enter 6-digit code"
                      value={collegeOtp}
                      onChangeText={setCollegeOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholderTextColor="#999"
                    />
                    {collegeOtpError && (
                      <Text style={styles.modalErrorText}>
                        {collegeOtpError}
                      </Text>
                    )}
                    <View style={styles.modalOtpActions}>
                      <TouchableOpacity
                        style={styles.modalResendButton}
                        onPress={handleSendCollegeVerificationCode}
                        disabled={sendingCollegeOtp}
                      >
                        {sendingCollegeOtp ? (
                          <ActivityIndicator size="small" color="#666" />
                        ) : (
                          <Text style={styles.modalResendButtonText}>
                            Resend Code
                          </Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalVerifyButton,
                          !collegeOtp.trim() &&
                            styles.modalVerifyButtonDisabled,
                        ]}
                        onPress={handleVerifyCollegeOtp}
                        disabled={!collegeOtp.trim()}
                      >
                        <Text style={styles.modalVerifyButtonText}>
                          Verify Code
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {collegeEmailVerified && (
                  <View style={styles.modalVerifiedBadge}>
                    <Text style={styles.modalVerifiedBadgeText}>
                      ✓ Email verified successfully
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {collegeEmailVerified && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setShowCollegeVerificationModal(false)}
                >
                  <Text style={styles.modalDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#3AFF6E',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcc',
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  stepContainer: {
    gap: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  inlineError: {
    fontSize: 12,
    color: '#c00',
    marginTop: 4,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    color: '#666',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  selectedCollegeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3AFF6E',
  },
  selectedCollegeInfo: {
    flex: 1,
  },
  selectedCollegeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  selectedCollegeLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  collegesList: {
    maxHeight: 300,
    gap: 8,
  },
  collegeItem: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  collegeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  collegeLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  collegeEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collegeEmailInput: {
    flex: 1,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  sendCodeButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#3AFF6E',
  },
  sendCodeButtonDisabled: {
    backgroundColor: '#b7f5c9',
  },
  sendCodeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  collegeOtpContainer: {
    marginTop: 12,
    gap: 8,
  },
  verifyCodeButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  verifyCodeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  verifiedBadge: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#1a8f4d',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
  },
  addLocationButton: {
    backgroundColor: '#3AFF6E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  locationsList: {
    gap: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  locationChipText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3AFF6E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '55%',
    minHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    flex: 1,
  },
  modalBody: {
    padding: 20,
    gap: 20,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  modalInputGroup: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1a1a1a',
  },
  modalInputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  modalInputError: {
    borderColor: '#FF3B30',
  },
  modalSendCodeButton: {
    backgroundColor: '#3AFF6E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalSendCodeButtonDisabled: {
    backgroundColor: '#b7f5c9',
  },
  modalSendCodeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOtpSection: {
    gap: 12,
    marginTop: 8,
  },
  modalOtpActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalResendButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalResendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalErrorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: -4,
  },
  modalHelperText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: -4,
  },
  modalVerifyButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  modalVerifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalVerifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalVerifiedBadge: {
    backgroundColor: '#F0FFF7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3AFF6E',
    alignItems: 'center',
  },
  modalVerifiedBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a8f4d',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalDoneButton: {
    backgroundColor: '#3AFF6E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
