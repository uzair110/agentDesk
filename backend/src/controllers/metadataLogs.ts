import type { RequestHandler } from "express";
import db from "../services/db";

export const getLogs: RequestHandler = async (req, res) => {
  const logs = await db.log.findMany({
    where: { agentId: req.params.id },
    orderBy: { ts: "asc" },
  });
  res.json(logs);
};
