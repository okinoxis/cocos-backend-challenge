import { SubmitOrderDto, OrderResponseDto } from "../dtos/order.dto";
import {
  getRepositories,
  getFilledOrders,
  getLatestMarketData,
  calculateAvailableCash,
  createMonedaOrder,
} from "../utils/helpers";
import { Order } from "../entity/Order";
import { CancelOrderDto } from "../dtos/cancel-order.dto";

/**
 * Submits an order for a user and processes it based on the order type and available resources.
 *
 * This function performs the following steps:
 * 1. Retrieves user and instrument information
 * 2. Calculates the order price and quantity
 * 3. Creates a new order
 * 4. Validates the order based on available cash or user position
 * 5. Saves the order
 * 6. Updates available cash if the order is filled
 *
 * @param orderDto - The DTO containing order information
 * @returns A promise that resolves to an OrderResponseDto containing the processed order information
 * @throws Error if the user or instrument is not found, or if there's an issue processing the order
 */
export async function submitOrderService(
  orderDto: SubmitOrderDto,
): Promise<OrderResponseDto> {
  const { userRepository, instrumentRepository, orderRepository } =
    getRepositories();

  // Retrieve user and instrument information
  const user = await userRepository.findOneOrFail({
    where: { id: orderDto.userId },
  });
  const instrument = await instrumentRepository.findOneOrFail({
    where: { id: orderDto.instrumentId },
  });

  // Get the latest market data for the instrument
  const latestMarketData = await getLatestMarketData(orderDto.instrumentId);

  // Calculate the order price
  let price = orderDto.price ? orderDto.price : undefined;
  if (orderDto.type === "MARKET") {
    price = latestMarketData?.close ? latestMarketData.close : 0;
  }

  let quantity = orderDto.quantity;

  // Create a new order
  const order = new Order();
  order.user = user;
  order.instrument = instrument;
  order.side = orderDto.side;
  order.type = orderDto.type;
  order.size = quantity || 0;
  order.price = price || 0;
  order.status = orderDto.type === "MARKET" ? "FILLED" : "NEW"; // Market orders are filled immediately
  order.datetime = new Date();

  // Get all filled orders for the user to calculate available cash and positions
  const filledOrders = await getFilledOrders(orderDto.userId);
  let availableCash = calculateAvailableCash(filledOrders);

  // Validate order
  if (orderDto.side === "BUY") {
    const totalCost = (quantity || 0) * (price || 0);
    if (totalCost > availableCash) {
      order.status = "REJECTED"; // Reject if not enough cash available
    }
  } else if (orderDto.side === "SELL") {
    // Calculate the user's position for this instrument
    const userPosition = filledOrders.reduce((total, filledOrder) => {
      if (filledOrder.instrument.id === instrument.id) {
        return (
          total +
          (filledOrder.side === "BUY" ? filledOrder.size : -filledOrder.size)
        );
      }
      return total;
    }, 0);

    if (userPosition < (quantity || 0)) {
      order.status = "REJECTED"; // Reject if not enough shares to sell
    }
  }

  // Save the order
  const savedOrder = await orderRepository.save(order);

  // Update available cash if order is filled
  if (savedOrder.status === "FILLED") {
    const monedaInstrument = await instrumentRepository.findOne({
      where: { type: "MONEDA" },
    });

    if (monedaInstrument) {
      // Create a MONEDA order to reflect the cash movement
      await createMonedaOrder(
        user,
        monedaInstrument,
        savedOrder.side === "BUY" ? "CASH_OUT" : "CASH_IN",
        savedOrder.size,
        savedOrder.price,
      );
    }
  }

  return {
    id: savedOrder.id,
    userId: savedOrder.user.id,
    instrumentId: savedOrder.instrument.id,
    side: savedOrder.side as "BUY" | "SELL" | "CASH_IN" | "CASH_OUT",
    type: savedOrder.type as "MARKET" | "LIMIT",
    quantity: savedOrder.size,
    price: savedOrder.price,
    status: savedOrder.status as "FILLED" | "NEW" | "REJECTED" | "CANCELLED",
    datetime: savedOrder.datetime.toISOString(),
  };
}

/**
 * Cancels an order for a user.
 *
 * This function performs the following steps:
 * 1. Retrieves the order information
 * 2. Checks if the order can be cancelled
 * 3. Cancels the order if possible
 * 4. Saves the updated order
 *
 * @param cancelOrderDto - The DTO containing the order ID to be cancelled
 * @returns A promise that resolves to an OrderResponseDto containing the processed order information
 * @throws Error if the order is not found, cannot be cancelled, or if there's an issue processing the order
 */
export async function cancelOrderService(
  cancelOrderDto: CancelOrderDto,
): Promise<OrderResponseDto> {
  const { orderRepository } = getRepositories();

  // Retrieve the order
  const order = await orderRepository.findOne({
    where: { id: cancelOrderDto.orderId },
    relations: ["user", "instrument"],
  });

  if (!order) {
    throw new Error(`Order with ID ${cancelOrderDto.orderId} not found`);
  }

  // Check if the order can be cancelled
  if (order.status !== "NEW") {
    throw new Error(`Cannot cancel order with status ${order.status}`);
  }

  // Cancel the order
  order.status = "CANCELLED";
  order.datetime = new Date(); // Update the datetime to reflect when it was cancelled

  // Save the updated order
  const savedOrder = await orderRepository.save(order);

  return {
    id: savedOrder.id,
    userId: savedOrder.user.id,
    instrumentId: savedOrder.instrument.id,
    side: savedOrder.side as "BUY" | "SELL" | "CASH_IN" | "CASH_OUT",
    type: savedOrder.type as "MARKET" | "LIMIT",
    quantity: savedOrder.size,
    price: savedOrder.price,
    status: savedOrder.status as "NEW" | "FILLED" | "REJECTED" | "CANCELLED",
    datetime: savedOrder.datetime.toISOString(),
  };
}
