import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGardenerStore } from '../stores/useGardenerStore';
import { gardenerService } from '../lib/ai/gardenerService';
import { LiquidGlassView } from '../components/liquid/LiquidGlassView';
import { theme } from '../constants/theme';

export default function GardenerSettingsScreen() {
  const router = useRouter();
  const { openAiApiKey, setOpenAiApiKey } = useGardenerStore();
  const [apiKey, setApiKey] = useState(openAiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      setOpenAiApiKey(apiKey.trim());
      gardenerService.updateApiKey(apiKey.trim());
      Alert.alert('Success', 'OpenAI API key saved successfully!');
      router.back();
    } else {
      Alert.alert('Error', 'Please enter a valid API key');
    }
  };

  const handleRemoveKey = () => {
    Alert.alert(
      'Remove API Key',
      'Are you sure you want to remove your OpenAI API key? The AI features will use fallback responses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setOpenAiApiKey('');
            setApiKey('');
            gardenerService.updateApiKey('');
            Alert.alert('Success', 'API key removed');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#A0354E', '#8B1E2D', '#701625']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gardener Settings</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <LiquidGlassView
            intensity={65}
            tint="light"
            style={styles.infoCard}
            borderRadius={16}
            glassTint="rgba(255, 255, 255, 0.95)"
          >
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#A0354E" />
              <Text style={styles.infoTitle}>About AI Features</Text>
            </View>
            <Text style={styles.infoText}>
              The Gardener uses OpenAI&apos;s GPT-4 to provide personalized dating advice and
              generate daily reflection questions. Without an API key, you&apos;ll still get helpful
              responses based on common dating scenarios.
            </Text>
          </LiquidGlassView>

          <LiquidGlassView
            intensity={65}
            tint="light"
            style={styles.apiCard}
            borderRadius={16}
            glassTint="rgba(255, 255, 255, 0.95)"
          >
            <Text style={styles.label}>OpenAI API Key</Text>
            <Text style={styles.sublabel}>
              Get your API key from <Text style={styles.link}>platform.openai.com</Text>
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-..."
                placeholderTextColor="#999"
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} style={styles.eyeButton}>
                <Ionicons name={showApiKey ? 'eye-off' : 'eye'} size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {openAiApiKey && (
              <TouchableOpacity onPress={handleRemoveKey} style={styles.removeButton}>
                <Text style={styles.removeText}>Remove API Key</Text>
              </TouchableOpacity>
            )}
          </LiquidGlassView>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <LinearGradient
              colors={['#A0354E', '#8B1E2D']}
              style={styles.saveGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveText}>Save API Key</Text>
            </LinearGradient>
          </TouchableOpacity>

          <LiquidGlassView
            intensity={65}
            tint="light"
            style={styles.featuresCard}
            borderRadius={16}
            glassTint="rgba(255, 255, 255, 0.95)"
          >
            <Text style={styles.featuresTitle}>Features with API Key:</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                Personalized dating advice based on your conversation
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                AI-generated daily reflection questions tailored to you
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                Context-aware responses that remember your dating journey
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                Advanced relationship insights and compatibility analysis
              </Text>
            </View>
          </LiquidGlassView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  apiCard: {
    marginBottom: 20,
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  eyeButton: {
    padding: 12,
  },
  featureItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  featuresCard: {
    marginBottom: 40,
    padding: 20,
  },
  featuresTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  header: {
    paddingBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 5,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  infoCard: {
    marginBottom: 20,
    padding: 16,
  },
  infoHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  infoTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    color: '#333',
    flex: 1,
    fontSize: 15,
    padding: 14,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
  },
  label: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  placeholder: {
    width: 40,
  },
  removeButton: {
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  removeText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  saveGradient: {
    alignItems: 'center',
    padding: 16,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sublabel: {
    color: '#666',
    fontSize: 13,
    marginBottom: 16,
  },
});
