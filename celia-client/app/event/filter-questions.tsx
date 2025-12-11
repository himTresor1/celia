import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Colors, Fonts, BorderRadius } from '@/constants/theme';

interface FilterQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
}

const FILTER_QUESTIONS: FilterQuestion[] = [
  {
    id: 'style',
    question: 'What style are you looking for?',
    type: 'single',
    options: ['Casual', 'Formal', 'Mix', 'Any'],
  },
  {
    id: 'age',
    question: 'Age range preference?',
    type: 'single',
    options: ['18-21', '22-25', '26-30', 'Any'],
  },
  {
    id: 'personality',
    question: 'Personality type?',
    type: 'multiple',
    options: [
      'Outgoing',
      'Introverted',
      'Creative',
      'Analytical',
      'Adventurous',
      'Relaxed',
    ],
  },
  {
    id: 'interests',
    question: 'Key interests?',
    type: 'multiple',
    options: [
      'Sports',
      'Arts',
      'Technology',
      'Music',
      'Food',
      'Travel',
      'Fitness',
      'Reading',
    ],
  },
];

export default function FilterQuestionsScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const currentQuestion = FILTER_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === FILTER_QUESTIONS.length - 1;

  const handleAnswer = (option: string) => {
    const currentAnswers = answers[currentQuestion.id] || [];

    if (currentQuestion.type === 'single') {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [option],
      });
    } else {
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter((a) => a !== option)
        : [...currentAnswers, option];
      setAnswers({
        ...answers,
        [currentQuestion.id]: newAnswers,
      });
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Navigate to results
      router.push({
        pathname: '/event/browse-results',
        params: {
          eventId,
          filters: JSON.stringify(answers),
        },
      });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.back();
    }
  };

  const isAnswerSelected = (option: string) => {
    const currentAnswers = answers[currentQuestion.id] || [];
    return currentAnswers.includes(option);
  };

  const canProceed = () => {
    const currentAnswers = answers[currentQuestion.id] || [];
    return currentAnswers.length > 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentQuestionIndex + 1) / FILTER_QUESTIONS.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {FILTER_QUESTIONS.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        <Text style={styles.questionHint}>
          {currentQuestion.type === 'multiple'
            ? 'Select all that apply'
            : 'Select one option'}
        </Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = isAnswerSelected(option);
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleAnswer(option)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {isLastQuestion ? 'Find Matches' : 'Next'}
          </Text>
          <ArrowRight
            size={20}
            color={canProceed() ? '#fff' : Colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  questionText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  questionHint: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  optionTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
