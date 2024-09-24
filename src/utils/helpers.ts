import { AppDataSource } from "../data-source";
import { Order } from "../entity/Order";
import { User } from "../entity/User";
import { Instrument } from "../entity/Instrument";
import { MarketData } from "../entity/MarketData";
import { PortfolioPositionDto } from "../dtos/portfolio.dto";

/**
 * Retrieves all necessary repositories for database operations.
 * @returns An object containing all required repositories.
 */
export function getRepositories() {
  return {
    userRepository: AppDataSource.getRepository(User),
    orderRepository: AppDataSource.getRepository(Order),
    instrumentRepository: AppDataSource.getRepository(Instrument),
    marketDataRepository: AppDataSource.getRepository(MarketData),
  };
}

/**
 * Retrieves all filled orders for a specific user.
 * @param userId - The ID of the user whose orders are to be retrieved.
 * @returns A promise that resolves to an array of filled Order entities.
 */
export async function getFilledOrders(userId: number): Promise<Order[]> {
  const { orderRepository } = getRepositories();
  return orderRepository.find({
    where: { userId: userId, status: "FILLED" },
    relations: ["instrument"],
  });
}

/**
 * Retrieves the latest market data for a specific instrument.
 * 
 * Note: This assumes that if a user has positions, they have at least one instrument.
 * 
 * If the user has no positions, this will be undefined, which is handled in calculateTotalAccountValue.
 * @param instrumentId - The ID of the instrument for which to retrieve market data.
 * @returns A promise that resolves to the latest MarketData entity for the specified instrument, or null if not found.
 */
export async function getLatestMarketData(instrumentId: number): Promise<MarketData | null> {
  const { marketDataRepository } = getRepositories();
  return marketDataRepository.findOne({
    where: { instrumentId: instrumentId },
    order: { date: "DESC" },
  });
}

/**
 * Calculates the available cash based on filled orders.
 * 
 * This considers all cash-related transactions (CASH_IN and CASH_OUT)
 * @param filledOrders - An array of filled Order entities.
 * @returns The total available cash.
 */
export function calculateAvailableCash(filledOrders: Order[]): number {
  return filledOrders.reduce((cash, order) => {
    if (order.instrument.type === "MONEDA") {
      if (order.side === "CASH_IN") {
        return cash + order.size;
      } else if (order.side === "CASH_OUT") {
        return cash - order.size;
      }
    }
    return cash;
  }, 0);
}

/**
 * Calculates the positions based on filled orders.
 * 
 * This function aggregates all orders to determine the current holdings for each instrument
 * @param filledOrders - An array of filled Order entities.
 * @returns An array of PortfolioPositionDto objects representing the calculated positions.
 */
export function calculatePositions(filledOrders: Order[]): PortfolioPositionDto[] {
  const positions: PortfolioPositionDto[] = [];

  filledOrders.forEach((order) => {
    const existingPosition = positions.find(
      (p) => p.instrumentId === order.instrument.id,
    );
    if (existingPosition) {
      if (order.side === "BUY") {
        existingPosition.quantity += order.size;
        existingPosition.totalValue += order.price * order.size;
      } else if (order.side === "SELL") {
        existingPosition.quantity -= order.size;
        existingPosition.totalValue -= order.price * order.size;
      }
    } else {
      positions.push({
        instrumentId: order.instrument.id,
        ticker: order.instrument.ticker,
        name: order.instrument.name,
        quantity: order.side === "BUY" ? order.size : -order.size,
        totalValue:
          order.side === "BUY"
            ? order.price * order.size
            : -order.price * order.size,
        totalReturn: 0,
      });
    }
  });

  return positions;
}

/**
 * Calculates the total account value based on positions, latest market data, and available cash.
 * 
 * This function also updates the totalReturn for each position.
 * @param positions - An array of PortfolioPositionDto objects representing the current positions.
 * @param latestMarketData - The latest MarketData entity.
 * @param availableCash - The total available cash.
 * @returns The calculated total account value.
 */
export function calculateTotalAccountValue(
  positions: PortfolioPositionDto[],
  latestMarketData: MarketData,
  availableCash: number,
): number {
  let totalAccountValue = availableCash;

  positions.forEach((position) => {
    const currentValue = position.quantity * (latestMarketData?.close || 0);
    position.totalReturn =
      ((currentValue - position.totalValue) / position.totalValue) * 100;
    totalAccountValue += currentValue;
  });

  return totalAccountValue;
}

/**
 * Creates a new MONEDA order for cash operations.
 * @param user - The User entity associated with the order.
 * @param instrument - The Instrument entity representing the MONEDA.
 * @param side - The side of the order, either "CASH_IN" or "CASH_OUT".
 * @param amount - The amount of the cash operation.
 * @returns A promise that resolves to the created and saved Order entity.
 */
export async function createMonedaOrder(
  user: User,
  instrument: Instrument,
  side: "CASH_IN" | "CASH_OUT",
  size: number,
  price: number,
): Promise<Order> {
  const { orderRepository } = getRepositories();
  const monedaOrder = new Order();
  monedaOrder.user = user;
  monedaOrder.instrument = instrument;
  monedaOrder.side = side;
  monedaOrder.type = "MARKET";
  monedaOrder.size = size;
  monedaOrder.price = price;
  monedaOrder.status = "FILLED";
  monedaOrder.datetime = new Date();

  return orderRepository.save(monedaOrder);
}