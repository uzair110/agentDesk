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
import { getHistory } from "../controllers/logs";
import { getLogs, getAllLogs } from "../controllers/metadataLogs";

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

// Logs APIs
router.get("/:id/logs",getHistory);
router.get("/:id/metalogs",getLogs);
router.get("/metalogs/all",getAllLogs);


export default router;
