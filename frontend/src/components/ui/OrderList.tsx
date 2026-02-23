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
  const sortedOrders = [...myOrders].sort((a, b) => {
    const priority: Record<string, number> = {
      PENDING: 1,
      WAITING: 2,
      PAID: 3,
      CANCELLED: 4,
    };

    const priorityA =
      a.status === "PENDING" && a.slipUrl ? 2 : priority[a.status];
    const priorityB =
      b.status === "PENDING" && b.slipUrl ? 2 : priority[b.status];

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
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
    <div className="bg-white border border-black overflow-hidden relative rounded-sm">
      {/* 🛡️ 1. Cancel Confirmation Modal - ปรับให้ Minimal ดุดันขึ้น */}
      {orderToCancel && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white border border-black p-10 max-w-sm w-full shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
                Cancel Order?
              </h3>
              <p className="text-gray-500 text-xs font-medium mb-10 tracking-widest uppercase leading-relaxed">
                Items will be returned to stock. <br />
                This action is permanent.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 px-6 py-4 border border-black font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                No
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:bg-gray-300"
              >
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="px-8 py-6 border-b border-black flex justify-between items-center bg-zinc-50">
        <h3 className="font-black text-black uppercase tracking-[0.3em] text-xs">
          Recent Orders
        </h3>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {myOrders.length} Transactions
        </span>
      </div>

      <div className="divide-y divide-zinc-100">
        {myOrders.length === 0 ? (
          <div className="p-20 text-center text-zinc-300 font-black uppercase tracking-[0.2em] text-sm">
            No Order History
          </div>
        ) : (
          sortedOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="group cursor-pointer p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-zinc-50 transition-all"
            >
              {/* Left: ID & Date */}
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                  {order.status === "PAID"
                    ? "✓"
                    : order.status === "CANCELLED"
                      ? "✕"
                      : "⬚"}
                </div>
                <div>
                  <p
                    className={`font-black text-xl tracking-tighter ${
                      order.status === "CANCELLED"
                        ? "text-zinc-300 line-through"
                        : "text-black"
                    }`}
                  >
                    #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>

              {/* Right: Price & Actions */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                <p
                  className={`font-black text-2xl tracking-tighter ${
                    order.status === "CANCELLED"
                      ? "text-zinc-200"
                      : "text-black"
                  }`}
                >
                  ฿{order.totalPrice.toLocaleString()}
                </p>

                <div className="flex gap-3 items-center">
                  {/* Status Badge - ปรับให้เป็นเส้นขีดๆ เรียบๆ */}
                  <span
                    className={`text-[9px] px-3 py-1 font-black tracking-[0.15em] uppercase border ${
                      order.status === "PAID"
                        ? "border-green-500 text-green-600"
                        : order.status === "CANCELLED"
                          ? "border-zinc-200 text-zinc-300"
                          : "border-black text-black"
                    }`}
                  >
                    {order.status === "PENDING" && order.slipUrl
                      ? "Processing"
                      : order.status}
                  </span>

                  {/* Buttons */}
                  {order.status === "PENDING" && (
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!order.slipUrl && (
                        <button
                          onClick={() => setOrderToCancel(order.id)}
                          className="text-[9px] px-3 py-1 font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          [ Cancel ]
                        </button>
                      )}

                      <Link
                        to={`/order-success/${order.id}`}
                        className={`text-[9px] px-4 py-1 font-black uppercase tracking-widest transition-all border ${
                          order.slipUrl
                            ? "border-zinc-200 text-zinc-400 hover:bg-zinc-100"
                            : "bg-black text-white hover:bg-zinc-800"
                        }`}
                      >
                        {order.slipUrl ? "Edit Slip" : "Upload Slip"}
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
