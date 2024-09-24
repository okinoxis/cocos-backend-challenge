import { AppDataSource } from "../data-source";
import { Instrument } from "../entity/Instrument";
import {
  AssetSearchDto,
  AssetSearchResultDto,
  AssetDto,
} from "../dtos/search.dto";
import { ILike, FindOptionsWhere } from "typeorm";

/**
 * Searches for assets (instruments) based on ticker and/or name with pagination.
 *
 * This function performs the following steps:
 * 1. Constructs a where clause based on the provided search parameters
 * 2. Queries the database for matching instruments using case-insensitive search
 * 3. Applies pagination to the results
 * 4. Maps the results to the AssetDto format
 *
 * @param searchParams - The search parameters including ticker, name, page, and pageSize
 * @returns A promise that resolves to an AssetSearchResultDto containing the paginated results and metadata
 * @throws Error if there's an issue querying the database
 */
export async function searchAssetsService(
  searchParams: AssetSearchDto,
): Promise<AssetSearchResultDto> {
  const { ticker, name, page = 1, pageSize = 20 } = searchParams;

  // Get the repository for the Instrument entity
  const instrumentRepository = AppDataSource.getRepository(Instrument);

  const whereClause: FindOptionsWhere<Instrument> = {};

  if (ticker) {
    whereClause.ticker = ILike(`%${ticker}%`);
  }

  if (name) {
    whereClause.name = ILike(`%${name}%`);
  }

  // Calculate skip for pagination
  const skip = (page - 1) * pageSize;

  // Query the database for matching instruments with pagination
  const [instruments, totalCount] = await instrumentRepository.findAndCount({
    where: whereClause,
    skip: skip,
    take: pageSize,
    order: {
      ticker: "ASC", // Order results by ticker
    },
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Map the results to AssetDto
  const assets: AssetDto[] = instruments.map((instrument) => ({
    id: instrument.id,
    ticker: instrument.ticker,
    name: instrument.name,
    type: instrument.type,
  }));

  return {
    assets,
    totalCount,
    totalPages,
    currentPage: page,
  };
}
