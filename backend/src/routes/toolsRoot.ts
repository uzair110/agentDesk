import { Router } from "express";
import { listAvailableTools } from "../controllers/tools";

const router = Router();
router.get("/", listAvailableTools);
export default router;
