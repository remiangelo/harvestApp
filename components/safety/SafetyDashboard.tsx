import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { safetyService } from '../../lib/ai/safetyAnalysisService';
import { getSafetyColor, getSafetyLevel } from '../../lib/ai/safetyConfig';
import { useAuthStore } from '../../stores/useAuthStore';

export const SafetyDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadDashboard();
      loadSettings();
    }
  }, [user?.id]);

  const loadDashboard = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await safetyService.getUserSafetyDashboard(user.id);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const userSettings = await safetyService.getUserSafetySettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    if (!user?.id) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await safetyService.updateUserSafetySettings(user.id, { [key]: value });
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert on error
      setSettings(settings);
    }
  };

  const renderOverallScore = () => {
    if (!dashboardData) return null;

    const score = dashboardData.overallSafetyScore;
    const level = getSafetyLevel(score);
    const color = getSafetyColor(score);

    return (
      <LinearGradient colors={[color, color + 'DD']} style={styles.scoreCard}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreLabel}>Overall Safety</Text>
        </View>
        <Text style={styles.scoreLevel}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
        <View style={styles.scoreDetails}>
          <Ionicons name="shield-checkmark" size={20} color="white" />
          <Text style={styles.scoreDetailText}>Based on your recent conversations</Text>
        </View>
      </LinearGradient>
    );
  };

  const renderMatchScores = () => {
    if (!dashboardData?.matchSafetyScores || dashboardData.matchSafetyScores.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Safety Scores</Text>
        {dashboardData.matchSafetyScores.map((match: any) => (
          <View key={match.matchId} style={styles.matchItem}>
            <Text style={styles.matchName}>{match.name}</Text>
            <View style={styles.matchScoreContainer}>
              <View style={[styles.matchScoreBar, { backgroundColor: '#E0E0E0' }]}>
                <View
                  style={[
                    styles.matchScoreBarFill,
                    {
                      backgroundColor: getSafetyColor(match.score),
                      width: `${match.score}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.matchScore, { color: getSafetyColor(match.score) }]}>
                {match.score}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentWarnings = () => {
    if (!dashboardData?.recentWarnings || dashboardData.recentWarnings.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Warnings</Text>
        {dashboardData.recentWarnings.map((warning: any, index: number) => (
          <View key={index} style={styles.warningItem}>
            <Ionicons
              name="warning"
              size={24}
              color={warning.severity === 'critical' ? '#F44336' : '#FF9800'}
            />
            <View style={styles.warningContent}>
              <Text style={styles.warningType}>{warning.type}</Text>
              <Text style={styles.warningMessage}>{warning.message}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSafetyTips = () => {
    if (!dashboardData?.safetyTips || dashboardData.safetyTips.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        {dashboardData.safetyTips.map((tip: string, index: number) => (
          <View key={index} style={styles.tipItem}>
            <Ionicons name="bulb" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSettings = () => {
    if (!settings) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>AI Monitoring</Text>
            <Text style={styles.settingDescription}>Analyze messages for potential red flags</Text>
          </View>
          <Switch
            value={settings.ai_monitoring_enabled}
            onValueChange={(value) => updateSetting('ai_monitoring_enabled', value)}
            trackColor={{ false: '#E0E0E0', true: '#A0354E' }}
            thumbColor="white"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Strict Mode</Text>
            <Text style={styles.settingDescription}>More sensitive red flag detection</Text>
          </View>
          <Switch
            value={settings.strict_mode}
            onValueChange={(value) => updateSetting('strict_mode', value)}
            trackColor={{ false: '#E0E0E0', true: '#A0354E' }}
            thumbColor="white"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Blur Content</Text>
            <Text style={styles.settingDescription}>
              Automatically blur potentially inappropriate content
            </Text>
          </View>
          <Switch
            value={settings.auto_blur_sensitive_content}
            onValueChange={(value) => updateSetting('auto_blur_sensitive_content', value)}
            trackColor={{ false: '#E0E0E0', true: '#A0354E' }}
            thumbColor="white"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Video Verification</Text>
            <Text style={styles.settingDescription}>
              Require video call before sharing contact info
            </Text>
          </View>
          <Switch
            value={settings.require_video_before_sharing}
            onValueChange={(value) => updateSetting('require_video_before_sharing', value)}
            trackColor={{ false: '#E0E0E0', true: '#A0354E' }}
            thumbColor="white"
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A0354E" />
        <Text style={styles.loadingText}>Loading safety dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="shield" size={32} color="#A0354E" />
        <Text style={styles.title}>Safety Dashboard</Text>
      </View>

      {renderOverallScore()}
      {renderMatchScores()}
      {renderRecentWarnings()}
      {renderSafetyTips()}
      {renderSettings()}

      <TouchableOpacity style={styles.emergencyButton}>
        <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.emergencyButtonGradient}>
          <Ionicons name="call" size={24} color="white" />
          <Text style={styles.emergencyButtonText}>Emergency Contacts</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  emergencyButton: {
    borderRadius: 10,
    margin: 20,
    marginBottom: 40,
    overflow: 'hidden',
  },
  emergencyButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  matchItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  matchName: {
    color: '#333',
    flex: 1,
    fontSize: 16,
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '600',
    width: 30,
  },
  matchScoreBar: {
    borderRadius: 3,
    flex: 1,
    height: 6,
    marginRight: 10,
  },
  matchScoreBarFill: {
    borderRadius: 3,
    height: '100%',
  },
  matchScoreContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  scoreCard: {
    alignItems: 'center',
    borderRadius: 15,
    margin: 20,
    padding: 20,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreDetailText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginLeft: 5,
  },
  scoreDetails: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  scoreLevel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  scoreNumber: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 15,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  settingDescription: {
    color: '#999',
    fontSize: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: {
    color: '#333',
    fontSize: 16,
    marginBottom: 2,
  },
  tipItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  warningContent: {
    flex: 1,
    marginLeft: 10,
  },
  warningItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 15,
  },
  warningMessage: {
    color: '#666',
    fontSize: 14,
  },
  warningType: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
});
