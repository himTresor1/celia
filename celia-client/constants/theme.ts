import { StyleSheet } from 'react-native';

export const Fonts = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  bold: 'DMSans-Bold',
};

export const Colors = {
  primary: '#3AFF6E',
  primaryDark: '#2EE05C',
  primaryLight: '#6FFF96',
  text: '#1a1a1a',
  textSecondary: '#666',
  textLight: '#999',
  background: '#fff',
  backgroundSecondary: '#F5F7FA',
  border: '#E8EFF5',
  error: '#FF4444',
  success: '#3AFF6E',
  white: '#fff',
  black: '#000',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  full: 9999,
};

export const theme = {
  colors: Colors,
  fonts: Fonts,
  spacing: Spacing,
  borderRadius: BorderRadius,
};

export const SharedStyles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: '70%',
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    fontSize: 16,
    fontFamily: Fonts.regular,
    width: '100%',
  },
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputIcon: {
    width: 20,
    height: 20,
  },
});
