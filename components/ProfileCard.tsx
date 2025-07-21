// UNUSED - Replaced by CleanSwipeCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DemoProfile } from '../data/demoProfiles';

const { width, height } = Dimensions.get('window');

interface ProfileCardProps {
  profile: DemoProfile;
  onLike: () => void;
  onDislike: () => void;
}

export default function ProfileCard({ profile, onLike, onDislike }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Photo Section */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: profile.photos[currentPhotoIndex] }}
          style={styles.photo}
          resizeMode="cover"
        />

        {/* Photo Navigation */}
        {profile.photos.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.leftNav]}
              onPress={prevPhoto}
              disabled={currentPhotoIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentPhotoIndex === 0 ? 'rgba(255,255,255,0.3)' : 'white'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.rightNav]}
              onPress={nextPhoto}
              disabled={currentPhotoIndex === profile.photos.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={
                  currentPhotoIndex === profile.photos.length - 1
                    ? 'rgba(255,255,255,0.3)'
                    : 'white'
                }
              />
            </TouchableOpacity>
          </>
        )}

        {/* Photo Indicators */}
        <View style={styles.photoIndicators}>
          {profile.photos.map((_, index) => (
            <View
              key={index}
              style={[styles.indicator, index === currentPhotoIndex && styles.activeIndicator]}
            />
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.dislikeButton]} onPress={onDislike}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={onLike}>
            <Ionicons name="heart" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.infoContainer}>
        <View style={styles.basicInfo}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={styles.location}>{profile.location}</Text>
        </View>

        <ScrollView style={styles.bioContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.bio}>{profile.bio}</Text>
        </ScrollView>

        {/* Hobbies */}
        <View style={styles.hobbiesContainer}>
          <Text style={styles.hobbiesTitle}>Interests</Text>
          <View style={styles.hobbiesList}>
            {profile.hobbies.slice(0, 4).map((hobby, index) => (
              <View key={index} style={styles.hobbyTag}>
                <Text style={styles.hobbyText}>{hobby}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Relationship Goals */}
        <View style={styles.goalsContainer}>
          <Text style={styles.goalsTitle}>Looking for</Text>
          <View style={styles.goalsList}>
            {profile.relationshipGoals.map((goal, index) => (
              <View key={index} style={styles.goalTag}>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 30,
    elevation: 5,
    height: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 60,
  },
  actionButtons: {
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  basicInfo: {
    marginBottom: 12,
  },
  bio: {
    color: '#444',
    fontSize: 16,
    lineHeight: 22,
  },
  bioContainer: {
    marginBottom: 16,
    maxHeight: 80,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    height: height * 0.7,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: width - 40,
  },
  dislikeButton: {
    backgroundColor: '#ff4757',
  },
  goalTag: {
    backgroundColor: '#8B1E2D',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goalText: {
    color: 'white',
    fontSize: 14,
  },
  goalsContainer: {
    marginBottom: 8,
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalsTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hobbiesContainer: {
    marginBottom: 12,
  },
  hobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbiesTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hobbyTag: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hobbyText: {
    color: '#495057',
    fontSize: 14,
  },
  indicator: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  leftNav: {
    left: 10,
  },
  likeButton: {
    backgroundColor: '#8B1E2D',
  },
  location: {
    color: '#666',
    fontSize: 16,
  },
  name: {
    color: '#222',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photoIndicators: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 20,
  },
  rightNav: {
    right: 10,
  },
});
