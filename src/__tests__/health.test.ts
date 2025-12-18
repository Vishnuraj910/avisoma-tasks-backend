import request from "supertest";
import app from "../app";
import { pool } from "../utils/db";
import { StatusCodes } from "http-status-codes";

jest.mock("../utils/db", () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe("Health Check Endpoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return healthy status when database is connected", async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{ "?column?": 1 }] });

    const response = await request(app).get("/health");

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("uptime");
    expect(typeof response.body.uptime).toBe("number");
  });

  it("should return unhealthy status when database connection fails", async () => {
    (pool.query as jest.Mock).mockRejectedValue(
      new Error("Database connection failed")
    );

    const response = await request(app).get("/health");

    expect(response.status).toBe(StatusCodes.SERVICE_UNAVAILABLE);
    expect(response.body).toHaveProperty("status", "unhealthy");
    expect(response.body).toHaveProperty("error", "Database connection failed");
    expect(response.body).toHaveProperty("timestamp");
  });
});
