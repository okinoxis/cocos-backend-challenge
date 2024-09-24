import * as request from "supertest";
import { AppDataSource } from "./data-source";
import * as express from "express";
import { portfolioRouter } from "./routes/portfolio.routes";
import { assetRouter } from "./routes/asset.routes";
import { orderRouter } from "./routes/order.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

let app: express.Application;

beforeAll(async () => {
  await AppDataSource.initialize();
  app = express();
  app.use(express.json());
  app.use("/portfolio", portfolioRouter);
  app.use("/assets", assetRouter);
  app.use("/orders", orderRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe("API Endpoints", () => {
  describe("GET /portfolio/:userId", () => {
    it("should return portfolio data for a valid user", async () => {
      const res = await request(app).get("/portfolio/1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalAccountValue");
      expect(res.body).toHaveProperty("availableCash");
      expect(res.body).toHaveProperty("positions");
      expect(Array.isArray(res.body.positions)).toBe(true);
      if (res.body.positions.length > 0) {
        expect(res.body.positions[0]).toHaveProperty("ticker");
      }
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request(app).get("/portfolio/999");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /assets/search", () => {
    it("should return assets matching search criteria by ticker", async () => {
      const res = await request(app).get("/assets/search?ticker=YPFD");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("assets");
      expect(Array.isArray(res.body.assets)).toBe(true);
      expect(res.body.assets.length).toBeGreaterThan(0);
      expect(res.body.assets[0].ticker).toBe("YPFD");
    });

    it("should return assets matching search criteria by name", async () => {
      const res = await request(app).get("/assets/search?name=Y.P.F.");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("assets");
      expect(Array.isArray(res.body.assets)).toBe(true);
      expect(res.body.assets.length).toBeGreaterThan(0);
      expect(res.body.assets[0].name).toContain("Y.P.F.");
    });

    it("should return empty array for non-matching search", async () => {
      const res = await request(app).get("/assets/search?ticker=NONEXISTENT");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("assets");
      expect(Array.isArray(res.body.assets)).toBe(true);
      expect(res.body.assets.length).toBe(0);
    });
  });

  describe("POST /orders/submit", () => {
    it("should submit a valid market buy order", async () => {
      const orderData = {
        userId: 1,
        instrumentId: 47,
        side: "BUY",
        type: "MARKET",
        quantity: 1,
      };
      const res = await request(app).post("/orders/submit").send(orderData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.status).toBe("FILLED");
      expect(res.body.side).toBe("BUY");
      expect(res.body.type).toBe("MARKET");
      expect(res.body.quantity).toBe(1);
    });

    it("should submit a valid limit sell order", async () => {
      const orderData = {
        userId: 1,
        instrumentId: 47,
        side: "SELL",
        type: "LIMIT",
        quantity: 1,
        price: "1000",
      };
      const res = await request(app).post("/orders/submit").send(orderData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.status).toBe("NEW");
      expect(res.body.side).toBe("SELL");
      expect(res.body.type).toBe("LIMIT");
      expect(res.body.quantity).toBe(1);
      expect(res.body.price).toBe("1000");
    });

    it("should be REJECTED if not enough cash available", async () => {
      const orderData = {
        userId: 1,
        instrumentId: 47,
        side: "BUY",
        type: "LIMIT",
        quantity: 1,
        price: "999999",
      };
      const res = await request(app).post("/orders/submit").send(orderData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.status).toBe("REJECTED");
      expect(res.body.side).toBe("BUY");
      expect(res.body.type).toBe("LIMIT");
      expect(res.body.quantity).toBe(1);
      expect(res.body.price).toBe("999999");
    });

    it("should be REJECTED if not enough shares to sell", async () => {
      const orderData = {
        userId: 1,
        instrumentId: 47,
        side: "SELL",
        type: "LIMIT",
        quantity: 9999,
        price: "1000",
      };
      const res = await request(app).post("/orders/submit").send(orderData);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.status).toBe("REJECTED");
      expect(res.body.side).toBe("SELL");
      expect(res.body.type).toBe("LIMIT");
      expect(res.body.quantity).toBe(9999);
      expect(res.body.price).toBe("1000");
    });

    it("should return 400 for invalid order data", async () => {
      const invalidOrderData = {
        userId: 1,
        instrumentId: 47,
        side: "INVALID",
        type: "MARKET",
        quantity: 10,
      };
      const res = await request(app)
        .post("/orders/submit")
        .send(invalidOrderData);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /orders/cancel", () => {
    it("should cancel a NEW order", async () => {
      // First, submit a limit order
      const orderData = {
        userId: 1,
        instrumentId: 47,
        side: "SELL",
        type: "LIMIT",
        quantity: 1,
        price: "1100",
      };
      const submitRes = await request(app)
        .post("/orders/submit")
        .send(orderData);
      expect(submitRes.status).toBe(200);
      expect(submitRes.body.status).toBe("NEW");

      // Then, cancel the order
      const cancelData = {
        orderId: submitRes.body.id,
      };
      const cancelRes = await request(app)
        .post("/orders/cancel")
        .send(cancelData);
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.status).toBe("CANCELLED");
    });

    it("should return 500 when trying to cancel a FILLED order", async () => {
      // First, create a market order which will be filled immediately
      const orderData = {
        userId: 1,
        instrumentId: 47,
        side: "BUY",
        type: "MARKET",
        quantity: 1,
      };
      const submitRes = await request(app)
        .post("/orders/submit")
        .send(orderData);
      expect(submitRes.status).toBe(200);
      expect(submitRes.body.status).toBe("FILLED");

      // Now, attempt to cancel the filled order
      const cancelData = {
        orderId: submitRes.body.id,
      };
      const cancelRes = await request(app)
        .post("/orders/cancel")
        .send(cancelData);
      expect(cancelRes.status).toBe(500);
      expect(cancelRes.body.message).toContain(
        "Cannot cancel order with status FILLED",
      );
    });
  });
});
