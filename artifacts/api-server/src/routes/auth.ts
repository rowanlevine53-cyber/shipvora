import { Router, type IRouter } from "express";
import { AdminLoginBody } from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    adminUser?: string;
  }
}

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "courier2024";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.adminUser = username;
  res.json({ username, loggedIn: true });
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  if (!req.session.adminUser) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ username: req.session.adminUser, loggedIn: true });
});

export default router;
