import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Upload, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrderStore } from "../store/useOrderStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { OrderData } from "@/shared/types/order";

const OrderSuccessPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const { orders, uploadSlip, loading } = useOrderStore();

  const handleUploadSlip = async () => {
    if (!file || !id) return alert("กรุณาเลือกรูปภาพสลิปก่อนครับ");

    try {
      // 2. ดึง Token ล่าสุดแบบเงียบๆ (Auth0 จะจัดการ Refresh ให้เองถ้าหมดอายุ)
      const token = await getAccessTokenSilently();

      // 3. ส่ง Token เข้าไปใน Store ตามที่คุณเขียนไว้
      const success = await uploadSlip(id, file, token);

      if (success) {
        alert("ส่งหลักฐานเรียบร้อย!");
        navigate("/profile");
      } else {
        alert("อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (error) {
      console.error("Auth0 Token Error:", error);
      alert("กรุณา Login ใหม่เพื่อยืนยันตัวตน");
    }
  };
  useEffect(() => {
    const fetchOrderData = async () => {
      // สมมติว่าคุณมีฟังก์ชันดึงออเดอร์รายตัวใน store หรือ service
      // const data = await getOrderById(id);
      // setOrder(data);

      // หรือดึงจาก store.orders ที่มีอยู่แล้ว
      const foundOrder = orders.find((o) => o.id === id);
      if (foundOrder) setOrder(foundOrder);
    };
    fetchOrderData();
  }, [id, orders]);
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center py-20 px-6">
      <CheckCircle size={60} className="mb-6 text-green-500 animate-pulse" />

      <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
        Order Success!
      </h1>
      <p className="text-zinc-500 text-[10px] tracking-[0.3em] mb-12">
        ORDER ID: {id}
      </p>

      <div className="w-full max-w-md grid grid-cols-1 gap-8">
        {/* ส่วนที่ 1: ข้อมูลการโอนเงิน + ยอดเงิน (เพิ่มใหม่!) */}
        <div className="border-2 border-black p-8 relative">
          <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold uppercase tracking-widest">
            Payment Details
          </span>

          <div className="text-center mb-6">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
              Total Amount to Pay
            </p>
            {/* ✅ แสดงยอดเงินตรงนี้ */}
            <h2 className="text-4xl font-black text-indigo-600">
              ฿{order?.totalPrice?.toLocaleString() ?? "..."}
            </h2>
          </div>

          <div className="text-center pt-6 border-t border-dashed border-zinc-200">
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
              PromptPay / Bank Transfer
            </p>
            <h2 className="text-2xl font-mono font-bold mb-1">081-XXX-XXXX</h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
              SnapBuy Co., Ltd.
            </p>
          </div>
        </div>

        {/* ส่วนที่ 2: ฟอร์มอัปโหลดสลิป */}
        <div className="bg-zinc-50 p-8 border border-dashed border-zinc-300">
          <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <Upload size={14} /> Upload Payment Slip
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-[10px] text-zinc-500
              file:mr-4 file:py-2 file:px-4
              file:border-0 file:text-[10px] file:font-black
              file:bg-black file:text-white
              hover:file:bg-zinc-800 cursor-pointer"
          />

          {file && (
            <p className="mt-2 text-[10px] text-green-600 font-bold uppercase">
              Selected: {file.name}
            </p>
          )}

          <button
            onClick={handleUploadSlip}
            disabled={loading}
            className={`mt-6 w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all
              ${loading ? "bg-zinc-400 cursor-not-allowed" : "bg-black text-white hover:invert"}`}
          >
            {loading ? "Sending..." : "Confirm Payment"}
          </button>
        </div>

        {/* ปุ่มกลับหน้าหลัก */}
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:underline"
        >
          <ArrowLeft size={14} /> Back to Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
