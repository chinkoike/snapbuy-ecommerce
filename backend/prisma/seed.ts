import dotenv from "dotenv";
import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env file");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed process...");

  // --- 1. SEED CATEGORIES ---
  console.log("Creating categories...");
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
  console.log("Creating products...");
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
  console.log("Creating users...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@snapbuy.com" },
    update: {},
    create: {
      auth0Id: "auth0|admin_123",
      email: "admin@snapbuy.com",
      role: Role.ADMIN, // เปลี่ยนเป็น ADMIN ให้ถูกต้อง
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
  console.log("Creating orders...");
  // ออเดอร์ที่จ่ายเงินแล้ว (PAID)
  await prisma.order.create({
    data: {
      userId: customer.id,
      totalPrice: 4400,
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

  // ออเดอร์ที่ยกเลิก (CANCELLED)
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
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // สำคัญมาก: ปิด connection pool
  });
