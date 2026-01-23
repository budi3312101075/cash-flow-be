import express from "express";
import { category } from "../../controllers/category.js";

const router = express.Router();

router.get("/category", category);

export default router;
