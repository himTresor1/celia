import { api } from './api';

export const apiHelpers = {
  async logEngagement(userId: string, actionType: string, points: number, metadata?: any) {
    try {
      await api.logEngagement(userId, actionType, points, metadata);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  async updateStreak(userId: string) {
    try {
      await api.updateStreak(userId);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  async sendEnergyPulse(fromUserId: string, toUserId: string) {
    try {
      const data = await api.sendPulse(fromUserId, toUserId);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async getFriends(userId: string) {
    try {
      const data = await api.getFriends(userId);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async getPendingFriendRequests(userId: string) {
    try {
      const data = await api.getFriends(userId);
      const pending = data.filter((f: any) => f.status === 'pending');
      return { data: pending, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async removeFriend(userId: string, friendId: string) {
    try {
      await api.removeFriend(friendId);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  async areFriends(user1Id: string, user2Id: string) {
    try {
      const friends = await api.getFriends(user1Id);
      const areFriends = friends.some(
        (f: any) =>
          (f.user1_id === user2Id || f.user2_id === user2Id) &&
          f.status === 'active'
      );
      return { areFriends, error: null };
    } catch (error: any) {
      return { areFriends: false, error: error.response?.data?.message || error.message };
    }
  },

  async getSavedUsers(userId: string) {
    try {
      const data = await api.getSavedUsers(userId);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async addToSaved(userId: string, savedUserId: string, context?: string, notes?: string) {
    try {
      const data = await api.addToSaved(userId, savedUserId, context, notes);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async removeFromSaved(userId: string, savedUserId: string) {
    try {
      await api.removeFromSaved(userId, savedUserId);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message };
    }
  },

  async isUserSaved(userId: string, targetUserId: string) {
    try {
      const saved = await api.getSavedUsers(userId);
      const isSaved = saved.some((s: any) => s.saved_user_id === targetUserId);
      return { isSaved, error: null };
    } catch (error: any) {
      return { isSaved: false, error: error.response?.data?.message || error.message };
    }
  },

  async getInvitees(userId: string) {
    try {
      const data = await api.getInvitees(userId);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async getSmartSuggestions(userId: string, filters?: any) {
    try {
      const data = await api.getRecommendations(filters);
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async bulkInviteToEvent(eventId: string, userIds: string[], message?: string) {
    try {
      const data = await api.bulkInvite({
        eventId,
        inviteeIds: userIds,
        message,
      });
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  async getUserStats(userId: string) {
    try {
      const data = await api.getUserStats(userId);
      const rating = this.displayRating(data.attractivenessScore || 0);
      return {
        data: {
          eventsCreated: data.eventsCreated || 0,
          invitationsReceived: data.invitationsReceived || 0,
          friendsCount: data.friendsCount || 0,
          attractivenessScore: data.attractivenessScore || 0,
          rating,
          engagementPoints: data.engagementPoints || 0,
          socialStreakDays: data.socialStreakDays || 0,
        },
        error: null,
      };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || error.message };
    }
  },

  displayRating(score: number): number {
    if (score < 10) return 1;
    if (score < 20) return 2;
    if (score < 30) return 3;
    if (score < 40) return 4;
    if (score < 50) return 5;
    if (score < 60) return 6;
    if (score < 70) return 7;
    if (score < 80) return 8;
    if (score < 90) return 9;
    return 10;
  },
};
