import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { apiHelpers } from '@/lib/apiHelpers';
import { theme } from '@/constants/theme';

export default function SendPulseScreen() {
  const { userId } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSendPulse = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await apiHelpers.sendEnergyPulse(user.id, userId as string);

      if (error) {
        Alert.alert('Error', 'Failed to send energy pulse');
      } else {
        await apiHelpers.logEngagement(user.id, 'energy_pulse_send', 3);

        Alert.alert(
          'Energy Pulse Sent! ⚡',
          'They have 24 hours to send one back to become friends!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={styles.pulseOuter}>
          <View style={styles.pulseMiddle}>
            <View style={styles.pulseInner}>
              <Zap size={60} color="#FFF" fill="#FFF" />
            </View>
          </View>
        </View>
      </Animated.View>

      <Text style={styles.title}>Send Energy Pulse</Text>
      <Text style={styles.description}>
        Send an energy pulse to connect! They'll have 24 hours to send one back.
        {'\n\n'}
        If both pulses are sent within 24 hours, you'll become friends!
      </Text>

      <TouchableOpacity
        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
        onPress={handleSendPulse}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Zap size={24} color="#FFF" fill="#FFF" />
            <Text style={styles.sendButtonText}>Send Pulse</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pulseContainer: {
    marginBottom: 40,
  },
  pulseOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(58, 255, 110, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseMiddle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(58, 255, 110, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#999',
  },
});
