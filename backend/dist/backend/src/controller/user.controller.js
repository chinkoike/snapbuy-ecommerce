import { prisma } from "@/lib/prisma.js";
export const getUser = async (req, res) => {
    const payload = req.auth?.payload;
    const NAMESPACE = "https://snapbuy-api/";
    const auth0Id = payload?.sub;
    const email = payload?.[`${NAMESPACE}email`];
    if (!auth0Id) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!email) {
        return res.status(400).json({
            error: "Email is missing from token",
        });
    }
    const ROLE_KEY = `${NAMESPACE}roles`;
    const rolesFromToken = payload?.[ROLE_KEY] || [];
    const isAdminFromToken = rolesFromToken.includes("ADMIN");
    try {
        const user = await prisma.user.upsert({
            where: { auth0Id },
            update: {
                email,
                role: isAdminFromToken ? "ADMIN" : "USER",
            },
            create: {
                auth0Id,
                email,
                role: isAdminFromToken ? "ADMIN" : "USER",
            },
        });
        if (!user.isActive) {
            return res.status(403).json({
                error: "Account has been deactivated",
            });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("Error in getUser:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
//-------------------------------------------------------------------//
export const deleteUser = async (req, res) => {
    const idParam = req.params.id;
    if (!idParam || Array.isArray(idParam)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    const userId = idParam;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        // --- ส่วนที่แก้ไข ---
        // 1. ลบ if (!existingUser.isActive) ออก เพื่อให้กดซ้ำเพื่อ Unblock ได้
        // 2. คำนวณค่าใหม่ (Toggle)
        const nextStatus = !existingUser.isActive;
        await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: nextStatus,
                // ถ้า nextStatus เป็น true (เลิกบล็อก) ให้เคลียร์ค่า deletedAt เป็น null
                // ถ้า nextStatus เป็น false (บล็อก) ให้บันทึกวันที่ปัจจุบัน
                deletedAt: nextStatus ? null : new Date(),
            },
        });
        return res.status(200).json({
            message: `User ${nextStatus ? "enabled" : "deactivated"} successfully`,
            isActive: nextStatus, // ส่งสถานะใหม่กลับไปให้ Frontend ด้วย
        });
        // -------------------
    }
    catch (error) {
        console.error("Toggle User Status Error:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { orders: true },
                },
                orders: {
                    // ✅ เปลี่ยนจาก "COMPLETED" เป็น "PAID" ให้ตรงกับ OrderStatus Type
                    where: { status: "PAID" },
                    select: { totalPrice: true }, // ⚠️ เช็คด้วยว่าใน Schema ชื่อ totalPrice หรือ totalAmount
                },
            },
            orderBy: { createdAt: "desc" },
        });
        const formattedUsers = users.map((u) => ({
            ...u,
            orderCount: u._count.orders,
            // คำนวณยอดเงินรวมจากฟิลด์ totalPrice
            totalSpent: u.orders.reduce((sum, order) => sum + order.totalPrice, 0),
            orders: undefined,
            _count: undefined,
        }));
        return res.json(formattedUsers);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
};
//# sourceMappingURL=user.controller.js.map