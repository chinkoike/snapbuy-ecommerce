import dotenv from "dotenv";
dotenv.config(); // ต้องมีบรรทัดนี้ไว้บนสุดเสมอ

import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 1. Setup Adapter เหมือนกับในแอปหลัก
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. สร้าง Client โดยใช้ Adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed with PG Adapter...");

  // ใส่ Logic การสร้าง Categories, Products, Users, Orders ที่นี่
  // ตัวอย่าง:
  const cat = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics" },
  });

  console.log("✅ Seed finished successfully!");
}

// --- 1. SEED CATEGORIES ---
const catElectronics = await prisma.category.upsert({
  where: { name: "Electronics" },
  update: {},
  create: { name: "Electronics" },
});

const catFashion = await prisma.category.upsert({
  where: { name: "Fashion" },
  update: {},
  create: { name: "Fashion" },
});

// --- 2. SEED PRODUCTS ---
const prod1 = await prisma.product.create({
  data: {
    name: "Gaming Mouse",
    description: "High precision wireless gaming mouse",
    price: 1500,
    stock: 50,
    categoryId: catElectronics.id,
    imageUrl: "https://placehold.co/400x400?text=Mouse",
  },
});

const prod2 = await prisma.product.create({
  data: {
    name: "Mechanical Keyboard",
    description: "RGB Mechanical keyboard with blue switches",
    price: 2900,
    stock: 20,
    categoryId: catElectronics.id,
    imageUrl: "https://placehold.co/400x400?text=Keyboard",
  },
});

// --- 3. SEED USERS ---
const admin = await prisma.user.upsert({
  where: { email: "admin@snapbuy.com" },
  update: {},
  create: {
    auth0Id: "auth0|admin_123",
    email: "admin@snapbuy.com",
    role: Role.USER,
  },
});

const customer = await prisma.user.upsert({
  where: { email: "customer@test.com" },
  update: {},
  create: {
    auth0Id: "auth0|cust_456",
    email: "customer@test.com",
    role: Role.USER,
  },
});

// --- 4. SEED ORDERS & ITEMS ---
// จำลองออเดอร์ที่จ่ายเงินแล้ว (PAID)
await prisma.order.create({
  data: {
    userId: customer.id,
    totalPrice: 4400, // (1500 * 1) + (2900 * 1)
    status: OrderStatus.PAID,
    paymentIntentId: "pi_mock_111",
    items: {
      create: [
        { productId: prod1.id, quantity: 1, priceAtPurchase: 1500 },
        { productId: prod2.id, quantity: 1, priceAtPurchase: 2900 },
      ],
    },
  },
});

// จำลองออเดอร์ที่ยกเลิก (CANCELLED)
await prisma.order.create({
  data: {
    userId: customer.id,
    totalPrice: 1500,
    status: OrderStatus.CANCELLED,
    items: {
      create: [{ productId: prod1.id, quantity: 1, priceAtPurchase: 1500 }],
    },
  },
});

console.log("✅ Seed finished successfully!");

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // สำคัญ: ต้องปิด pool ของ pg ด้วย ไม่งั้น process จะไม่ยอมจบ
  });
