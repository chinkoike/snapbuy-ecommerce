import { useAuth0 } from "@auth0/auth0-react";
import type { OrderListProps } from "../../../../shared/types/order";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useOrderStore } from "../../store/useOrderStore";

export const OrderList: React.FC<OrderListProps> = ({
  myOrders,
  isLoading,
  onSelectOrder,
}) => {
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();
  const { cancelOrder, loading } = useOrderStore();

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      const token = await getAccessTokenSilently();
      await cancelOrder(orderToCancel, token);
      setOrderToCancel(null); // ปิด Modal หลังจาก Store อัปเดต State เสร็จ
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="px-8 py-6 border-b border-gray-50">
          <div className="h-4 w-32 bg-gray-200 rounded-full"></div>
        </div>
        <div className="divide-y divide-gray-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded-md"></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-24 bg-gray-100 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative">
      {/* 🛡️ 1. Cancel Confirmation Modal (ย้ายไว้นอก Loop เพื่อความลื่นไหล) */}
      {orderToCancel && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ⚠️
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Cancel Order?
              </h3>
              <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                Are you sure? The items will be returned to stock immediately.
                This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                No
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg transition-all disabled:bg-gray-300"
              >
                {loading ? "..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">
          Recent Orders
        </h3>
      </div>

      <div className="divide-y divide-gray-50">
        {myOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold">
            NO ORDER
          </div>
        ) : (
          myOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="cursor-pointer p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  {order.status === "PAID"
                    ? "✅"
                    : order.status === "CANCELLED"
                      ? "❌"
                      : "📦"}
                </div>
                <div>
                  <p
                    className={`font-black text-lg ${order.status === "CANCELLED" ? "text-gray-400 line-through" : "text-gray-900"}`}
                  >
                    #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                    {new Date(order.createdAt).toLocaleDateString("th-TH")}
                  </p>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                <p
                  className={`font-black text-xl ${order.status === "CANCELLED" ? "text-gray-300" : "text-gray-900"}`}
                >
                  ฿{order.totalPrice.toLocaleString()}
                </p>

                <div className="flex gap-2 items-center">
                  {/* Status Label */}
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-sm ${
                      order.status === "PAID"
                        ? "bg-green-100 text-green-600"
                        : order.status === "CANCELLED"
                          ? "bg-red-50 text-red-400"
                          : order.slipUrl
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {order.status === "PENDING" && order.slipUrl
                      ? "WAITING"
                      : order.status}
                  </span>

                  {/* 2. Logic การแสดงปุ่ม: ถ้า Cancelled หรือ Paid แล้ว จะไม่โชว์ปุ่มใดๆ */}
                  {order.status === "PENDING" && (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!order.slipUrl && (
                        <button
                          onClick={() => setOrderToCancel(order.id)}
                          className="text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-red-100"
                        >
                          Cancel
                        </button>
                      )}

                      <Link
                        to={`/order-success/${order.id}`}
                        className={`text-[10px] px-4 py-1 rounded-lg font-black uppercase tracking-widest transition-all shadow-md ${
                          order.slipUrl
                            ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {order.slipUrl ? "Re-upload" : "Upload Slip"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
