import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { X, Filter } from 'lucide-react-native';
import { useState, useEffect } from 'react';

interface FilterOption {
  id: string;
  label: string;
  value: any;
}

interface ListFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  filterOptions?: {
    colleges?: FilterOption[];
    interests?: FilterOption[];
    ageRange?: { min: number; max: number };
    rating?: { min: number; max: number };
  };
  currentFilters?: any;
}

export default function ListFiltersModal({
  visible,
  onClose,
  onApply,
  filterOptions,
  currentFilters = {},
}: ListFiltersModalProps) {
  const [filters, setFilters] = useState(currentFilters);
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '');

  // Reset to current filters when modal opens
  useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
      setSearchQuery(currentFilters.search || '');
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply({ ...filters, search: searchQuery });
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setSearchQuery('');
    onApply({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Filter size={24} color="#3AFF6E" />
              <Text style={styles.title}>Filters</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Search</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, college..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            {filterOptions?.colleges && filterOptions.colleges.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>College</Text>
                <View style={styles.chipContainer}>
                  {filterOptions.colleges.map((college) => (
                    <TouchableOpacity
                      key={college.id}
                      style={[
                        styles.chip,
                        filters.collegeId === college.id && styles.chipActive,
                      ]}
                      onPress={() =>
                        setFilters((prev) => ({
                          ...prev,
                          collegeId:
                            prev.collegeId === college.id ? undefined : college.id,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.collegeId === college.id && styles.chipTextActive,
                        ]}
                      >
                        {college.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {filterOptions?.interests && filterOptions.interests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interests</Text>
                <View style={styles.chipContainer}>
                  {filterOptions.interests.map((interest) => (
                    <TouchableOpacity
                      key={interest.id}
                      style={[
                        styles.chip,
                        filters.interests?.includes(interest.value) &&
                          styles.chipActive,
                      ]}
                      onPress={() => {
                        const currentInterests = filters.interests || [];
                        const newInterests = currentInterests.includes(interest.value)
                          ? currentInterests.filter((i: string) => i !== interest.value)
                          : [...currentInterests, interest.value];
                        setFilters((prev) => ({ ...prev, interests: newInterests }));
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.interests?.includes(interest.value) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {interest.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#3AFF6E',
    borderColor: '#3AFF6E',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3AFF6E',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

