/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as adminOfficeLocations from "../adminOfficeLocations.js";
import type * as adminPricingRules from "../adminPricingRules.js";
import type * as auth from "../auth.js";
import type * as availabilitySlots from "../availabilitySlots.js";
import type * as bookings from "../bookings.js";
import type * as bundlePackages from "../bundlePackages.js";
import type * as categories from "../categories.js";
import type * as comments from "../comments.js";
import type * as courses from "../courses.js";
import type * as createAdminWithKnownPassword from "../createAdminWithKnownPassword.js";
import type * as discountRules from "../discountRules.js";
import type * as eventTemplates from "../eventTemplates.js";
import type * as http from "../http.js";
import type * as learningMaterials from "../learningMaterials.js";
import type * as materialContents from "../materialContents.js";
import type * as mentorSchedules from "../mentorSchedules.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as roadmaps from "../roadmaps.js";
import type * as seedAdmin from "../seedAdmin.js";
import type * as seedData from "../seedData.js";
import type * as slotRequests from "../slotRequests.js";
import type * as studentSubscriptions from "../studentSubscriptions.js";
import type * as testAuth from "../testAuth.js";
import type * as updateAdminPassword from "../updateAdminPassword.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminOfficeLocations: typeof adminOfficeLocations;
  adminPricingRules: typeof adminPricingRules;
  auth: typeof auth;
  availabilitySlots: typeof availabilitySlots;
  bookings: typeof bookings;
  bundlePackages: typeof bundlePackages;
  categories: typeof categories;
  comments: typeof comments;
  courses: typeof courses;
  createAdminWithKnownPassword: typeof createAdminWithKnownPassword;
  discountRules: typeof discountRules;
  eventTemplates: typeof eventTemplates;
  http: typeof http;
  learningMaterials: typeof learningMaterials;
  materialContents: typeof materialContents;
  mentorSchedules: typeof mentorSchedules;
  migrations: typeof migrations;
  notifications: typeof notifications;
  payments: typeof payments;
  roadmaps: typeof roadmaps;
  seedAdmin: typeof seedAdmin;
  seedData: typeof seedData;
  slotRequests: typeof slotRequests;
  studentSubscriptions: typeof studentSubscriptions;
  testAuth: typeof testAuth;
  updateAdminPassword: typeof updateAdminPassword;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
