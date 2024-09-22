import express from "express";
import {
  editUserCurrency,
  totalSplit,
  viewUserCurrency,
} from "../controller/index";
import { isAuthUser } from "../middleware/isAuthUser";

const router = express.Router();

router.get("/view", isAuthUser, viewUserCurrency);
router.patch("/edit", isAuthUser, editUserCurrency);
router.get("/totalsplit", isAuthUser, totalSplit);

export default router;
