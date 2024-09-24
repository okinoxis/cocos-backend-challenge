import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsDecimal,
  IsString,
} from "class-validator";

export class SubmitOrderDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  instrumentId: number;

  @IsEnum(["BUY", "SELL", "CASH_IN", "CASH_OUT"])
  side: "BUY" | "SELL" | "CASH_IN" | "CASH_OUT";

  @IsEnum(["MARKET", "LIMIT"])
  type: "MARKET" | "LIMIT";

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: "2" })
  price?: number;
}

export class OrderResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  userId: number;

  @IsNumber()
  instrumentId: number;

  @IsEnum(["BUY", "SELL", "CASH_IN", "CASH_OUT"])
  side: "BUY" | "SELL" | "CASH_IN" | "CASH_OUT";

  @IsEnum(["MARKET", "LIMIT"])
  type: "MARKET" | "LIMIT";

  @IsNumber()
  quantity: number;

  @IsDecimal({ decimal_digits: "2" })
  price: number;

  @IsEnum(["NEW", "FILLED", "REJECTED", "CANCELLED"])
  status: "NEW" | "FILLED" | "REJECTED" | "CANCELLED";

  @IsString()
  datetime: string;
}
