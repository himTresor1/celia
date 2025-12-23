import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LOGO_SVG = `<svg width="60" height="60" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="43" height="43" rx="10" fill="#3AFF6E"/>
<g clip-path="url(#clip0_2_7)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18.625 21.6797C17.1364 21.6797 16.1094 22.8864 16.1094 24.375H14.1328C14.1328 21.894 16.144 19.7959 18.625 19.7959V21.6797Z" fill="black"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M24.5357 10L26.5376 11.8605C28.0413 13.2579 28.5331 15.2552 28.0129 17.045C29.0627 17.101 30.0961 17.5287 30.8982 18.3282L32.5915 20.0159L30.8982 21.7036C29.7516 22.8464 28.1321 23.2296 26.6684 22.8532C26.6588 22.8464 26.6778 22.8597 26.6684 22.8532C26.4288 22.7933 25.7804 22.5617 25.2054 22.1305C24.7463 21.7861 23.8747 20.9606 23.2677 20.3675C23.1562 20.2321 23.0359 20.1425 22.9122 20.0159C21.7536 18.9486 20.1595 18.0894 18.4063 18.0894C14.9243 18.0894 12.1016 20.9121 12.1016 24.3941C12.1016 24.8033 12.1406 25.2034 12.215 25.5909C12.5541 27.3179 13.6083 28.891 15.2497 29.8387C18.2651 31.5797 22.1208 30.5465 23.8618 27.5312C24.5296 26.3743 24.7892 25.0938 24.6853 23.8565C25.3834 24.2926 26.1758 24.6196 26.8011 24.756C26.7892 25.027 26.7641 25.2982 26.7255 25.5687C26.1533 29.6544 22.6496 32.8003 18.4063 32.8003C14.261 32.8003 10.8165 29.7999 10.126 25.8523C10.1224 25.8321 10.1191 25.8119 10.1157 25.7917C10.1145 25.7844 10.1132 25.7771 10.112 25.7698C10.0383 25.3221 10 24.8626 10 24.3941C10 22.8599 10.411 21.4216 11.1289 20.1835L11.1222 20.176C13.4435 16.1555 18.5844 14.778 22.6049 17.0992C23.2985 17.4997 23.9134 17.984 24.4442 18.532L25.1069 17.8754C26.4469 16.6301 26.4469 14.6452 25.1069 13.3999L24.5357 12.869L23.9645 13.3999C23.3044 14.0134 22.9694 14.8064 22.9598 15.6021C22.3192 15.2702 21.6377 15.0062 20.9248 14.8196C21.1034 13.7343 21.6398 12.6914 22.5338 11.8605L24.5357 10ZM26.1364 19.8166C27.0413 18.9147 28.5098 18.9147 29.4146 19.8166L29.6145 20.0159L29.4146 20.2151C28.5098 21.117 27.0413 21.117 26.1364 20.2151L25.9365 20.0159L26.1364 19.8166Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_2_7">
<rect width="23" height="23" fill="white" transform="translate(10 10)"/>
</clipPath>
</defs>
</svg>`;

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '0',
    title: 'Welcome to CELIA',
    description:
      'Connect with friends and discover amazing events at your college',
  },
  {
    id: '1',
    title: 'Connect Easily',
    description:
      'Find and connect with students who share your interests and passions',
  },
  {
    id: '2',
    title: 'Fun Events',
    description:
      'Create and join exciting events, from study sessions to social gatherings',
  },
  {
    id: '3',
    title: 'Stay Notified',
    description:
      'Get timely notifications about events and never miss out on the fun',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(auth)/login');
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: OnboardingSlide;
    index: number;
  }) => (
    <View style={styles.slide}>
      {index === 0 ? (
        <View style={styles.logoContainer}>
          <SvgXml xml={LOGO_SVG} width={100} height={100} />
        </View>
      ) : (
        <View style={styles.illustrationPlaceholder}>
          <View style={styles.placeholderShape} />
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={goToPrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft
            size={24}
            color={currentIndex === 0 ? '#ccc' : '#2C3E50'}
          />
        </TouchableOpacity>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          onPress={goToNext}
        >
          <ArrowRight size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#FF6B4A',
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  illustrationPlaceholder: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  placeholderShape: {
    width: 200,
    height: 200,
    backgroundColor: '#E8EFF5',
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C9A',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  navButtonDisabled: {
    backgroundColor: '#F5F7FA',
  },
  navButtonActive: {
    backgroundColor: '#3AFF6E',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#2C3E50',
    width: 30,
  },
  dotInactive: {
    backgroundColor: '#D1D8E0',
  },
});
