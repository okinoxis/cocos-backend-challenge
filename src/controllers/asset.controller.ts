import { Request, Response } from "express";
import { searchAssetsService } from "../services/asset.service";
import { AssetSearchDto } from "../dtos/search.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

export async function searchAssets(req: Request, res: Response) {
  try {
    // Convert query parameters to AssetSearchDto
    const searchParams = plainToClass(AssetSearchDto, req.query);

    // Validate the DTO
    const errors = await validate(searchParams);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({
          errors: errors.map((error) => Object.values(error.constraints)),
        });
    }

    const result = await searchAssetsService(searchParams);
    res.json(result);
  } catch (error) {
    console.error("Error searching assets:", error);
    res
      .status(500)
      .json({ error: "An error occurred while searching for assets" });
  }
}
