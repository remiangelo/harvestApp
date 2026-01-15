import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView } from './liquid/LiquidGlassView';
import { theme } from '../constants/theme';
import { getUserValuesBrought, getUserValuesSought, UserValue } from '../lib/values';
import useSubscriptionStore from '../stores/useSubscriptionStore';
import { PremiumLockedOverlay } from './PremiumLockedOverlay';
import { UpgradeModal } from './UpgradeModal';

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x400/A0354E/FFFFFF?text=No+Image';

export interface ProfileData {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  photos?: string[];
  hobbies?: string[];
  location?: string;
  distance?: number;
}

interface ProfileViewModalProps {
  visible: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onSendMessage?: () => void;
}

export const ProfileViewModal: React.FC<ProfileViewModalProps> = ({
  visible,
  onClose,
  profile,
  onSendMessage,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [valuesBrought, setValuesBrought] = useState<UserValue[]>([]);
  const [valuesSought, setValuesSought] = useState<UserValue[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const hasValuesMatching = useSubscriptionStore((state) => state.hasValuesMatching);

  useEffect(() => {
    if (visible && profile) {
      loadValues();
    }
  }, [visible, profile]);

  const loadValues = async () => {
    if (!profile) return;

    try {
      const [broughtResult, soughtResult] = await Promise.all([
        getUserValuesBrought(profile.id),
        getUserValuesSought(profile.id),
      ]);

      if (broughtResult.data) {
        setValuesBrought(broughtResult.data);
      }
      if (soughtResult.data) {
        setValuesSought(soughtResult.data);
      }
    } catch (error) {
      console.error('[ProfileViewModal] Error loading values:', error);
    }
  };

  if (!profile) return null;

  const photos = profile.photos && profile.photos.length > 0 ? profile.photos : [FALLBACK_IMAGE];

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const previousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <BlurView intensity={80} tint="dark" style={styles.backdrop}>
        <View style={styles.darkOverlay} />

        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={32} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{profile.name}</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'android' ? insets.bottom + 80 : insets.bottom + 100,
            }}
          >
            {/* Photo Section */}
            <View style={styles.photoSection}>
              <Image
                source={{ uri: photos[currentPhotoIndex] || FALLBACK_IMAGE }}
                style={styles.mainPhoto}
              />

              {/* Photo Navigation Overlays */}
              {photos.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.photoNavigation, styles.photoNavLeft]}
                    onPress={previousPhoto}
                    activeOpacity={0.7}
                  >
                    {currentPhotoIndex > 0 && (
                      <Ionicons name="chevron-back" size={32} color="white" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.photoNavigation, styles.photoNavRight]}
                    onPress={nextPhoto}
                    activeOpacity={0.7}
                  >
                    {currentPhotoIndex < photos.length - 1 && (
                      <Ionicons name="chevron-forward" size={32} color="white" />
                    )}
                  </TouchableOpacity>

                  {/* Photo Indicators */}
                  <View style={styles.photoIndicators}>
                    {photos.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicator,
                          index === currentPhotoIndex && styles.indicatorActive,
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>

            {/* Profile Info with Liquid Glass */}
            <LiquidGlassView
              intensity={70}
              tint="light"
              style={styles.infoContainer as any}
              borderRadius={24}
              glassTint="rgba(255, 255, 255, 0.95)"
            >
              {/* Name and Age */}
              <View style={styles.nameSection}>
                <Text style={styles.name}>{profile.name}</Text>
                {profile.age && <Text style={styles.age}>, {profile.age}</Text>}
              </View>

              {/* Location */}
              {profile.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color={theme.colors.text.secondary} />
                  <Text style={styles.location}>{profile.location}</Text>
                  {profile.distance && (
                    <Text style={styles.distance}> • {profile.distance} miles away</Text>
                  )}
                </View>
              )}

              {/* Bio */}
              {profile.bio && (
                <View style={styles.bioSection}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.bioText}>{profile.bio}</Text>
                </View>
              )}

              {/* Hobbies */}
              {profile.hobbies && profile.hobbies.length > 0 && (
                <View style={styles.hobbiesSection}>
                  <Text style={styles.sectionTitle}>Hobbies & Interests</Text>
                  <View style={styles.hobbiesGrid}>
                    {profile.hobbies.map((hobby, index) => (
                      <View key={index} style={styles.hobbyChip}>
                        <Text style={styles.hobbyText}>{hobby}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Values Section - Premium Feature */}
              {(valuesBrought.length > 0 || valuesSought.length > 0) && (
                <View style={styles.valuesSectionWrapper}>
                  {/* Show lock overlay for free tier */}
                  {!hasValuesMatching() && (
                    <PremiumLockedOverlay
                      onUpgrade={() => setShowUpgradeModal(true)}
                      featureName="Values-Based Matching"
                      description="See what values potential matches bring and seek. Upgrade to Green tier to unlock."
                    />
                  )}

                  {/* Values - What They Bring */}
                  {valuesBrought.length > 0 && (
                    <View style={styles.valuesSection}>
                      <View style={styles.valuesTitleRow}>
                        <Ionicons name="gift" size={20} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Top Values They Bring</Text>
                      </View>
                      <View style={styles.valuesGrid}>
                        {valuesBrought.slice(0, 3).map((userValue, index) => (
                          <View key={userValue.id} style={styles.valueChip}>
                            <View style={styles.valueRank}>
                              <Text style={styles.valueRankText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.valueText}>
                              {(userValue.value as any)?.name || 'Unknown'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Values - What They Seek */}
                  {valuesSought.length > 0 && (
                    <View style={styles.valuesSection}>
                      <View style={styles.valuesTitleRow}>
                        <Ionicons name="search" size={20} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Top Values They Seek</Text>
                      </View>
                      <View style={styles.valuesGrid}>
                        {valuesSought.slice(0, 3).map((userValue, index) => (
                          <View key={userValue.id} style={styles.valueChip}>
                            <View style={styles.valueRank}>
                              <Text style={styles.valueRankText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.valueText}>
                              {(userValue.value as any)?.name || 'Unknown'}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </LiquidGlassView>
          </ScrollView>

          {/* Action Button */}
          {onSendMessage && (
            <View style={[styles.actionBar, { paddingBottom: insets.bottom + 20 }]}>
              <TouchableOpacity style={styles.sendMessageButton} onPress={onSendMessage}>
                <Ionicons name="chatbubble" size={24} color="white" />
                <Text style={styles.sendMessageText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </BlurView>

      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightFeature="values"
        title="Unlock Values Matching"
        subtitle="Discover what truly matters to your potential matches"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  age: {
    color: theme.colors.text.primary,
    fontSize: 28,
    fontWeight: '600',
  },
  backdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bioSection: {
    marginTop: 16,
  },
  bioText: {
    color: theme.colors.text.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  closeButton: {
    padding: 4,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  distance: {
    color: theme.colors.text.tertiary,
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbiesSection: {
    marginTop: 16,
  },
  hobbyChip: {
    backgroundColor: 'rgba(160, 53, 78, 0.1)',
    borderColor: 'rgba(160, 53, 78, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hobbyText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  indicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    height: 4,
    width: 30,
  },
  indicatorActive: {
    backgroundColor: 'white',
  },
  infoContainer: {
    margin: 20,
    marginBottom: 10,
    padding: 20,
  },
  location: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginLeft: 4,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  mainPhoto: {
    height: Dimensions.get('window').height * 0.55,
    width: Dimensions.get('window').width,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flex: 1,
  },
  name: {
    color: theme.colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  nameSection: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  photoIndicators: {
    alignItems: 'center',
    bottom: 20,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  photoNavLeft: {
    left: 0,
  },
  photoNavRight: {
    right: 0,
  },
  photoNavigation: {
    bottom: 0,
    justifyContent: 'center',
    padding: 20,
    position: 'absolute',
    top: 0,
    width: '40%',
  },
  photoSection: {
    position: 'relative',
  },
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sendMessageButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    elevation: 4,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sendMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  valueChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(160, 53, 78, 0.1)',
    borderColor: 'rgba(160, 53, 78, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  valueRank: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  valueRankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  valueText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valuesSection: {
    marginTop: 16,
  },
  valuesSectionWrapper: {
    marginTop: 16,
    minHeight: 180,
    position: 'relative',
  },
  valuesTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
});
