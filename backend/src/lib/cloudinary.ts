import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Setup Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: any, file: any) => {
    // ใส่ : any ให้ทั้งคู่
    // ดึงชื่อไฟล์เดิมมาทำความสะอาด (เอาช่องว่างออก)
    const originalName = file.originalname.split(".")[0].replace(/\s+/g, "-");
    const uniqueSuffix = Date.now();

    return {
      folder: "snapbuy_slips",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: `slip-${uniqueSuffix}-${originalName}`,
    } as any;
  },
});

// สร้าง Middleware สำหรับ Multer
export const uploadCloud = multer({ storage });

export default cloudinary;
