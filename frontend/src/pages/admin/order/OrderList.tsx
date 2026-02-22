import { useEffect, useState } from "react";
import { useOrderStore } from "../../../store/useOrderStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { OrderData, OrderStatus } from "@/shared/types/order";

export const OrderList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { orders, fetchOrders, updateOrderStatus, loading } = useOrderStore();

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
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <tr>
              <th className="p-8">Order ID</th>
              <th className="p-8">Customer</th>
              <th className="p-8 text-center">Items</th>
              <th className="p-8">Total Amount</th>
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
                      <span className="text-sm font-bold text-gray-700 truncate The class `max-w-[120px]` can be written as `max-w-30`">
                        {order.user?.email}
                      </span>
                    </div>
                  </td>

                  <td className="p-8 text-center font-bold text-gray-500 text-sm">
                    {order.items?.length || 0}
                  </td>

                  <td className="p-8">
                    <span className="text-lg font-black text-gray-900">
                      ฿{order.totalPrice.toLocaleString()}
                    </span>
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
