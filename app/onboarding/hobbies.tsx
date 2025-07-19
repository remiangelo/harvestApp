import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const ALL_HOBBIES = [
  'Art', 'Board Games', 'Cooking', 'Dancing', 'Fitness', 'Gaming', 'Hiking', 'Motorcycling', 'Movies', 'Music', 'Pets', 'Photography', 'Reading', 'Sports', 'Singing', 'Technology', 'Tourism', 'Writing', 'Coffee', 'Travel', 'Coding', 'Guitar', 'Craft Beer', 'Yoga', 'Meditation', 'Nature Walks', 'Design', 'Vintage Fashion', 'Indie Films', 'Art Galleries', 'Wine Tasting', 'Running', 'Volunteering', 'Football', 'Basketball', 'Investing', 'Game Nights', 'Gym', 'Rock Climbing', 'Sustainability', 'Astronomy', 'Camping', 'Gardening',
];

export default function OnboardingHobbies() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.hobbies) {
      setSelected(currentUser.hobbies);
    }
  }, [currentUser]);

  const filteredHobbies = ALL_HOBBIES.filter(hobby =>
    hobby.toLowerCase().includes(search.toLowerCase())
  );

  const toggleHobby = (hobby: string) => {
    if (selected.includes(hobby)) {
      setSelected(selected.filter(h => h !== hobby));
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
      <Text style={styles.subtitle}>Share your interests, passions, and hobbies. We’ll connect you with people who share your enthusiasm.</Text>
      <TextInput
        style={styles.search}
        placeholder="Search interest"
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />
      <Text style={styles.selectedCount}>Select up to 6 hobbies   {selected.length} out of 6 selected</Text>
      <ScrollView contentContainerStyle={styles.hobbiesContainer}>
        {filteredHobbies.map(hobby => (
          <TouchableOpacity
            key={hobby}
            style={[styles.hobby, selected.includes(hobby) && styles.selectedHobby]}
            onPress={() => toggleHobby(hobby)}
            disabled={!selected.includes(hobby) && selected.length >= 6}
          >
            <Text style={[styles.hobbyText, selected.includes(hobby) && styles.selectedHobbyText]}>{hobby}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  search: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#fafafa',
    fontFamily: 'System',
  },
  selectedCount: {
    fontSize: 14,
    color: '#8B1E2D',
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontFamily: 'System',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 32,
  },
  hobby: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B1E2D',
    backgroundColor: '#fff',
    margin: 4,
    marginBottom: 8,
  },
  selectedHobby: {
    backgroundColor: '#8B1E2D',
  },
  hobbyText: {
    color: '#8B1E2D',
    fontSize: 16,
    fontFamily: 'System',
  },
  selectedHobbyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 