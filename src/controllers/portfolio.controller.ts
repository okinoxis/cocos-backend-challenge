import { Request, Response, NextFunction } from "express";
import { getPortfolioService } from "../services/portfolio.service";
import { EntityNotFoundError } from "typeorm";

export const getPortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = parseInt(req.params.userId);
    const portfolio = await getPortfolioService(userId);
    res.json(portfolio);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res
        .status(404)
        .json({ message: `User with ID ${req.params.userId} not found` });
    } else {
      next(error);
    }
  }
};
