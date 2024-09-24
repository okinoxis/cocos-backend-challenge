import { Request, Response, NextFunction } from "express";
import {
  cancelOrderService,
  submitOrderService,
} from "../services/order.service";
import { SubmitOrderDto } from "../dtos/order.dto";
import { CancelOrderDto } from "../dtos/cancel-order.dto";

export const submitOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderDto: SubmitOrderDto = req.body;
    const submittedOrder = await submitOrderService(orderDto);
    res.json(submittedOrder);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cancelOrderDto: CancelOrderDto = req.body;
    const cancelledOrder = await cancelOrderService(cancelOrderDto);
    res.json(cancelledOrder);
  } catch (error) {
    next(error);
  }
};
