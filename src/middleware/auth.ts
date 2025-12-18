import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Middleware to authenticate requests using API key from Authorization header
 * Expects: Authorization: Bearer <api-key> or Authorization: <api-key>
 * In real applications, consider more secure methods like OAuth or JWTs.
 */
export const authenticateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY environment variable is not set");
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Server configuration error" });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Authorization header is required" });
  }

  // Support both "Bearer <key>" and direct key formats
  const providedKey = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  if (providedKey !== apiKey) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Invalid API key" });
  }

  next();
};
