import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, quoteRequestsTable } from "@workspace/db";
import {
  MarkQuoteRequestReadParams,
  MarkQuoteRequestReadBody,
  DeleteQuoteRequestParams,
} from "@workspace/api-zod";

function requireAdmin(req: any, res: any): boolean {
  if (!req.session?.adminUser) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

const router: IRouter = Router();

router.get("/admin/quote-requests", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const requests = await db
    .select()
    .from(quoteRequestsTable)
    .orderBy(quoteRequestsTable.createdAt);

  res.json(
    requests.map((r) => ({ ...r, isRead: r.isRead === "true" })),
  );
});

router.patch("/admin/quote-requests/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = MarkQuoteRequestReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = MarkQuoteRequestReadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(quoteRequestsTable)
    .set({ isRead: parsed.data.isRead ? "true" : "false" })
    .where(eq(quoteRequestsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Quote request not found" });
    return;
  }

  res.json({ ...updated, isRead: updated.isRead === "true" });
});

router.delete("/admin/quote-requests/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;

  const params = DeleteQuoteRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(quoteRequestsTable)
    .where(eq(quoteRequestsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Quote request not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
