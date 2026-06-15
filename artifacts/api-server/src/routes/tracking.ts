import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, shipmentsTable, trackingEventsTable, quoteRequestsTable } from "@workspace/db";
import {
  GetTrackingParams,
  SubmitQuoteRequestBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tracking/:trackingNumber", async (req, res): Promise<void> => {
  const params = GetTrackingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [shipment] = await db
    .select()
    .from(shipmentsTable)
    .where(eq(shipmentsTable.trackingNumber, params.data.trackingNumber));

  if (!shipment) {
    res.status(404).json({ error: "Shipment not found" });
    return;
  }

  const events = await db
    .select()
    .from(trackingEventsTable)
    .where(eq(trackingEventsTable.shipmentId, shipment.id))
    .orderBy(trackingEventsTable.timestamp);

  res.json({
    ...shipment,
    events: events.map((e) => ({
      ...e,
      shipmentId: e.shipmentId,
      isRead: undefined,
    })),
  });
});

router.post("/quote-requests", async (req, res): Promise<void> => {
  const parsed = SubmitQuoteRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(quoteRequestsTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    isRead: "false",
  });

  res.status(201).json({ success: true });
});

export default router;
