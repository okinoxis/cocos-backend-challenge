import { Router } from "express";
import { searchAssets } from "../controllers/asset.controller";
import { validateDto } from "../middleware/validateDto";
import { AssetSearchDto } from "../dtos/search.dto";

export const assetRouter = Router();

assetRouter.get("/search", validateDto(AssetSearchDto), searchAssets);