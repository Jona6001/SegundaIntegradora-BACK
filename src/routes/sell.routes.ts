import { Router } from "express";
import { getAllSells, getSellById, createSell, updateSell, deleteSell } from "../controllers/sells.controller";

const router = Router();

// Usar: /int/sells
router.get("/all", getAllSells);
router.get("/find/:id", getSellById);
router.post("/save", createSell);
router.patch("/update/:id", updateSell);
router.delete("/delete/:id", deleteSell);

export default router;