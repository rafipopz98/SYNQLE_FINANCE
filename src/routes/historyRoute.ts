import express from "express";
import { isAuthUser } from "../middleware/isAuthUser";
import { getHistory, historyPeriods } from "../controller";

const router = express.Router();

router.get("/getHistory", isAuthUser, getHistory);
router.get("/historyPeriods", isAuthUser, historyPeriods);

export default router;
