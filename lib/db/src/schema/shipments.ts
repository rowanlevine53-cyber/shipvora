import { pgTable, pgEnum, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trackingEventStatusEnum = pgEnum("tracking_event_status", [
  "packed",
  "shipped",
  "dispatched",
  "out_for_delivery",
  "held_by_customs",
  "delivered",
]);

export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull().unique(),
  recipientName: text("recipient_name").notNull(),
  origin: text("origin"),
  destination: text("destination"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const trackingEventsTable = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  shipmentId: serial("shipment_id").notNull().references(() => shipmentsTable.id, { onDelete: "cascade" }),
  status: trackingEventStatusEnum("status").notNull(),
  location: text("location"),
  note: text("note"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  isRead: text("is_read").notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipmentsTable.$inferSelect;

export const insertTrackingEventSchema = createInsertSchema(trackingEventsTable).omit({ id: true, createdAt: true });
export type InsertTrackingEvent = z.infer<typeof insertTrackingEventSchema>;
export type TrackingEvent = typeof trackingEventsTable.$inferSelect;

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({ id: true, createdAt: true });
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequestsTable.$inferSelect;
