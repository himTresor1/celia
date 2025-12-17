import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { X, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react-native';
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
  const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);
  const [interestsDropdownOpen, setInterestsDropdownOpen] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [interestSearch, setInterestSearch] = useState('');

  // Reset to current filters when modal opens
  useEffect(() => {
    if (visible) {
      setFilters(currentFilters);
      setSearchQuery(currentFilters.search || '');
      setCollegeDropdownOpen(false);
      setInterestsDropdownOpen(false);
      setCollegeSearch('');
      setInterestSearch('');
    }
  }, [visible, currentFilters]);

  const handleApply = () => {
    onApply({ ...filters, search: searchQuery });
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    setSearchQuery('');
    setCollegeDropdownOpen(false);
    setInterestsDropdownOpen(false);
    setCollegeSearch('');
    setInterestSearch('');
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

                {/* College dropdown trigger */}
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  activeOpacity={0.8}
                  onPress={() =>
                    setCollegeDropdownOpen((open) => !open)
                  }
                >
                  <View style={styles.dropdownTextContainer}>
                    <Text
                      style={[
                        styles.dropdownValue,
                        !filters.collegeId && styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {filters.collegeId
                        ? filterOptions.colleges.find(
                            (c) => c.id === filters.collegeId,
                          )?.label || 'Any college'
                        : 'Any college'}
                    </Text>
                  </View>
                  {collegeDropdownOpen ? (
                    <ChevronUp size={18} color="#666" />
                  ) : (
                    <ChevronDown size={18} color="#666" />
                  )}
                </TouchableOpacity>

                {/* College dropdown menu */}
                {collegeDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {filterOptions.colleges.length > 8 && (
                      <TextInput
                        style={styles.dropdownSearchInput}
                        placeholder="Search colleges..."
                        value={collegeSearch}
                        onChangeText={setCollegeSearch}
                        placeholderTextColor="#999"
                      />
                    )}
                    <ScrollView
                      style={styles.dropdownScroll}
                      keyboardShouldPersistTaps="handled"
                    >
                      <TouchableOpacity
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFilters((prev) => ({
                            ...prev,
                            collegeId: undefined,
                          }));
                          setCollegeDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionLabel}>Any college</Text>
                        {!filters.collegeId && (
                          <Check size={18} color="#3AFF6E" />
                        )}
                      </TouchableOpacity>

                      {filterOptions.colleges
                        .filter((college) =>
                          college.label
                            .toLowerCase()
                            .includes(collegeSearch.toLowerCase()),
                        )
                        .map((college) => {
                          const isSelected = filters.collegeId === college.id;
                          return (
                            <TouchableOpacity
                              key={college.id}
                              style={[
                                styles.dropdownOption,
                                isSelected && styles.dropdownOptionSelected,
                              ]}
                              onPress={() => {
                                setFilters((prev) => ({
                                  ...prev,
                                  collegeId:
                                    prev.collegeId === college.id ? undefined : college.id,
                                }));
                                setCollegeDropdownOpen(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownOptionLabel,
                                  isSelected && styles.dropdownOptionLabelSelected,
                                ]}
                              >
                                {college.label}
                              </Text>
                              {isSelected && (
                                <Check size={18} color="#3AFF6E" />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {filterOptions?.interests && filterOptions.interests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interests</Text>

                {/* Interests dropdown trigger */}
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  activeOpacity={0.8}
                  onPress={() =>
                    setInterestsDropdownOpen((open) => !open)
                  }
                >
                  <View style={styles.dropdownTextContainer}>
                    <Text
                      style={[
                        styles.dropdownValue,
                        (!filters.interests || filters.interests.length === 0) &&
                          styles.dropdownPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {filters.interests && filters.interests.length > 0
                        ? filters.interests.length === 1
                          ? filterOptions.interests.find(
                              (i) => i.value === filters.interests[0],
                            )?.label || '1 interest selected'
                          : (() => {
                              const labels = filters.interests
                                .map(
                                  (val: string) =>
                                    filterOptions.interests.find(
                                      (i) => i.value === val,
                                    )?.label,
                                )
                                .filter(Boolean) as string[];
                              if (labels.length === 0) {
                                return `${filters.interests.length} interests selected`;
                              }
                              if (labels.length === 1) return labels[0];
                              return `${labels[0]}, ${labels[1]} +${
                                labels.length - 2
                              }`;
                            })()
                        : 'Any interests'}
                    </Text>
                  </View>
                  {interestsDropdownOpen ? (
                    <ChevronUp size={18} color="#666" />
                  ) : (
                    <ChevronDown size={18} color="#666" />
                  )}
                </TouchableOpacity>

                {/* Interests dropdown menu */}
                {interestsDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {filterOptions.interests.length > 8 && (
                      <TextInput
                        style={styles.dropdownSearchInput}
                        placeholder="Search interests..."
                        value={interestSearch}
                        onChangeText={setInterestSearch}
                        placeholderTextColor="#999"
                      />
                    )}
                    <ScrollView
                      style={styles.dropdownScroll}
                      keyboardShouldPersistTaps="handled"
                    >
                      <TouchableOpacity
                        style={styles.dropdownOption}
                        onPress={() => {
                          setFilters((prev) => ({
                            ...prev,
                            interests: [],
                          }));
                        }}
                      >
                        <Text style={styles.dropdownOptionLabel}>Any interests</Text>
                        {(!filters.interests ||
                          filters.interests.length === 0) && (
                          <Check size={18} color="#3AFF6E" />
                        )}
                      </TouchableOpacity>

                      {filterOptions.interests
                        .filter((interest) =>
                          interest.label
                            .toLowerCase()
                            .includes(interestSearch.toLowerCase()),
                        )
                        .map((interest) => {
                          const currentInterests = filters.interests || [];
                          const isSelected = currentInterests.includes(
                            interest.value,
                          );

                          return (
                            <TouchableOpacity
                              key={interest.id}
                              style={[
                                styles.dropdownOption,
                                isSelected && styles.dropdownOptionSelected,
                              ]}
                              onPress={() => {
                                const newInterests = isSelected
                                  ? currentInterests.filter(
                                      (i: string) => i !== interest.value,
                                    )
                                  : [...currentInterests, interest.value];
                                setFilters((prev) => ({
                                  ...prev,
                                  interests: newInterests,
                                }));
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownOptionLabel,
                                  isSelected &&
                                    styles.dropdownOptionLabelSelected,
                                ]}
                              >
                                {interest.label}
                              </Text>
                              {isSelected && (
                                <Check size={18} color="#3AFF6E" />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                    </ScrollView>
                  </View>
                )}
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
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  dropdownTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  dropdownValue: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownSearchInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0FFF7',
  },
  dropdownOptionLabel: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  dropdownOptionLabelSelected: {
    fontWeight: '600',
    color: '#1A8F4D',
  },
});

