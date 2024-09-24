import { Router } from "express";
import { submitOrder, cancelOrder } from "../controllers/order.controller";
import { validateDto } from "../middleware/validateDto";
import { SubmitOrderDto } from "../dtos/order.dto";
import { CancelOrderDto } from "../dtos/cancel-order.dto";

export const orderRouter = Router();

orderRouter.post("/submit", validateDto(SubmitOrderDto), submitOrder);
orderRouter.post("/cancel", validateDto(CancelOrderDto), cancelOrder);