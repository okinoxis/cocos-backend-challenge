import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Order } from "./entity/Order";
import { Instrument } from "./entity/Instrument";
import { MarketData } from "./entity/MarketData";

import * as dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, NODE_ENV } =
  process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: false,
  logging: NODE_ENV === "development",
  entities: [User, Order, Instrument, MarketData],
  migrations: [__dirname + "/migration/*.ts"],
  subscribers: [],
});
