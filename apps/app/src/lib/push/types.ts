import { z } from "zod";

/** The standard shape returned by `PushSubscription.toJSON()` in the browser. */
export const PushSubscriptionJSONSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});
export type PushSubscriptionJSON = z.infer<typeof PushSubscriptionJSONSchema>;

/** How many past template keys we remember per device, to avoid repeating the same line back-to-back. */
export const RECENT_TEMPLATE_HISTORY_LENGTH = 5;

export const SubscriberRecordSchema = z.object({
  /** A random id generated client-side (localStorage), NOT a user account — this app has no login. */
  deviceId: z.string().min(1),
  subscription: PushSubscriptionJSONSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
  currentStreak: z.number().int().nonnegative(),
  /** Local calendar date ("YYYY-MM-DD") the device last reported a completed practice session. */
  lastPracticedDate: z.string().nullable(),
  lastSentAt: z.number().nullable(),
  recentTemplateKeys: z.array(z.string()).max(RECENT_TEMPLATE_HISTORY_LENGTH),
});
export type SubscriberRecord = z.infer<typeof SubscriberRecordSchema>;

export const NotificationLogEntrySchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  templateKey: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  sentAt: z.number(),
  clickedAt: z.number().nullable(),
});
export type NotificationLogEntry = z.infer<typeof NotificationLogEntrySchema>;
