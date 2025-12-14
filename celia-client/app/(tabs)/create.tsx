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
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Heart,
  Save,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import WebDatePicker from '@/components/WebDatePicker';

interface EventCategory {
  id: string;
  name: string;
  icon?: string | null;
}

interface Interest {
  id: string;
  name: string;
}

export default function CreateScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);

  // Helper to get default end time for web picker
  const getDefaultEndTime = () => {
    if (endTime) return endTime;
    const defaultEnd = new Date(startTime);
    defaultEnd.setHours(startTime.getHours() + 2, startTime.getMinutes(), 0, 0);
    return defaultEnd;
  };
  const [locationName, setLocationName] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<EventCategory | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [capacityLimit, setCapacityLimit] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

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
    if (photoUrls.length >= 10) {
      Alert.alert('Maximum Photos', 'You can only add up to 10 photos');
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
      aspect: [3, 2],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUrls([...photoUrls, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await api.getEventCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          { id: '1', name: 'Study Session', icon: '📚' },
          { id: '2', name: 'Social Hangout', icon: '🎉' },
          { id: '3', name: 'Sports & Fitness', icon: '⚽' },
          { id: '4', name: 'Food & Dining', icon: '🍕' },
          { id: '5', name: 'Arts & Culture', icon: '🎨' },
          { id: '6', name: 'Party', icon: '🎊' },
          { id: '7', name: 'Outdoor Adventure', icon: '🏕️' },
          { id: '8', name: 'Workshop', icon: '🔧' },
          { id: '9', name: 'Movie Night', icon: '🎬' },
          { id: '10', name: 'Game Night', icon: '🎮' },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const toggleInterest = (interestName: string) => {
    if (selectedInterests.includes(interestName)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interestName));
    } else {
      setSelectedInterests([...selectedInterests, interestName]);
    }
  };

  const validateStep = () => {
    setError(null);

    if (step === 1) {
      if (name.length < 3 || name.length > 50) {
        setError('Event name must be between 3 and 50 characters');
        return false;
      }
      if (description.length < 50 || description.length > 500) {
        setError('Description must be between 50 and 500 characters');
        return false;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(eventDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError('Event date must be in the future');
        return false;
      }
      if (!locationName.trim()) {
        setError('Please enter location');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (photoUrls.length === 0) {
        setError('Please add at least 1 photo');
        return false;
      }
      if (!selectedCategory) {
        setError('Please select an event category');
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

  const handleSaveDraft = () => {
    resetForm();
    router.push('/(tabs)/events');
  };

  const handleCreateEvent = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError(null);

    try {
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const endTimeValue =
        endTime || new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      const eventData = {
        name,
        description,
        eventDate: eventDateStr,
        startTime: startTime.toISOString(),
        endTime: endTimeValue.toISOString(),
        locationName,
        categoryId: selectedCategory?.id || undefined,
        interestTags: selectedInterests,
        capacityLimit: capacityLimit ? parseInt(capacityLimit) : null,
        isPublic,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
      };

      const createdEvent = await api.createEvent(eventData);

      resetForm();
      Alert.alert('Event Created!', 'Now invite people to your event', [
        {
          text: 'OK',
          onPress: () =>
            router.push({
              pathname: '/event/simple-invite',
              params: { eventId: createdEvent.id },
            }),
        },
      ]);
    } catch (err: any) {
      console.error('Error creating event:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || err.message || 'Failed to create event'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEventDate(new Date());
    setStartTime(new Date());
    setEndTime(null);
    setLocationName('');
    setPhotoUrls([]);
    setSelectedCategory(null);
    setSelectedInterests([]);
    setCapacityLimit('');
    setIsPublic(false);
    setStep(1);
  };

  const renderProgressBar = () => (
    <View style={styles.progressBar}>
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={[styles.progressDot, step >= s && styles.progressDotActive]}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.stepText}>Step {step} of 3</Text>
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
            <Text style={styles.stepTitle}>Event Details</Text>
            <Text style={styles.stepSubtitle}>Tell us about your event</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Name * (3-50 characters)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Study Group for Math 101"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
              <Text style={styles.charCount}>{name.length}/50</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Description * (50-500 characters)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your event in detail..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Date *</Text>
              <View style={styles.iconInput}>
                <Calendar size={20} color="#666" />
                {Platform.OS === 'web' ? (
                  <WebDatePicker
                    value={eventDate}
                    onChange={setEventDate}
                    minimumDate={new Date()}
                    mode="date"
                  />
                ) : (
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.iconInputField}>
                      {formatDate(eventDate)}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Start Time *</Text>
                <View style={styles.iconInput}>
                  <Clock size={20} color="#666" />
                  {Platform.OS === 'web' ? (
                    <WebDatePicker
                      value={startTime}
                      onChange={setStartTime}
                      mode="time"
                    />
                  ) : (
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <Text style={styles.iconInputField}>
                        {formatTime(startTime)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>End Time</Text>
                <View style={styles.iconInput}>
                  <Clock size={20} color="#666" />
                  {Platform.OS === 'web' ? (
                    <WebDatePicker
                      value={getDefaultEndTime()}
                      onChange={(date) => setEndTime(date)}
                      mode="time"
                    />
                  ) : (
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <Text style={styles.iconInputField}>
                        {endTime ? formatTime(endTime) : 'Optional'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <View style={styles.iconInput}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.iconInputField}
                  placeholder="Where is this happening?"
                  value={locationName}
                  onChangeText={setLocationName}
                />
              </View>
              <Text style={styles.helperText}>
                Map integration coming soon!
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Photos & Category</Text>
            <Text style={styles.stepSubtitle}>Make your event attractive</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Photos * (1-10 photos)</Text>
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
                {photoUrls.length < 10 && (
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
                Select photos from your device gallery
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Category *</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory?.id === category.id &&
                        styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory?.id === category.id &&
                          styles.categoryChipTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Interest Tags (Optional)</Text>
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
                      size={14}
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
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Final Settings</Text>
            <Text style={styles.stepSubtitle}>Set capacity and visibility</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Capacity Limit (Optional)</Text>
              <View style={styles.iconInput}>
                <Users size={20} color="#666" />
                <TextInput
                  style={styles.iconInputField}
                  placeholder="Maximum attendees (leave empty for unlimited)"
                  value={capacityLimit}
                  onChangeText={setCapacityLimit}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Visibility *</Text>
              <View style={styles.visibilityContainer}>
                <TouchableOpacity
                  style={[
                    styles.visibilityButton,
                    isPublic && styles.visibilityButtonActive,
                  ]}
                  onPress={() => setIsPublic(true)}
                >
                  <Text
                    style={[
                      styles.visibilityButtonText,
                      isPublic && styles.visibilityButtonTextActive,
                    ]}
                  >
                    Public
                  </Text>
                  <Text style={styles.visibilityButtonSubtext}>
                    Anyone can see
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.visibilityButton,
                    !isPublic && styles.visibilityButtonActive,
                  ]}
                  onPress={() => setIsPublic(false)}
                >
                  <Text
                    style={[
                      styles.visibilityButtonText,
                      !isPublic && styles.visibilityButtonTextActive,
                    ]}
                  >
                    Invite Only
                  </Text>
                  <Text style={styles.visibilityButtonSubtext}>
                    Only invited
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Event Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date:</Text>
                <Text style={styles.summaryValue}>
                  {formatDate(eventDate)} at {formatTime(startTime)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Location:</Text>
                <Text style={styles.summaryValue}>{locationName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Category:</Text>
                <Text style={styles.summaryValue}>
                  {selectedCategory?.name}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Photos:</Text>
                <Text style={styles.summaryValue}>{photoUrls.length}</Text>
              </View>
            </View>
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

        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.finalButtonsContainer}>
            <TouchableOpacity
              style={styles.draftButton}
              onPress={handleSaveDraft}
              disabled={loading}
            >
              <Save size={18} color="#666" />
              <Text style={styles.draftButtonText}>Save Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.createButton,
                loading && styles.createButtonDisabled,
              ]}
              onPress={handleCreateEvent}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? 'Creating...' : 'Create & Invite'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {Platform.OS !== 'web' && showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setEventDate(selectedDate);
            }
          }}
        />
      )}

      {Platform.OS !== 'web' && showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartTimePicker(false);
            if (selectedDate) {
              setStartTime(selectedDate);
            }
          }}
        />
      )}

      {Platform.OS !== 'web' && showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndTimePicker(false);
            if (selectedDate) {
              setEndTime(selectedDate);
            }
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    gap: 20,
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
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  iconInputField: {
    flex: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  categoryChipSelected: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  interestChipSelected: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  interestChipText: {
    fontSize: 13,
    color: '#666',
  },
  interestChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  visibilityButtonActive: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  visibilityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  visibilityButtonTextActive: {
    color: '#fff',
  },
  visibilityButtonSubtext: {
    fontSize: 12,
    color: '#999',
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
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
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  finalButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#3AFF6E',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
