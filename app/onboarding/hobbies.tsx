import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const ALL_HOBBIES = [
  'Art',
  'Board Games',
  'Cooking',
  'Dancing',
  'Fitness',
  'Gaming',
  'Hiking',
  'Motorcycling',
  'Movies',
  'Music',
  'Pets',
  'Photography',
  'Reading',
  'Sports',
  'Singing',
  'Technology',
  'Tourism',
  'Writing',
  'Coffee',
  'Travel',
  'Coding',
  'Guitar',
  'Craft Beer',
  'Yoga',
  'Meditation',
  'Nature Walks',
  'Design',
  'Vintage Fashion',
  'Indie Films',
  'Art Galleries',
  'Wine Tasting',
  'Running',
  'Volunteering',
  'Football',
  'Basketball',
  'Investing',
  'Game Nights',
  'Gym',
  'Rock Climbing',
  'Sustainability',
  'Astronomy',
  'Camping',
  'Gardening',
];

export default function OnboardingHobbies() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const { onboardingData } = useUserStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    if (onboardingData?.hobbies) {
      setSelected(onboardingData.hobbies);
    }
  }, [onboardingData]);

  const filteredHobbies = ALL_HOBBIES.filter((hobby) =>
    hobby.toLowerCase().includes(search.toLowerCase())
  );

  const toggleHobby = (hobby: string) => {
    if (selected.includes(hobby)) {
      setSelected(selected.filter((h) => h !== hobby));
    } else if (selected.length < 6) {
      setSelected([...selected, hobby]);
    }
  };

  const handleValidate = () => {
    if (selected.length > 0) {
      return { hobbies: selected };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={90}
      currentStep="hobbies"
      nextStep="distance"
      onValidate={handleValidate}
      buttonDisabled={selected.length === 0}
    >
      <Text style={styles.title}>Share your Hobbies</Text>
      <Text style={styles.subtitle}>
        Share your interests, passions, and hobbies. We’ll connect you with people who share your
        enthusiasm.
      </Text>
      <TextInput
        style={styles.search}
        placeholder="Search interest"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />
      <Text style={styles.selectedCount}>
        Select up to 6 hobbies {selected.length} out of 6 selected
      </Text>
      <ScrollView contentContainerStyle={styles.hobbiesContainer}>
        {filteredHobbies.map((hobby) => (
          <TouchableOpacity
            key={hobby}
            style={[styles.hobby, selected.includes(hobby) && styles.selectedHobby]}
            onPress={() => toggleHobby(hobby)}
            disabled={!selected.includes(hobby) && selected.length >= 6}
          >
            <Text style={[styles.hobbyText, selected.includes(hobby) && styles.selectedHobbyText]}>
              {hobby}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 32,
    width: '100%',
  },
  hobby: {
    backgroundColor: '#fff',
    borderColor: '#8B1E2D',
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
    marginBottom: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  hobbyText: {
    color: '#8B1E2D',
    fontFamily: 'System',
    fontSize: 16,
  },
  search: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderRadius: 20,
    borderWidth: 1,
    fontFamily: 'System',
    fontSize: 16,
    height: 40,
    marginBottom: 8,
    paddingHorizontal: 16,
    width: '100%',
  },
  selectedCount: {
    alignSelf: 'flex-start',
    color: '#8B1E2D',
    fontFamily: 'System',
    fontSize: 14,
    marginBottom: 8,
  },
  selectedHobby: {
    backgroundColor: '#8B1E2D',
  },
  selectedHobbyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#555',
    fontFamily: 'System',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    color: '#222',
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
