import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Mail, Lock } from 'lucide-react-native';
import { Colors, BorderRadius, SharedStyles } from '@/constants/theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'verification'>('email');
  const [verificationCode, setVerificationCode] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendVerification = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Only send OTP code, don't register yet
      await api.sendSignupOtp(email);
      // Switch to verification step after OTP is sent
      setStep('verification');
      setLoading(false);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send verification code'
      );
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);

    try {
      // Register the user with all information including OTP code
      const { error: signUpError } = await signUp(
        email,
        password,
        fullName || email.split('@')[0],
        verificationCode
      );

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // After successful registration, redirect to profile setup
      // The _layout.tsx will handle redirecting to dashboard if profile is already completed
      router.replace('/profile-setup');
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Registration failed'
      );
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setLoading(true);

    try {
      await api.sendSignupOtp(email);
      setVerificationCode('');
      // Show success message or alert
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to resend code'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {step === 'email' ? 'Create Account' : 'Verify Email'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'email'
              ? 'Sign up with your email to get started'
              : `We've sent a verification code to ${email}`}
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'email' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address *</Text>
                <View style={SharedStyles.input}>
                  <Mail size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    editable={!loading}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password *</Text>
                <View style={SharedStyles.input}>
                  <Lock size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={SharedStyles.input}>
                  <Lock size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!loading}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  SharedStyles.button,
                  loading && SharedStyles.buttonDisabled,
                ]}
                onPress={handleSendVerification}
                // disabled={loading}
              >
                <Text style={SharedStyles.buttonText}>
                  {loading ? 'Sending Code...' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationText}>
                  Enter the 6-digit code sent to your email
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code *</Text>
                <View style={SharedStyles.input}>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  SharedStyles.button,
                  loading && SharedStyles.buttonDisabled,
                ]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <Text style={SharedStyles.buttonText}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleResendCode}
                disabled={loading}
              >
                <Text style={styles.linkText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setStep('email')}
                disabled={loading}
              >
                <Text style={styles.linkText}>Change Email</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  verificationInfo: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
  },
  linkButton: {
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    paddingHorizontal: 12,
  },
  skipButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
    backgroundColor: '#fff5e6',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },
});
