import { prisma } from "@/lib/prisma.js";
export const getAdminDashboardStats = async (req, res) => {
    try {
        const [salesStats, totalProducts, activeProducts, outOfStockProducts, totalUsers, recentUsers, categoryCount,] = await prisma.$transaction([
            // 1. คำนวณยอดขายรวมจากฟิลด์ totalPrice ใน Order
            prisma.order.aggregate({
                _sum: {
                    totalPrice: true, // ✨ แก้จาก totalAmount เป็น totalPrice ตาม Schema
                },
                where: {
                    status: "PAID", // 💡 แนะนำ: นับเฉพาะออเดอร์ที่จ่ายเงินแล้ว
                },
            }),
            prisma.product.count(),
            prisma.product.count({ where: { isActive: true } }),
            prisma.product.count({ where: { stock: 0 } }),
            prisma.user.count(),
            // ดึง User ล่าสุดพร้อมบทบาท (Role)
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    role: true, // ✨ ตาม Schema มี Enum Role
                    createdAt: true,
                },
            }),
            prisma.category.count(),
        ]);
        const totalSalesValue = salesStats._sum.totalPrice || 0;
        return res.status(200).json({
            success: true,
            stats: {
                sales: {
                    total: totalSalesValue,
                    label: "Total Revenue",
                    icon: "💰",
                },
                inventory: {
                    total: totalProducts,
                    active: activeProducts,
                    outOfStock: outOfStockProducts,
                    categories: categoryCount,
                    label: "Active Products",
                    icon: "📦",
                },
                users: {
                    total: totalUsers,
                    recent: recentUsers,
                    label: "Total Customers",
                    icon: "👥",
                },
            },
        });
    }
    catch (error) {
        console.error("Admin Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
//# sourceMappingURL=admin.controller.js.map