/**
 * Mentor Schedule Service
 * Adapter layer untuk Convex DB - mentor schedule features
 */

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface MentorSchedule {
  _id?: Id<"mentorSchedules">;
  id?: number; // Legacy field for backward compatibility
  mentorId: string;
  title: string;
  description: string;
  duration: number;
  maxCapacity: number;
  materials: string[];
  materialIds?: string[];
  requiredLevel?: number;
  maxLevelGap?: number;
  verificationRequired?: boolean;
  autoLevelCheck?: boolean;
  allowLevelJumpers?: boolean;
  meetingType: 'online' | 'offline';
  meetingProvider: 'zoom' | 'google-meet';
  locationId?: number;
  timezone: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailabilitySlot {
  _id?: Id<"availabilitySlots">;
  id?: number; // Legacy field
  mentorId: string;
  scheduleId?: Id<"mentorSchedules">;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlotRequest {
  _id?: Id<"slotRequests">;
  id?: number; // Legacy field
  studentId: string;
  studentName: string;
  studentEmail: string;
  mentorId: string;
  scheduleId: string;
  scheduleTitle: string;
  requestedDate: string;
  requestedTime: string;
  duration: number;
  preferredMeetingType: 'online' | 'offline';
  materials: string[];
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  responseMessage?: string;
  respondedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// This service provides non-hook methods for use in event handlers and callbacks
// For React components, import and use the Convex hooks directly
export class MentorScheduleService {
  // Note: These methods return functions that components should use with Convex hooks
  // They cannot be called directly in async contexts

  static getClientMethods() {
    return {
      // Mentor Schedules
      useAllSchedules: () => api.mentorSchedules.getAll,
      useScheduleById: (id: Id<"mentorSchedules">) => api.mentorSchedules.getById,
      useSchedulesByMentor: (mentorId: string) => api.mentorSchedules.getByMentorString,

      // Availability Slots
      useAllSlots: () => api.availabilitySlots.getAll,
      useSlotsByMentor: (mentorId: string) => api.availabilitySlots.getByMentor,
      useSlotsBySchedule: (scheduleId: Id<"mentorSchedules">) => api.availabilitySlots.getBySchedule,

      // Slot Requests
      useAllRequests: () => api.slotRequests.getAll,
      useRequestsByStudent: (studentId: string) => api.slotRequests.getByStudent,
      useRequestsByMentor: (mentorId: string) => api.slotRequests.getByMentor,
      usePendingRequestsByMentor: (mentorId: string) => api.slotRequests.getPendingByMentor,

      // Bookings
      useAllBookings: () => api.bookings.getAll,
      useBookingsByMentor: (mentorId: string) => api.bookings.getByMentor,
      useBookingsByStudent: (studentId: Id<"users">) => api.bookings.getByStudent,
      useBookingsByStatus: (status: 'confirmed' | 'pending' | 'cancelled' | 'completed') => api.bookings.getByStatus,
      useBookingsByDate: (date: string) => api.bookings.getByDate,
    };
  }

  // Mutation helpers - these return the API references
  static getMutations() {
    return {
      // Schedule mutations
      createSchedule: api.mentorSchedules.create,
      updateSchedule: api.mentorSchedules.update,
      deleteSchedule: api.mentorSchedules.remove,
      toggleScheduleActive: api.mentorSchedules.toggleActive,

      // Availability mutations
      createSlot: api.availabilitySlots.create,
      updateSlot: api.availabilitySlots.update,
      deleteSlot: api.availabilitySlots.remove,
      bulkCreateSlots: api.availabilitySlots.bulkCreate,
      deleteSlotsBySchedule: api.availabilitySlots.deleteBySchedule,

      // Request mutations
      createRequest: api.slotRequests.create,
      updateRequest: api.slotRequests.update,
      updateRequestStatus: api.slotRequests.updateStatus,
      deleteRequest: api.slotRequests.remove,
      bulkUpdateRequestStatus: api.slotRequests.bulkUpdateStatus,

      // Booking mutations
      createBooking: api.bookings.create,
      updateBooking: api.bookings.update,
      updateBookingStatus: api.bookings.updateStatus,
      deleteBooking: api.bookings.remove,
    };
  }

  // Helper to convert Convex ID to legacy number ID (for backward compatibility)
  static convexIdToLegacyId(convexId: Id<any>): number {
    // Simple hash function to convert string ID to number
    let hash = 0;
    for (let i = 0; i < convexId.length; i++) {
      const char = convexId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Helper to add legacy fields to objects
  static addLegacyFields<T extends { _id?: Id<any> }>(obj: T): T & { id?: number } {
    if (!obj._id) return obj as T & { id?: number };
    return {
      ...obj,
      id: this.convexIdToLegacyId(obj._id),
    };
  }

  // Helper to convert array of objects with legacy fields
  static addLegacyFieldsToArray<T extends { _id?: Id<any> }>(arr: T[]): (T & { id?: number })[] {
    return arr.map(item => this.addLegacyFields(item));
  }
}

// Export singleton instance
export const mentorScheduleService = new MentorScheduleService();
