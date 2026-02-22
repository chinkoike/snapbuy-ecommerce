# 🚀 Fullstack E-Commerce Project (SnapBuy)

โปรเจกต์ระบบซื้อขายสินค้าแบบ Fullstack ที่พัฒนาด้วยเทคโนโลยีสมัยใหม่ (Modern Stack) ทั้งระบบจัดการผู้ใช้, ตะกร้าสินค้า และการชำระเงิน

---

## ✨ Key Features

- **Authentication**: ระบบล็อกอินและจัดการโปรไฟล์ผู้ใช้ผ่าน Auth0
- **Product Management**: แสดงรายการสินค้า แยกหมวดหมู่ และระบบค้นหา
- **Shopping Cart**: ระบบเพิ่ม/ลดสินค้าในตะกร้า และคำนวณราคาสุทธิแบบ Real-time (Zustand)
- **Order System**: ระบบบันทึกคำสั่งซื้อ และการจัดการสถานะ Order
- **Payment & Evidence**: ระบบแสดงยอดชำระและอัปโหลดสลิปหลักฐานการโอนเงิน
- **Image Hosting**: จัดการรูปภาพสินค้าและสลิปผ่าน Cloudinary API

---

## 🏗️ Project Architecture

โปรเจกต์นี้แบ่งออกเป็น 2 ส่วนหลัก:

- **Frontend**: พัฒนาด้วย React 19 และ Vite 7 (Deploy via Vercel)
- **Backend**: พัฒนาด้วย Node.js, Express และ Prisma ORM เชื่อมต่อกับ PostgreSQL (Deploy via Render)

---

## 🛠️ Tech Stack

### Frontend

- **Core:** React 19, TypeScript
- **Styling:** Tailwind CSS v4 (Integrated with Vite)
- **State Management:** Zustand
- **Authentication:** Auth0 React SDK
- **Routing:** React Router DOM v7

### Backend

- **Core:** Node.js, Express 5
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** Cloudinary (via Multer)
- **Authentication:** Auth0 JWT Bearer

---

## 📦 Deployment Guide

### 🌐 Frontend (Vercel)

1. **Connect Repository:** เชื่อมต่อ GitHub กับ Vercel
2. **Framework Preset:** เลือก `Vite`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:** เพิ่มค่าที่ขึ้นต้นด้วย `VITE_` ทั้งหมดลงไป

### ⚙️ Backend (Render)

1. **Service Type:** Web Service (Runtime: Node)
2. **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
3. **Start Command:** `npm run start`
4. **Environment Variables:** เพิ่มค่าจาก `.env` (DATABASE*URL, CLOUDINARY*\*, ฯลฯ) ลงในเมนู Environment

---

## 📜 Available Scripts

- `npm run dev`: เริ่มต้นโหมดพัฒนา
- `npm run build`: คอมไพล์โปรเจกต์สำหรับ Production
- `npm run start`: รันแอปพลิเคชัน (สำหรับ Backend)
