import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// หมายเหตุ: การเช็ก dbUrl ด้วย process.env ตรงนี้ต้องมี @types/node ก่อนถึงจะไม่แดง

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // ใช้ helper env() ของ prisma/config ซึ่งจะอ่านค่าจาก .env ที่โหลดมาแล้ว
    url: env("DATABASE_URL"),
  },
});
