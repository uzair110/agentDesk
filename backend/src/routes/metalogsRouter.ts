import { Router } from "express";
import { getAllLogs } from "../controllers/metadataLogs";

const router = Router();

router.get("/all", getAllLogs);

export default router;