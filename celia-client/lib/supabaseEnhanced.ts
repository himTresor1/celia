import { supabase } from './supabase';

export const supabaseEnhanced = {
  async logEngagement(userId: string, actionType: string, points: number, metadata?: any) {
    const { error } = await supabase
      .from('engagement_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
        points_earned: points,
        metadata,
      });

    if (!error) {
      await supabase
        .from('profiles')
        .update({
          engagement_points: supabase.sql`engagement_points + ${points}`,
        })
        .eq('id', userId);
    }

    return { error };
  },

  async updateStreak(userId: string) {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('last_active_date, social_streak_days')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) return { error };

    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.last_active_date;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = user.social_streak_days || 0;

      if (lastActive === yesterdayStr) {
        newStreak += 1;
      } else if (!lastActive || lastActive < yesterdayStr) {
        newStreak = 1;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_active_date: today,
          social_streak_days: newStreak,
          app_opens_count: supabase.sql`app_opens_count + 1`,
        })
        .eq('id', userId);

      if (!updateError) {
        if (newStreak === 7) {
          await this.logEngagement(userId, 'streak_7_days', 50);
        } else if (newStreak === 30) {
          await this.logEngagement(userId, 'streak_30_days', 200);
        } else if (newStreak > 1) {
          await this.logEngagement(userId, 'app_open', 5);
        }
      }

      return { error: updateError };
    }

    return { error: null };
  },

  async sendEnergyPulse(fromUserId: string, toUserId: string) {
    const [user1Id, user2Id] = [fromUserId, toUserId].sort();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .eq('user1_id', user1Id)
      .eq('user2_id', user2Id)
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          initiated_by: fromUserId,
          connection_method: 'energy_pulse',
          pulse_expires_at: expiresAt,
          [fromUserId === user1Id ? 'pulse_sent_by_user1' : 'pulse_sent_by_user2']: now,
        })
        .select()
        .single();

      return { data, error };
    } else {
      const updateData: any = {
        pulse_expires_at: expiresAt,
        [fromUserId === user1Id ? 'pulse_sent_by_user1' : 'pulse_sent_by_user2']: now,
      };

      const { data, error } = await supabase
        .from('friendships')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (!error && data && data.pulse_sent_by_user1 && data.pulse_sent_by_user2) {
        const expiresDate = new Date(data.pulse_expires_at);
        if (new Date() <= expiresDate) {
          await supabase
            .from('friendships')
            .update({
              status: 'active',
              completed_at: now,
            })
            .eq('id', data.id);

          await this.logEngagement(user1Id, 'friend_add', 20);
          await this.logEngagement(user2Id, 'friend_add', 20);
        }
      }

      return { data, error };
    }
  },

  async getFriends(userId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user1:profiles!friendships_user1_id_fkey(id, full_name, avatar_url, college_name, attractiveness_score),
        user2:profiles!friendships_user2_id_fkey(id, full_name, avatar_url, college_name, attractiveness_score)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active')
      .order('completed_at', { ascending: false });

    if (error) return { data: null, error };

    const friends = data?.map((f: any) => ({
      friendshipId: f.id,
      friend: f.user1_id === userId ? f.user2 : f.user1,
      connectedAt: f.completed_at,
    }));

    return { data: friends, error: null };
  },

  async getPendingFriendRequests(userId: string) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user1:profiles!friendships_user1_id_fkey(id, full_name, avatar_url, college_name),
        user2:profiles!friendships_user2_id_fkey(id, full_name, avatar_url, college_name),
        initiator:profiles!friendships_initiated_by_fkey(id, full_name)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'pending');

    if (error) return { data: null, error };

    const requests = data?.map((f: any) => ({
      ...f,
      otherUser: f.user1_id === userId ? f.user2 : f.user1,
      sentByMe: f.initiated_by === userId,
      myPulseSent: userId === f.user1_id ? !!f.pulse_sent_by_user1 : !!f.pulse_sent_by_user2,
      theirPulseSent: userId === f.user1_id ? !!f.pulse_sent_by_user2 : !!f.pulse_sent_by_user1,
      expiresAt: f.pulse_expires_at,
    }));

    return { data: requests, error: null };
  },

  async removeFriend(userId: string, friendId: string) {
    const [user1Id, user2Id] = [userId, friendId].sort();

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user1_id', user1Id)
      .eq('user2_id', user2Id);

    return { error };
  },

  async areFriends(user1Id: string, user2Id: string) {
    const [userId1, userId2] = [user1Id, user2Id].sort();

    const { data, error } = await supabase
      .from('friendships')
      .select('status')
      .eq('user1_id', userId1)
      .eq('user2_id', userId2)
      .maybeSingle();

    return { areFriends: data?.status === 'active', error };
  },

  async getSavedUsers(userId: string) {
    const { data, error } = await supabase
      .from('saved_users')
      .select(`
        *,
        saved_user:profiles!saved_users_saved_user_id_fkey(
          id, full_name, avatar_url, college_name, interests,
          attractiveness_score, bio, age, gender
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async addToSaved(userId: string, savedUserId: string, context?: string, notes?: string) {
    const { data, error } = await supabase
      .from('saved_users')
      .insert({
        user_id: userId,
        saved_user_id: savedUserId,
        saved_from_context: context,
        notes,
      })
      .select()
      .single();

    return { data, error };
  },

  async removeFromSaved(userId: string, savedUserId: string) {
    const { error } = await supabase
      .from('saved_users')
      .delete()
      .eq('user_id', userId)
      .eq('saved_user_id', savedUserId);

    return { error };
  },

  async isUserSaved(userId: string, targetUserId: string) {
    const { data, error } = await supabase
      .from('saved_users')
      .select('id')
      .eq('user_id', userId)
      .eq('saved_user_id', targetUserId)
      .maybeSingle();

    return { isSaved: !!data, error };
  },

  async getInvitees(userId: string) {
    const { data, error } = await supabase
      .from('user_invitees')
      .select(`
        *,
        invitee:profiles!user_invitees_invitee_id_fkey(
          id, full_name, avatar_url, college_name, interests,
          attractiveness_score, bio, age, gender
        )
      `)
      .eq('user_id', userId)
      .order('last_invited_at', { ascending: false });

    return { data, error };
  },

  async getSmartSuggestions(userId: string, filters?: any) {
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .eq('is_profile_completed', true);

    if (filters?.gender) {
      query = query.eq('gender', filters.gender);
    }

    if (filters?.minAge) {
      query = query.gte('age', filters.minAge);
    }

    if (filters?.maxAge) {
      query = query.lte('age', filters.maxAge);
    }

    if (filters?.minScore) {
      query = query.gte('attractiveness_score', filters.minScore);
    }

    if (filters?.collegeId) {
      query = query.eq('college_id', filters.collegeId);
    }

    if (filters?.interests && filters.interests.length > 0) {
      query = query.contains('interests', filters.interests);
    }

    const { data, error } = await query
      .order('attractiveness_score', { ascending: false })
      .limit(filters?.limit || 50);

    return { data, error };
  },

  async bulkInviteToEvent(eventId: string, userIds: string[], message?: string) {
    const invitations = userIds.map((inviteeId) => ({
      event_id: eventId,
      invitee_id: inviteeId,
      message,
    }));

    const { data, error } = await supabase
      .from('event_invitations')
      .insert(invitations)
      .select();

    return { data, error };
  },

  async getUserStats(userId: string) {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('attractiveness_score, engagement_points, social_streak_days')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) return { data: null, error };

    const [events, invitations, friends] = await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('host_id', userId),
      supabase.from('event_invitations').select('id', { count: 'exact', head: true }).eq('invitee_id', userId),
      supabase.from('friendships').select('id', { count: 'exact', head: true }).or(`user1_id.eq.${userId},user2_id.eq.${userId}`).eq('status', 'active'),
    ]);

    const rating = this.displayRating(user.attractiveness_score);

    return {
      data: {
        eventsCreated: events.count || 0,
        invitationsReceived: invitations.count || 0,
        friendsCount: friends.count || 0,
        attractivenessScore: user.attractiveness_score,
        rating,
        engagementPoints: user.engagement_points,
        socialStreakDays: user.social_streak_days,
      },
      error: null,
    };
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
