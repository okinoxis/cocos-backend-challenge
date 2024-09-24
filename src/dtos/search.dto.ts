import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";

export class AssetSearchDto {
  @IsOptional()
  @IsString()
  ticker?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 20;
}

export class AssetDto {
  @IsNumber()
  id: number;

  @IsString()
  ticker: string;

  @IsString()
  name: string;

  @IsString()
  type: string;
}

export class AssetSearchResultDto {
  @IsArray()
  @Type(() => AssetDto)
  assets: AssetDto[];

  @IsNumber()
  totalCount: number;

  @IsNumber()
  totalPages: number;

  @IsNumber()
  currentPage: number;
}
