import express from "express";
import {
  createTransaction,
  deleteTransaction,
  viewTransaction,
} from "../controller";

const router = express.Router();

router.get("/all", viewTransaction);
router.post("/add", createTransaction);
router.delete("/delete/:transactionId", deleteTransaction);

export default router;
