import { Router, type IRouter } from "express";
import healthRouter from "./health";
import trackingRouter from "./tracking";
import authRouter from "./auth";
import shipmentsRouter from "./shipments";
import quoteRequestsRouter from "./quote-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(trackingRouter);
router.use(authRouter);
router.use(shipmentsRouter);
router.use(quoteRequestsRouter);

export default router;
