import express from "express";
import {
  addTransactions,
  getTransactions,
} from "../../controllers/transactions.js";

const router = express.Router();

router.post("/transactions", addTransactions);
router.get("/transactions/:idBank", getTransactions);

export default router;
