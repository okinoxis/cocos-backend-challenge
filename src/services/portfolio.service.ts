import { PortfolioDto } from "../dtos/portfolio.dto";
import {
  getRepositories,
  getFilledOrders,
  getLatestMarketData,
  calculateAvailableCash,
  calculatePositions,
  calculateTotalAccountValue,
} from "../utils/helpers";
import { EntityNotFoundError } from "typeorm";

/**
 * Retrieves the portfolio information for a given user.
 *
 * This function performs the following steps:
 * 1. Verifies the user exists
 * 2. Retrieves all filled orders for the user
 * 3. Calculates the user's positions based on their filled orders
 * 4. Calculates the user's available cash
 * 5. Retrieves the latest market data for the user's instruments
 * 6. Calculates the total account value
 *
 * @param userId - The ID of the user whose portfolio is to be retrieved.
 * @returns A promise that resolves to a PortfolioDto containing the user's portfolio information.
 * @throws EntityNotFoundError if the user is not found.
 * @throws Error if there's an issue retrieving the data.
 */
export async function getPortfolioService(
  userId: number,
): Promise<PortfolioDto> {
  const { userRepository } = getRepositories();

  try {
    // Verify that the user exists
    await userRepository.findOneOrFail({ where: { id: userId } });
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      throw new EntityNotFoundError("User", userId.toString());
    }
    throw error;
  }

  // Retrieve all filled orders for the user
  const filledOrders = await getFilledOrders(userId);

  // Calculate the user's positions based on their filled orders
  const positions = calculatePositions(filledOrders);

  // Calculate the user's available cash
  const availableCash = calculateAvailableCash(filledOrders);

  // Retrieve the latest market data for the first instrument in the user's positions
  let latestMarketData = await getLatestMarketData(positions[0]?.instrumentId);

  // Calculate the total account value
  const totalAccountValue = calculateTotalAccountValue(
    positions,
    latestMarketData,
    availableCash,
  );

  return {
    totalAccountValue,
    availableCash,
    positions,
  };
}
