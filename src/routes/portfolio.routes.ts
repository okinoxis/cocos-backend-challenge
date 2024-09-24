import { Router } from "express";
import { getPortfolio } from "../controllers/portfolio.controller";

export const portfolioRouter = Router();

portfolioRouter.get("/:userId", (req, res, next) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  next();
}, getPortfolio);