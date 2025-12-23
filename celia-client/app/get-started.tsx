import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Eye, X } from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GetStartedScreen() {
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  useEffect(() => {
    // Mark as seen when component mounts
    AsyncStorage.setItem('hasSeenGetStarted', 'true');
  }, []);

  const handleGetStarted = () => {
    setShowChoiceModal(true);
  };

  const handleSelectEvent = () => {
    setShowChoiceModal(false);
    router.push('/event/select-event');
  };

  const handleJustLooking = () => {
    setShowChoiceModal(false);
    router.push('/browse/just-looking');
  };

  const handleSkip = () => {
    setShowChoiceModal(false);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3AFF6E', '#2EE05C']}
        style={styles.gradientContainer}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>C</Text>
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Start Finding Matches</Text>
            <Text style={styles.subtitle}>
              Connect with people for your events or browse and discover
            </Text>
          </View>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Choice Modal */}
      <Modal
        visible={showChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowChoiceModal(false)}
            >
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Choose Your Path</Text>
            <Text style={styles.modalSubtitle}>
              How would you like to find people?
            </Text>

            <View style={styles.choiceContainer}>
              {/* Option A: Select from Events */}
              <TouchableOpacity
                style={styles.choiceCard}
                onPress={handleSelectEvent}
                activeOpacity={0.8}
              >
                <View style={styles.choiceIconContainer}>
                  <Calendar size={32} color={Colors.primary} />
                </View>
                <Text style={styles.choiceTitle}>Select from Events</Text>
                <Text style={styles.choiceDescription}>
                  Choose an event and find people who match
                </Text>
              </TouchableOpacity>

              {/* Option B: Just Looking */}
              <TouchableOpacity
                style={styles.choiceCard}
                onPress={handleJustLooking}
                activeOpacity={0.8}
              >
                <View style={styles.choiceIconContainer}>
                  <Eye size={32} color={Colors.primary} />
                </View>
                <Text style={styles.choiceTitle}>Just Looking</Text>
                <Text style={styles.choiceDescription}>
                  Browse people casually and save them for later
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.primary,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  getStartedButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 200,
  },
  getStartedButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  choiceContainer: {
    gap: 16,
  },
  choiceCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  choiceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  choiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  choiceDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
