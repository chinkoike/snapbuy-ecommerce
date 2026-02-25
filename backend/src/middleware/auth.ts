import * as dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";
import type { Request, Response, NextFunction } from "express";

dotenv.config();

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  throw new Error("Missing Auth0 configuration in .env");
}

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: "RS256",
});

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.auth?.payload;
  const auth0Id = payload?.sub;

  if (!auth0Id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const roles = (payload?.["https://snapbuy-api/roles"] as string[]) || [];

  if (!roles.includes("ADMIN")) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};
