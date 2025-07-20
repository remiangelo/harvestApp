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
                color={currentPhotoIndex === profile.photos.length - 1 ? 'rgba(255,255,255,0.3)' : 'white'}
              />
            </TouchableOpacity>
          </>
        )}

        {/* Photo Indicators */}
        <View style={styles.photoIndicators}>
          {profile.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentPhotoIndex && styles.activeIndicator,
              ]}
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
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
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
  container: {
    width: width - 40,
    height: height * 0.7,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftNav: {
    left: 10,
  },
  rightNav: {
    right: 10,
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#ff4757',
  },
  likeButton: {
    backgroundColor: '#8B1E2D',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  basicInfo: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  bioContainer: {
    maxHeight: 80,
    marginBottom: 16,
  },
  bio: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  hobbiesContainer: {
    marginBottom: 12,
  },
  hobbiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  hobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  hobbyText: {
    fontSize: 14,
    color: '#495057',
  },
  goalsContainer: {
    marginBottom: 8,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalTag: {
    backgroundColor: '#8B1E2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalText: {
    fontSize: 14,
    color: 'white',
  },
}); 