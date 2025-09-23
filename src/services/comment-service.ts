import { BaseService } from './base/base-service';
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface Comment {
  _id: Id<"comments">;
  authorId: Id<"users">;
  targetType: "course" | "mentor" | "session" | "booking";
  targetId: string;
  rating?: number;
  comment: string;
  isPublic: boolean;
  isVerified: boolean;
  parentCommentId?: Id<"comments">;
  likes?: number;
  dislikes?: number;
  status: "pending" | "approved" | "rejected" | "hidden";
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentWithAuthor extends Comment {
  author?: {
    _id: Id<"users">;
    name: string;
    avatar?: string;
    role: "admin" | "mentor" | "siswa";
  };
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

class CommentService extends BaseService {
  // Basic CRUD
  useComments() {
    return this.provider.useQuery(api.comments.getAll, {});
  }

  useCommentById(id: Id<"comments">) {
    return this.provider.useQuery(api.comments.getById, { id });
  }

  useCommentsByTarget(targetType: Comment['targetType'], targetId: string) {
    return this.provider.useQuery(api.comments.getByTarget, { targetType, targetId });
  }

  useCommentsByAuthor(authorId: Id<"users">) {
    return this.provider.useQuery(api.comments.getByAuthor, { authorId });
  }

  usePendingComments() {
    return this.provider.useQuery(api.comments.getPendingReviews, {});
  }

  useApprovedComments() {
    return this.provider.useQuery(api.comments.getApprovedComments, {});
  }

  useCommentReplies(parentCommentId: Id<"comments">) {
    return this.provider.useQuery(api.comments.getCommentReplies, { parentCommentId });
  }

  // Mutations
  async createComment(data: Omit<Comment, '_id' | 'isVerified' | 'likes' | 'dislikes' | 'status' | 'createdAt' | 'updatedAt'>) {
    return await this.provider.useMutation(api.comments.create, data);
  }

  async updateComment(id: Id<"comments">, updates: { comment?: string; rating?: number; isPublic?: boolean }) {
    return await this.provider.useMutation(api.comments.update, { id, ...updates });
  }

  async deleteComment(id: Id<"comments">) {
    return await this.provider.useMutation(api.comments.remove, { id });
  }

  async moderateComment(id: Id<"comments">, status: Comment['status'], moderatorId: string) {
    return await this.provider.useMutation(api.comments.moderateComment, { id, status, moderatorId });
  }

  async likeComment(id: Id<"comments">) {
    return await this.provider.useMutation(api.comments.likeComment, { id });
  }

  async dislikeComment(id: Id<"comments">) {
    return await this.provider.useMutation(api.comments.dislikeComment, { id });
  }

  async verifyComment(id: Id<"comments">, verifierId: string) {
    return await this.provider.useMutation(api.comments.verifyComment, { id, verifierId });
  }

  // Rating and statistics
  useAverageRating(targetType: Comment['targetType'], targetId: string) {
    return this.provider.useQuery(api.comments.getAverageRating, { targetType, targetId });
  }

  useCommentStats(targetId: string) {
    return this.provider.useQuery(api.comments.getCommentStats, { targetId });
  }

  // Advanced comment management
  async createReply(parentCommentId: Id<"comments">, authorId: Id<"users">, comment: string) {
    const parentComment = await this.provider.useQuery(api.comments.getById, { id: parentCommentId });
    if (!parentComment) throw new Error("Parent comment not found");

    return await this.createComment({
      authorId,
      targetType: parentComment.targetType,
      targetId: parentComment.targetId,
      comment,
      isPublic: true,
      parentCommentId
    });
  }

  // Comment filtering and sorting
  async getFilteredComments(
    targetType: Comment['targetType'],
    targetId: string,
    filters: {
      rating?: number;
      isVerified?: boolean;
      sortBy?: 'newest' | 'oldest' | 'rating' | 'likes';
    }
  ) {
    const comments = await this.provider.useQuery(api.comments.getByTarget, { targetType, targetId });
    if (!comments) return [];

    let filtered = [...comments];

    // Apply filters
    if (filters.rating) {
      filtered = filtered.filter(c => c.rating === filters.rating);
    }

    if (filters.isVerified !== undefined) {
      filtered = filtered.filter(c => c.isVerified === filters.isVerified);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'likes':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }

    return filtered;
  }

  // Comment analytics for mentors
  async getMentorReviewAnalytics(mentorId: Id<"users">) {
    const mentorIdString = mentorId.toString();
    const [rating, stats] = await Promise.all([
      this.provider.useQuery(api.comments.getAverageRating, {
        targetType: "mentor",
        targetId: mentorIdString
      }),
      this.provider.useQuery(api.comments.getCommentStats, { targetId: mentorIdString })
    ]);

    return {
      rating: rating || { averageRating: 0, totalReviews: 0, ratingDistribution: {} },
      stats: stats || { total: 0, approved: 0, pending: 0, rejected: 0, totalLikes: 0 },
      trends: {
        weeklyGrowth: 0, // Would calculate from date ranges
        popularityScore: (rating?.averageRating || 0) * (stats?.totalLikes || 0)
      }
    };
  }

  // Comment moderation helpers
  async bulkModerateComments(commentIds: Id<"comments">[], status: Comment['status'], moderatorId: string) {
    const results = [];
    for (const id of commentIds) {
      try {
        const result = await this.moderateComment(id, status, moderatorId);
        results.push({ success: true, commentId: id, result });
      } catch (error) {
        results.push({ success: false, commentId: id, error: error.message });
      }
    }
    return results;
  }

  async flagInappropriateComments(keywords: string[]) {
    const allComments = await this.provider.useQuery(api.comments.getApprovedComments, {});
    if (!allComments) return [];

    const flagged = allComments.filter(comment => {
      const text = comment.comment.toLowerCase();
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    });

    return flagged.map(comment => ({
      ...comment,
      flagReason: keywords.find(keyword =>
        comment.comment.toLowerCase().includes(keyword.toLowerCase())
      )
    }));
  }

  // Comment validation
  validateComment(data: Partial<Comment>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.comment || data.comment.trim().length < 10) {
      errors.push("Comment must be at least 10 characters long");
    }

    if (data.comment && data.comment.length > 1000) {
      errors.push("Comment cannot exceed 1000 characters");
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      errors.push("Rating must be between 1 and 5");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export functions for reports
  async exportComments(targetType?: Comment['targetType'], targetId?: string) {
    let comments;
    if (targetType && targetId) {
      comments = await this.provider.useQuery(api.comments.getByTarget, { targetType, targetId });
    } else {
      comments = await this.provider.useQuery(api.comments.getApprovedComments, {});
    }

    return {
      exportDate: new Date().toISOString(),
      comments: comments || [],
      count: comments?.length || 0,
      filters: { targetType, targetId }
    };
  }

  // Real-time comment notifications
  async notifyNewComment(comment: Comment) {
    // This would integrate with notification service
    return {
      type: 'new_comment',
      targetType: comment.targetType,
      targetId: comment.targetId,
      authorId: comment.authorId,
      message: `New comment on ${comment.targetType}`,
      timestamp: new Date().toISOString()
    };
  }

  // Comment reporting and abuse detection
  async reportComment(commentId: Id<"comments">, reporterId: Id<"users">, reason: string) {
    // This would create a report entry and potentially auto-moderate
    return {
      commentId,
      reporterId,
      reason,
      status: 'pending_review',
      reportedAt: new Date().toISOString()
    };
  }

  // Comment sentiment analysis (placeholder for future AI integration)
  analyzeSentiment(comment: string): { sentiment: 'positive' | 'negative' | 'neutral'; confidence: number } {
    // Simple keyword-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'love'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible'];

    const text = comment.toLowerCase();
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', confidence: positiveCount / (positiveCount + negativeCount) };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', confidence: negativeCount / (positiveCount + negativeCount) };
    } else {
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }
}

export const commentService = new CommentService();