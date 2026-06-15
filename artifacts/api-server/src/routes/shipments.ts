import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, shipmentsTable, trackingEventsTable } from "@workspace/db";
import {
  GetShipmentParams,
  UpdateShipmentParams,
  DeleteShipmentParams,
  CreateShipmentBody,
  UpdateShipmentBody,
  AddTrackingEventParams,
  AddTrackingEventBody,
  UpdateTrackingEventParams,
  UpdateTrackingEventBody,
  DeleteTrackingEventParams,
} from "@workspace/api-zod";

function requireAdmin(req: any, res: any): boolean {
  if (!req.session?.adminUser) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

function generateTrackingNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TRK-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const router: IRouter = Router();

router.get("/admin/shipments", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const shipments = await db
    .select()
    .from(shipmentsTable)
    .orderBy(shipmentsTable.createdAt);

  res.json(shipments);
});

router.post("/admin/shipments", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const parsed = CreateShipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const trackingNumber = generateTrackingNumber();

  const [shipment] = await db
    .insert(shipmentsTable)
    .values({
      trackingNumber,
      recipientName: parsed.data.recipientName,
      origin: parsed.data.origin ?? null,
      destination: parsed.data.destination ?? null,
      description: parsed.data.description ?? null,
    })
    .returning();

  res.status(201).json(shipment);
});

router.get("/admin/shipments/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = GetShipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [shipment] = await db
    .select()
    .from(shipmentsTable)
    .where(eq(shipmentsTable.id, params.data.id));

  if (!shipment) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  const events = await db
    .select()
    .from(trackingEventsTable)
    .where(eq(trackingEventsTable.shipmentId, shipment.id))
    .orderBy(trackingEventsTable.timestamp);

  res.json({ ...shipment, events });
});

router.put("/admin/shipments/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = UpdateShipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateShipmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.recipientName !== undefined) updateData.recipientName = parsed.data.recipientName;
  if ("origin" in parsed.data) updateData.origin = parsed.data.origin;
  if ("destination" in parsed.data) updateData.destination = parsed.data.destination;
  if ("description" in parsed.data) updateData.description = parsed.data.description;

  const [updated] = await db
    .update(shipmentsTable)
    .set(updateData)
    .where(eq(shipmentsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  res.json(updated);
});

router.delete("/admin/shipments/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = DeleteShipmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(shipmentsTable)
    .where(eq(shipmentsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/admin/shipments/:id/events", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = AddTrackingEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [shipment] = await db
    .select()
    .from(shipmentsTable)
    .where(eq(shipmentsTable.id, params.data.id));

  if (!shipment) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  const parsed = AddTrackingEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db
    .insert(trackingEventsTable)
    .values({
      shipmentId: shipment.id,
      status: parsed.data.status as any,
      location: parsed.data.location ?? null,
      note: parsed.data.note ?? null,
      timestamp: new Date(parsed.data.timestamp),
    })
    .returning();

  res.status(201).json(event);
});

router.put("/admin/events/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = UpdateTrackingEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTrackingEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if ("location" in parsed.data) updateData.location = parsed.data.location;
  if ("note" in parsed.data) updateData.note = parsed.data.note;
  if (parsed.data.timestamp !== undefined) updateData.timestamp = new Date(parsed.data.timestamp);

  const [updated] = await db
    .update(trackingEventsTable)
    .set(updateData)
    .where(eq(trackingEventsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Tracking event not found" });
    return;
  }

  res.json(updated);
});

router.delete("/admin/events/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = DeleteTrackingEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(trackingEventsTable)
    .where(eq(trackingEventsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Tracking event not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
