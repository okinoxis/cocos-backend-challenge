import * as express from "express";
import * as swaggerUi from "swagger-ui-express";
import * as YAML from "yamljs";
import { AppDataSource } from "./data-source";
import { portfolioRouter } from "./routes/portfolio.routes";
import { assetRouter } from "./routes/asset.routes";
import { orderRouter } from "./routes/order.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = parseInt(process.env.PORT) || 3000;

app.use(express.json());

app.use("/portfolio", portfolioRouter);
app.use("/assets", assetRouter);
app.use("/orders", orderRouter);
app.use(notFoundHandler);
app.use(errorHandler);

AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized!");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error),
  );
