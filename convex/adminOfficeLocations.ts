import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("adminOfficeLocations").collect();
  },
});

export const getById = query({
  args: { id: v.id("adminOfficeLocations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActiveLocations = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("adminOfficeLocations")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("adminOfficeLocations")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getNearbyLocations = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radiusKm || 10; // Default 10km radius
    const locations = await ctx.db
      .query("adminOfficeLocations")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Simple distance calculation (Haversine formula approximation)
    return locations.filter(location => {
      const lat1 = args.latitude;
      const lon1 = args.longitude;
      const lat2 = location.coordinates.latitude;
      const lon2 = location.coordinates.longitude;

      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return distance <= radius;
    }).map(location => ({
      ...location,
      distance: calculateDistance(args.latitude, args.longitude, location.coordinates.latitude, location.coordinates.longitude)
    })).sort((a, b) => a.distance - b.distance);
  },
});

// Helper function for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Mutations
export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    province: v.string(),
    postalCode: v.string(),
    coordinates: v.object({
      latitude: v.number(),
      longitude: v.number(),
    }),
    facilities: v.array(v.string()),
    capacity: v.number(),
    operatingHours: v.object({
      weekdays: v.string(),
      weekends: v.string(),
    }),
    contactPerson: v.string(),
    contactPhone: v.string(),
    isActive: v.boolean(),
    photos: v.optional(v.array(v.string())),
    amenities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.insert("adminOfficeLocations", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("adminOfficeLocations"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    coordinates: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    facilities: v.optional(v.array(v.string())),
    capacity: v.optional(v.number()),
    operatingHours: v.optional(v.object({
      weekdays: v.string(),
      weekends: v.string(),
    })),
    contactPerson: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    photos: v.optional(v.array(v.string())),
    amenities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = new Date().toISOString();

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("adminOfficeLocations") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("adminOfficeLocations") },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.id);
    if (!location) throw new Error("Office location not found");

    return await ctx.db.patch(args.id, {
      isActive: !location.isActive,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Utility functions
export const checkAvailability = query({
  args: {
    locationId: v.id("adminOfficeLocations"),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    requiredCapacity: v.number(),
  },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location || !location.isActive) {
      return { available: false, reason: "Location not available" };
    }

    if (args.requiredCapacity > location.capacity) {
      return { available: false, reason: "Capacity exceeded" };
    }

    // Check if location has required facilities
    // This would need integration with booking system to check actual availability

    return {
      available: true,
      location: location,
      maxCapacity: location.capacity,
      availableFacilities: location.facilities,
    };
  },
});

export const getLocationStats = query({
  args: { locationId: v.id("adminOfficeLocations") },
  handler: async (ctx, args) => {
    const location = await ctx.db.get(args.locationId);
    if (!location) throw new Error("Location not found");

    // This would typically integrate with bookings to get real usage stats
    return {
      location: location,
      totalCapacity: location.capacity,
      utilizationRate: 0, // Would calculate from bookings
      popularTimes: [], // Would analyze from booking patterns
      averageSessionDuration: 0, // Would calculate from completed sessions
    };
  },
});