import express from "express";
import transactions from "./api/transactions.js";

const router = express.Router();

router.use(transactions);

export default router;
