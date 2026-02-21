import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
// ไม่ต้องใส่ interceptor ดึง localStorage ที่นี่
