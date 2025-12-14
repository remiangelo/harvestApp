import { supabase } from '../supabase';
import {
  analyzeMessage,
  analyzeConversation,
  analyzeReadyToMove,
  SafetyAnalysisResult,
  RedFlag,
  ConversationContext,
  Message,
} from './openaiService';
import { SAFETY_CONFIG, getSafetyLevel } from './safetyConfig';

// Types for database
export interface SafetyAnalysis {
  id: string;
  conversation_id: string;
  user_id: string;
  match_id: string;
  safety_score: number;
  red_flags: RedFlag[];
  recommendations: string[];
  allow_contact_sharing: boolean;
  created_at: Date;
}

export interface RedFlagReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  conversation_id: string;
  flag_type: string;
  severity: string;
  evidence: string;
  ai_detected: boolean;
  user_reported: boolean;
  reviewed: boolean;
  action_taken?: string;
  created_at: Date;
}

export interface UserSafetySettings {
  user_id: string;
  ai_monitoring_enabled: boolean;
  strict_mode: boolean;
  auto_blur_sensitive_content: boolean;
  require_video_before_sharing: boolean;
  min_chat_duration_hours: number;
  emergency_contacts: any[];
  created_at: Date;
  updated_at: Date;
}

// Safety Analysis Service
export class SafetyAnalysisService {
  private static instance: SafetyAnalysisService;

  private constructor() {}

  static getInstance(): SafetyAnalysisService {
    if (!SafetyAnalysisService.instance) {
      SafetyAnalysisService.instance = new SafetyAnalysisService();
    }
    return SafetyAnalysisService.instance;
  }

  // Analyze incoming message in real-time
  async analyzeIncomingMessage(
    message: string,
    conversationId: string,
    senderId: string,
    receiverId: string
  ): Promise<SafetyAnalysisResult & { shouldShowWarning: boolean }> {
    try {
      // Get user's safety settings
      const settings = await this.getUserSafetySettings(receiverId);

      if (!settings?.ai_monitoring_enabled) {
        return {
          safetyScore: 100,
          redFlags: [],
          recommendations: [],
          allowContactSharing: true,
          requiresHumanReview: false,
          shouldShowWarning: false,
        };
      }

      // Get conversation context
      const context = await this.getConversationContext(conversationId, receiverId, senderId);

      // Analyze the message
      const analysis = await analyzeMessage(message, context);

      // Save analysis to database
      await this.saveAnalysis({
        conversation_id: conversationId,
        user_id: receiverId,
        match_id: senderId,
        safety_score: analysis.safetyScore,
        red_flags: analysis.redFlags,
        recommendations: analysis.recommendations,
        allow_contact_sharing: analysis.allowContactSharing,
      });

      // Report any critical red flags
      if (analysis.redFlags.some((f) => f.severity === 'critical')) {
        await this.reportRedFlags(analysis.redFlags, conversationId, senderId, receiverId, true);
      }

      // Determine if warning should be shown
      const shouldShowWarning =
        settings.auto_blur_sensitive_content &&
        (analysis.safetyScore < SAFETY_CONFIG.thresholds.warning ||
          analysis.redFlags.some((f) => f.severity === 'critical' || f.severity === 'high'));

      return { ...analysis, shouldShowWarning };
    } catch (error) {
      console.error('Safety analysis error:', error);
      return {
        safetyScore: 100,
        redFlags: [],
        recommendations: [],
        allowContactSharing: true,
        requiresHumanReview: false,
        shouldShowWarning: false,
      };
    }
  }

  // Check if ready to move off app
  async checkReadyToMove(
    conversationId: string,
    userId: string,
    matchId: string
  ): Promise<{
    canMove: boolean;
    analysis: SafetyAnalysisResult;
    requiredActions: string[];
    safetyTips: string[];
  }> {
    try {
      const context = await this.getFullConversationContext(conversationId, userId, matchId);
      const analysis = await analyzeReadyToMove(context);

      // Generate safety tips based on analysis
      const safetyTips = this.generateSafetyTips(analysis);

      // Save the analysis
      await this.saveAnalysis({
        conversation_id: conversationId,
        user_id: userId,
        match_id: matchId,
        safety_score: analysis.safetyScore,
        red_flags: analysis.redFlags,
        recommendations: analysis.recommendations,
        allow_contact_sharing: analysis.allowContactSharing,
      });

      return {
        canMove: analysis.canMoveOffApp,
        analysis,
        requiredActions: analysis.requiredActions,
        safetyTips,
      };
    } catch (error) {
      console.error('Ready to move check error:', error);
      return {
        canMove: false,
        analysis: {
          safetyScore: 0,
          redFlags: [],
          recommendations: ['Unable to verify safety at this time'],
          allowContactSharing: false,
          requiresHumanReview: true,
        },
        requiredActions: ['Please try again later'],
        safetyTips: ['Always meet in public places', 'Tell a friend your plans'],
      };
    }
  }

  // Get conversation context for analysis
  private async getConversationContext(
    conversationId: string,
    userId: string,
    matchId: string
  ): Promise<Partial<ConversationContext>> {
    try {
      // Get user profiles
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: matchProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      // Get conversation stats
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!messages || messages.length === 0) {
        return {
          conversationId,
          userId,
          matchId,
          userProfile,
          matchProfile,
          conversationDuration: 0,
          messageCount: 0,
        };
      }

      // Calculate conversation duration
      const firstMessage = messages[messages.length - 1];
      const lastMessage = messages[0];
      const durationMs =
        new Date(lastMessage.created_at).getTime() - new Date(firstMessage.created_at).getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      return {
        conversationId,
        userId,
        matchId,
        userProfile,
        matchProfile,
        conversationDuration: durationHours,
        messageCount: messages.length,
      };
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return {
        conversationId,
        userId,
        matchId,
        conversationDuration: 0,
        messageCount: 0,
      };
    }
  }

  // Get full conversation context with messages
  private async getFullConversationContext(
    conversationId: string,
    userId: string,
    matchId: string
  ): Promise<ConversationContext> {
    const baseContext = await this.getConversationContext(conversationId, userId, matchId);

    // Get recent messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50);

    const formattedMessages: Message[] = (messages || []).map((m: any) => ({
      id: m.id,
      content: m.content,
      senderId: m.sender_id,
      timestamp: new Date(m.created_at),
    }));

    return {
      ...baseContext,
      messages: formattedMessages.reverse(), // Chronological order
    } as ConversationContext;
  }

  // Save analysis to database
  private async saveAnalysis(data: Omit<SafetyAnalysis, 'id' | 'created_at'>): Promise<void> {
    try {
      await supabase.from('safety_analyses').insert({
        conversation_id: data.conversation_id,
        user_id: data.user_id,
        match_id: data.match_id,
        safety_score: data.safety_score,
        red_flags: data.red_flags,
        recommendations: data.recommendations,
        allow_contact_sharing: data.allow_contact_sharing,
      });
    } catch (error) {
      console.error('Error saving safety analysis:', error);
    }
  }

  // Report red flags
  private async reportRedFlags(
    redFlags: RedFlag[],
    conversationId: string,
    reportedUserId: string,
    reporterId: string,
    aiDetected: boolean
  ): Promise<void> {
    try {
      const reports = redFlags
        .filter((f) => f.severity === 'critical' || f.severity === 'high')
        .map((flag) => ({
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          conversation_id: conversationId,
          flag_type: flag.type,
          severity: flag.severity,
          evidence: flag.evidence || flag.message,
          ai_detected: aiDetected,
          user_reported: !aiDetected,
          reviewed: false,
        }));

      if (reports.length > 0) {
        await supabase.from('red_flag_reports').insert(reports);
      }
    } catch (error) {
      console.error('Error reporting red flags:', error);
    }
  }

  // Get user safety settings
  async getUserSafetySettings(userId: string): Promise<UserSafetySettings | null> {
    try {
      const { data } = await supabase
        .from('user_safety_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      return data;
    } catch (error) {
      // Return default settings if none exist
      return {
        user_id: userId,
        ai_monitoring_enabled: true,
        strict_mode: false,
        auto_blur_sensitive_content: true,
        require_video_before_sharing: false,
        min_chat_duration_hours: SAFETY_CONFIG.minimums.hoursBeforeSharing,
        emergency_contacts: [],
        created_at: new Date(),
        updated_at: new Date(),
      };
    }
  }

  // Update user safety settings
  async updateUserSafetySettings(
    userId: string,
    settings: Partial<UserSafetySettings>
  ): Promise<void> {
    try {
      await supabase.from('user_safety_settings').upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error('Error updating safety settings:', error);
    }
  }

  // Generate safety tips based on analysis
  private generateSafetyTips(analysis: SafetyAnalysisResult): string[] {
    const tips: string[] = [];
    const level = getSafetyLevel(analysis.safetyScore);

    // Add general tips based on safety level
    switch (level) {
      case 'safe':
        tips.push('Great! This conversation appears safe.');
        tips.push('Still meet in public for first dates.');
        break;
      case 'caution':
        tips.push('Proceed with caution.');
        tips.push('Consider a video call before meeting.');
        break;
      case 'warning':
        tips.push('Be very careful with this match.');
        tips.push('Do not share personal information yet.');
        break;
      case 'danger':
        tips.push('This conversation has serious red flags.');
        tips.push('Consider blocking and reporting this user.');
        break;
    }

    // Add specific tips based on red flags
    const flagTypes = new Set(analysis.redFlags.map((f) => f.type));

    if (flagTypes.has('FINANCIAL')) {
      tips.push("Never send money to someone you haven't met.");
    }
    if (flagTypes.has('PERSONAL_INFO')) {
      tips.push('Protect your personal information.');
    }
    if (flagTypes.has('CATFISHING')) {
      tips.push('Request a video call to verify identity.');
    }
    if (flagTypes.has('MANIPULATION')) {
      tips.push('Trust your instincts if something feels wrong.');
    }

    // Always add emergency tip
    tips.push('Tell a friend about your plans and location.');

    return tips;
  }

  // Get safety dashboard for user
  async getUserSafetyDashboard(userId: string): Promise<{
    overallSafetyScore: number;
    matchSafetyScores: { matchId: string; score: number; name: string }[];
    recentWarnings: RedFlag[];
    safetyTips: string[];
  }> {
    try {
      // Get recent analyses
      const { data: analyses } = await supabase
        .from('safety_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!analyses || analyses.length === 0) {
        return {
          overallSafetyScore: 100,
          matchSafetyScores: [],
          recentWarnings: [],
          safetyTips: ['No recent activity to analyze'],
        };
      }

      // Calculate overall safety score
      const overallSafetyScore = Math.round(
        analyses.reduce((sum: number, a: any) => sum + a.safety_score, 0) / analyses.length
      );

      // Get match safety scores
      const matchScores = new Map<string, number[]>();
      for (const analysis of analyses) {
        if (!matchScores.has(analysis.match_id)) {
          matchScores.set(analysis.match_id, []);
        }
        matchScores.get(analysis.match_id)?.push(analysis.safety_score);
      }

      // Get match names
      const matchIds = Array.from(matchScores.keys());
      const { data: profiles } = await supabase
        .from('users')
        .select('id, nickname')
        .in('id', matchIds);

      const matchSafetyScores = Array.from(matchScores.entries()).map(([matchId, scores]) => ({
        matchId,
        score: Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length),
        name: profiles?.find((p: any) => p.id === matchId)?.nickname || 'Unknown',
      }));

      // Get recent warnings
      const recentWarnings = analyses
        .flatMap((a: any) => a.red_flags || [])
        .filter((f: any) => f.severity === 'high' || f.severity === 'critical')
        .slice(0, 5);

      // Generate safety tips
      const avgScore = overallSafetyScore;
      const safetyTips = this.generateSafetyTips({
        safetyScore: avgScore,
        redFlags: recentWarnings,
        recommendations: [],
        allowContactSharing: avgScore > 70,
        requiresHumanReview: false,
      });

      return {
        overallSafetyScore,
        matchSafetyScores,
        recentWarnings,
        safetyTips,
      };
    } catch (error) {
      console.error('Error getting safety dashboard:', error);
      return {
        overallSafetyScore: 100,
        matchSafetyScores: [],
        recentWarnings: [],
        safetyTips: ['Unable to load safety data'],
      };
    }
  }
}

// Export singleton instance
export const safetyService = SafetyAnalysisService.getInstance();
