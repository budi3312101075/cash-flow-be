import express from "express";
import transactions from "./api/transactions.js";
import category from "./api/category.js";

const router = express.Router();

router.use(transactions);
router.use(category);

export default router;
