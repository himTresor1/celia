import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    await AsyncStorage.setItem('authToken', token);
  }

  async clearToken() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  }

  async register(data: { email: string; password: string; fullName: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.access_token) {
      await this.setToken(response.data.access_token);
    }
    return response.data;
  }

  async logout() {
    await this.clearToken();
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async updateUser(userId: string, data: any) {
    const response = await this.client.patch(`/users/${userId}`, data);
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async getEvents(filters?: any) {
    const response = await this.client.get('/events', { params: filters });
    return response.data;
  }

  async getEvent(eventId: string) {
    const response = await this.client.get(`/events/${eventId}`);
    return response.data;
  }

  async createEvent(data: any) {
    const response = await this.client.post('/events', data);
    return response.data;
  }

  async updateEvent(eventId: string, data: any) {
    const response = await this.client.patch(`/events/${eventId}`, data);
    return response.data;
  }

  async deleteEvent(eventId: string) {
    const response = await this.client.delete(`/events/${eventId}`);
    return response.data;
  }

  async getFriends(userId: string) {
    const response = await this.client.get(`/friends/${userId}`);
    return response.data;
  }

  async sendFriendRequest(fromUserId: string, toUserId: string) {
    const response = await this.client.post('/friends/request', {
      fromUserId,
      toUserId,
    });
    return response.data;
  }

  async acceptFriendRequest(friendshipId: string) {
    const response = await this.client.post(`/friends/${friendshipId}/accept`);
    return response.data;
  }

  async rejectFriendRequest(friendshipId: string) {
    const response = await this.client.delete(`/friends/${friendshipId}`);
    return response.data;
  }

  async sendPulse(fromUserId: string, toUserId: string) {
    const response = await this.client.post('/friends/pulse', {
      fromUserId,
      toUserId,
    });
    return response.data;
  }

  async removeFriend(friendshipId: string) {
    const response = await this.client.delete(`/friends/${friendshipId}`);
    return response.data;
  }

  async getInvitations(userId: string) {
    const response = await this.client.get(`/invitations/user/${userId}`);
    return response.data;
  }

  async createInvitation(data: any) {
    const response = await this.client.post('/invitations', data);
    return response.data;
  }

  async bulkInvite(data: { eventId: string; inviteeIds: string[]; message?: string }) {
    const response = await this.client.post('/invitations/bulk', data);
    return response.data;
  }

  async respondToInvitation(invitationId: string, response: 'accepted' | 'rejected') {
    const res = await this.client.patch(`/invitations/${invitationId}`, { response });
    return res.data;
  }

  async getSavedUsers(userId: string) {
    const response = await this.client.get(`/lists/saved/${userId}`);
    return response.data;
  }

  async addToSaved(userId: string, savedUserId: string, context?: string, notes?: string) {
    const response = await this.client.post('/lists/saved', {
      userId,
      savedUserId,
      context,
      notes,
    });
    return response.data;
  }

  async removeFromSaved(userId: string, savedUserId: string) {
    const response = await this.client.delete(`/lists/saved/${userId}/${savedUserId}`);
    return response.data;
  }

  async getInvitees(userId: string) {
    const response = await this.client.get(`/lists/invitees/${userId}`);
    return response.data;
  }

  async getRecommendations(filters?: any) {
    const response = await this.client.get('/recommendations', { params: filters });
    return response.data;
  }

  async getUserStats(userId: string) {
    const response = await this.client.get(`/users/${userId}/stats`);
    return response.data;
  }

  async logEngagement(userId: string, actionType: string, points: number, metadata?: any) {
    const response = await this.client.post('/users/engagement', {
      userId,
      actionType,
      points,
      metadata,
    });
    return response.data;
  }

  async updateStreak(userId: string) {
    const response = await this.client.post(`/users/${userId}/streak`);
    return response.data;
  }

  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }
}

export const api = new ApiClient();
