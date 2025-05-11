import { Router } from "express";
import {
  createAgent,
  listAgents,
  getAgent,
  updateAgent,
  deleteAgent,
} from "../controllers/agents";
import { chatAgent }    from "../controllers/chat";
import { listTools, addTool, removeTool } from "../controllers/agentTools";
import { listAvailableTools } from "../controllers/tools";

const router = Router();

router.post("/",createAgent);
router.get("/",listAgents);
router.get("/:id",getAgent);
router.put("/:id",updateAgent);
router.delete("/:id",deleteAgent);

router.post("/:id/chat", chatAgent);

// Tools APIs
router.get("/tools",listAvailableTools);      
router.get("/:id/tools",listTools);          
router.post("/:id/tools",addTool);
router.delete("/:id/tools/:toolKey",removeTool);

export default router;
