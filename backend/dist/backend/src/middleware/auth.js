import * as dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";
import { prisma } from "@/lib/prisma.js";
dotenv.config();
// ตรวจสอบ .env
if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
    throw new Error("Missing Auth0 configuration in .env");
}
// Middleware ตรวจ JWT (เวอร์ชันใหม่)
export const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: "RS256",
});
// Middleware ตรวจสอบและซิงค์สิทธิ์ Admin
export const requireAdmin = async (req, res, next) => {
    const payload = req.auth?.payload;
    const auth0Id = payload?.sub;
    if (!auth0Id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const roles = payload?.["https://snapbuy-api/roles"] || [];
    if (!roles.includes("ADMIN")) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
};
//# sourceMappingURL=auth.js.map