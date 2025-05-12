import type { RequestHandler } from "express";
import db from "../services/db";

export const getHistory: RequestHandler = async (req, res) => {
  const logs = await db.chatLog.findMany({
    where: { agentId: req.params.id },
    orderBy: { ts: "asc" },
  });
  res.json(logs);
};