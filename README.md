# 🚀 SnapBuy – Fullstack E-Commerce Web Application

**SnapBuy** is a production-grade Fullstack E-Commerce platform designed to simulate real-world retail workflows. This project focuses on **System Architecture, Data Integrity, and Secure Transactions**, providing a seamless experience for both customers and administrators.

Built with the latest tech stack (React 19, Tailwind v4, Prisma), SnapBuy demonstrates a modern approach to building scalable web applications.

---

## 🔗 Deployment Links

- **Frontend (UI):** [https://snapbuy-ecommerce.vercel.app/]
- **Backend (API):** [https://snapbuy-ecommerce-nqk9.onrender.com]

### 👤 Demo Credentials

| Role      | Email             | Password     |
| --------- | ----------------- | ------------ |
| **User**  | `user@email.com`  | `User123456` |
| **Admin** | `admin@email.com` | `Admin123`   |

---

## ✨ Key Features

### 🔐 Authentication & Security

- **Auth0 Implementation:** Secure identity management with SSO capabilities.
- **RBAC (Role-Based Access Control):** Dedicated views and API protection for `USER` and `ADMIN` roles.
- **JWT Protection:** All sensitive backend routes are protected via Bearer Token validation.

### 🛍 Product Management

- **Dynamic Catalog:** High-performance product listing with server-side filtering and search.
- **Admin Dashboard:** Full CRUD (Create, Read, Update, Delete) suite for inventory management.
- **Image Optimization:** Automated image processing and hosting via **Cloudinary**.

### 🛒 Shopping & Orders

- **Real-time Cart:** Managed with **Zustand** for high performance and local persistence.
- **Order Lifecycle:** Complete flow from `PENDING` ⮕ `PAID` ⮕ `COMPLETED`.
- **Payment Evidence:** Manual slip upload system for transaction verification.

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React 19 (Functional Components & Hooks)
- **Language:** TypeScript (Type-safe development)
- **Styling:** Tailwind CSS v4 (Modern Utility-first CSS)
- **State Management:** Zustand (Lightweight & Scalable)
- **Routing:** React Router DOM v7

### Backend

- **Runtime:** Node.js (Express 5)
- **ORM:** Prisma (Type-safe Database client)
- **Database:** PostgreSQL (Hosted on Supabase)
- **Storage:** Cloudinary API (Media Management)
- **Auth:** Auth0 SDK & Express-jwt

---

## 🔄 System Architecture & Flow

1. **Identity:** Users authenticate via Auth0 ⮕ Backend syncs/verifies User profile.
2. **Shopping:** User adds items to Cart (State persisted in LocalStorage via Zustand).
3. **Checkout:** User submits Order ⮕ Status set to `PENDING`.
4. **Payment:** User uploads Transfer Slip ⮕ Image stored on Cloudinary ⮕ Status set to `PAID`.
5. **Fulfillment:** Admin reviews evidence ⮕ Approves Order ⮕ Status set to `COMPLETED`.

---

## 🧠 Technical Challenges & Solutions

### 1. Persistent Cart State

**Challenge:** Keeping the shopping cart data intact after page refreshes without excessive database calls.
**Solution:** Implemented **Zustand with Middleware Persist**, allowing the cart state to sync with `localStorage` efficiently.

### 2. Secure Image Uploads

**Challenge:** Handling product images and payment slips securely and performantly.
**Solution:** Integrated **Multer** with **Cloudinary Storage Engine**, ensuring images are optimized and served via CDN before being saved as URLs in PostgreSQL.

### 3. Data Integrity with Prisma

**Challenge:** Managing complex relations between Users, Orders, and OrderItems.
**Solution:** Leveraged **Prisma Transactions** to ensure that an Order and its multiple Items are created atomically—either both succeed or both fail.

---

## 🖼 Screenshots

<div align="center">
  <h3>📱 User Experience</h3>
  <img src="./screenshots/shop.png" width="400" alt="Shop">
  <img src="./screenshots/cartpage.png" width="400" alt="Cart">
  <img src="./screenshots/checkout.png" width="400" alt="Checkout">
  <img src="./screenshots/slip.png" width="400" alt="Payment">
  
  <h3>⚙️ Admin Management</h3>
  <img src="./screenshots/admin-product.png" width="400" alt="Admin Products">
  <img src="./screenshots/admin-order.png" width="400" alt="Admin Orders">
</div>

---

## 👨‍💻 Author

**[chindanai]**
_Computer Science Graduate_

> Currently seeking a **Full-stack / Backend Developer** position. I am passionate about building clean, maintainable, and efficient web solutions.

---
