import type { RequestHandler } from "express";
import { availableTools } from "../services/availableTools";

export const listAvailableTools: RequestHandler = (_req, res) => {
  res.json(availableTools);
};