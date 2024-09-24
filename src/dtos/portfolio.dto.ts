import { IsNumber, IsString, IsDecimal, IsArray } from "class-validator";
import { Type } from "class-transformer";

export class PortfolioPositionDto {
  @IsNumber()
  instrumentId: number;

  @IsString()
  ticker: string;

  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsDecimal({ decimal_digits: "2" })
  totalValue: number;

  @IsDecimal({ decimal_digits: "2" })
  totalReturn: number;
}

export class PortfolioDto {
  @IsDecimal({ decimal_digits: "2" })
  totalAccountValue: number;

  @IsDecimal({ decimal_digits: "2" })
  availableCash: number;

  @IsArray()
  @Type(() => PortfolioPositionDto)
  positions: PortfolioPositionDto[];
}
