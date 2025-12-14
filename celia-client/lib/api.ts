import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const API_BASE = `${API_URL}/api`; // Backend uses /api prefix

console.log('[API] Initializing API Client');
console.log('[API] API_URL:', API_URL);
console.log('[API] API_BASE:', API_BASE);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE, // Use API_BASE which includes /api prefix
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[API] Request with token:', {
            url: config.url,
            method: config.method,
            hasToken: true
          });
        } else {
          console.log('[API] Request without token:', {
            url: config.url,
            method: config.method
          });
        }
        return config;
      },
      (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log('[API] Response success:', {
          url: response.config.url,
          status: response.status
        });
        return response;
      },
      async (error) => {
        console.error('[API] Response error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        if (error.response?.status === 401) {
          console.log('[API] Unauthorized - clearing tokens');
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
    try {
      console.log('[API] Register request:', {
        email: data.email,
        fullName: data.fullName,
        url: `${API_URL}/auth/register`
      });
      const response = await this.client.post('/auth/register', data);
      console.log('[API] Register response:', response.data);

      // Backend returns 'token', not 'access_token'
      if (response.data.token) {
        await this.setToken(response.data.token);
        console.log('[API] Token saved successfully');
      } else {
        console.error('[API] No token in response:', response.data);
      }
      return response.data;
    } catch (error: any) {
      console.error('[API] Register error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('[API] Login request:', { 
        email, 
        url: `${API_BASE}/auth/login`,
        baseURL: API_BASE,
        fullURL: `${API_URL}/api/auth/login`
      });
      
      const response = await this.client.post('/auth/login', { email, password });
      console.log('[API] Login response:', response.data);

      // Backend returns 'token', not 'access_token'
      if (response.data.token) {
        await this.setToken(response.data.token);
        console.log('[API] Token saved successfully');
      } else {
        console.error('[API] No token in response:', response.data);
        throw new Error('No token received from server');
      }
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      const errorDetails = {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        requestURL: error.config?.url,
        requestBaseURL: error.config?.baseURL,
      };
      console.error('[API] Login error details:', errorDetails);
      
      // Provide more helpful error messages
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:3000');
      }
      
      if (error.response?.status === 401) {
        throw new Error(error.response?.data?.message || 'Invalid email or password');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw error;
    }
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

  async getMyEvents(status?: string) {
    const params: any = {};
    if (status) params.status = status;
    const response = await this.client.get('/events/my', { params });
    return response.data;
  }

  async getUserHostedEvents(hostId: string, limit?: number) {
    const params: any = { hostId };
    if (limit) params.limit = limit;
    const response = await this.client.get('/events', { params });
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
    const response = await this.client.get('/friends');
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
    // Use /invitations/my endpoint which gets invitations for the current authenticated user
    const response = await this.client.get('/invitations/my');
    return response.data;
  }

  async getEventInvitations(eventId: string) {
    const response = await this.client.get(`/invitations/event/${eventId}`);
    return response.data;
  }

  async deleteInvitation(invitationId: string) {
    const response = await this.client.delete(`/invitations/${invitationId}`);
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
    // Backend expects 'status' field, and uses 'going' for accepted, 'rejected' for declined
    const status = response === 'accepted' ? 'going' : 'rejected';
    const res = await this.client.patch(`/invitations/${invitationId}`, { status });
    return res.data;
  }

  async getSavedUsers(userId: string) {
    const response = await this.client.get('/lists/saved');
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
    const response = await this.client.delete(`/lists/saved/${savedUserId}`);
    return response.data;
  }

  async getInvitees(userId: string) {
    const response = await this.client.get('/lists/invitees');
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

  async getEventCategories() {
    const response = await this.client.get('/categories/events');
    return response.data;
  }
}

export const api = new ApiClient();
