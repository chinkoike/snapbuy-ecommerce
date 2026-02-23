import { useEffect, useState } from "react";
import { useOrderStore } from "../../../store/useOrderStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { OrderData, OrderStatus } from "../../../../../shared/types/order";

export const OrderList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { orders, fetchOrders, updateOrderStatus, loading } = useOrderStore();
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = await getAccessTokenSilently();
        await fetchOrders(token);
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };
    loadOrders();
  }, [fetchOrders, getAccessTokenSilently]);
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = await getAccessTokenSilently();
      // Cast string จาก select เป็น OrderStatus type
      await updateOrderStatus(orderId, newStatus as OrderStatus, token);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const filteredOrders =
    filterStatus === "ALL"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  if (loading && orders.length === 0)
    return (
      <div className="p-20 text-center text-gray-400 animate-pulse font-bold">
        กำลังดึงข้อมูลออเดอร์...
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 ">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Order Management
          </h2>
          <p className="text-gray-500 text-sm">
            ตรวจสอบและจัดการสถานะการจัดส่งสินค้า
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {["ALL", "PENDING", "PAID", "SHIPPED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                filterStatus === status
                  ? "bg-white shadow-sm text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-x-scroll md:overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <tr>
              <th className="p-8">Order ID</th>
              <th className="p-8">Customer</th>
              <th className="p-8">Total Amount</th>
              {/* ✅ เพิ่มหัวข้อ Slip */}
              <th className="p-8 text-center">Slip</th>
              <th className="p-8">Status</th>
              <th className="p-8 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-20 text-center text-gray-300 font-medium"
                >
                  ไม่พบรายการคำสั่งซื้อ
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="p-8">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex flex-col text-left hover:opacity-70 transition-opacity"
                    >
                      <span className="font-mono text-xs font-black text-indigo-600">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                        {new Date(order.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </button>
                  </td>

                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-linear-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-500">
                        {order.user?.email?.[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-gray-700 truncate max-w-30">
                        {order.user?.email}
                      </span>
                    </div>
                  </td>

                  <td className="p-8">
                    <span className="text-lg font-black text-gray-900">
                      ฿{order.totalPrice.toLocaleString()}
                    </span>
                  </td>

                  {/* ✅ ส่วนแสดงหลักฐานการโอนเงิน (Slip) ในตาราง */}
                  <td className="p-8 text-center">
                    {order.slipUrl ? (
                      <button
                        onClick={() =>
                          setSelectedSlipUrl(order.slipUrl || null)
                        } // 👈 กดแล้วเก็บ URL ลง State
                        className="inline-flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                        title="คลิกเพื่อดูสลิป"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        No Slip
                      </span>
                    )}
                  </td>

                  <td className="p-8">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                        order.status === "PAID"
                          ? "bg-green-100 text-green-600"
                          : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-600"
                            : order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-8 text-right">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="bg-gray-50 border-none text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* ✅ Slip Preview Modal */}
      {selectedSlipUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSlipUrl(null)} // กดพื้นที่ว่างเพื่อปิด
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2rem overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // กันไม่ให้ปิดเมื่อกดที่ตัวรูป
          >
            {/* Header ของ Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">
                Payment Evidence
              </h3>
              <button
                onClick={() => setSelectedSlipUrl(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* ตัวรูปสลิป */}
            <div className="p-4 bg-gray-50 flex justify-center items-center min-h-400px max-h-[70vh] overflow-y-auto">
              <img
                src={selectedSlipUrl}
                alt="Payment Slip"
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
              />
            </div>

            {/* Footer (ปุ่มปิด) */}
            <div className="p-6 bg-white flex justify-end">
              <button
                onClick={() => setSelectedSlipUrl(null)}
                className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:invert transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Order Detail Modal --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-10 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Order Details
                </h3>
                <p className="text-indigo-600 font-mono text-sm font-bold">
                  #{selectedOrder.id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-black transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-10 overflow-y-auto">
              <div className="space-y-6">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-6 p-4 rounded-3xl border border-gray-50 hover:border-indigo-100 transition-colors"
                  >
                    <img
                      src={item.product?.imageUrl ?? ""}
                      alt={item.product?.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-gray-50"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {item.product?.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">
                        ฿
                        {(
                          item.priceAtPurchase * item.quantity
                        ).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        ฿{item.priceAtPurchase.toLocaleString()} / unit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-gray-50/50 border-t flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                  Total Payment
                </p>
                <p className="text-3xl font-black text-gray-900">
                  ฿{selectedOrder.totalPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
