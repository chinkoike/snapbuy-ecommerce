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
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse font-black tracking-widest uppercase opacity-20">
          Syncing Data...
        </div>
      </div>
    );

  return (
    <div className="p-8 max-w-400 mx-auto animate-in fade-in duration-500">
      {/* --- Header & Filter --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase italic">
            Order_Management
          </h2>
          <p className="text-[10px] font-black text-zinc-400 tracking-[0.4em]">
            SYSTEM_ADMIN_ACCESS
          </p>
        </div>

        {/* Filter: เปลี่ยนเป็นทรงเหลี่ยม Minimal */}
        <div className="flex border border-black p-1 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {["ALL", "PENDING", "PAID", "SHIPPED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2 text-[10px] font-black tracking-widest transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-black text-white"
                  : "text-zinc-400 hover:text-black hover:bg-zinc-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* --- Table Section --- */}
      <div className="bg-white border border-black overflow-x-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6">Index / ID</th>
              <th className="p-6">Client_Account</th>
              <th className="p-6 text-center">Value_THB</th>
              <th className="p-6 text-center">Slip</th>
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-right">Process</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 uppercase text-[11px] font-bold">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-20 text-center text-zinc-300 italic tracking-widest"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-zinc-50/80 transition-colors group"
                >
                  <td className="p-6">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex flex-col text-left hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      <span className="font-black text-black tracking-tight">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[9px] text-zinc-400 mt-1 tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </button>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 border border-black flex items-center justify-center text-[10px] font-black bg-zinc-50">
                        {order.user?.email?.[0].toUpperCase()}
                      </div>
                      <span className="text-black truncate max-w-37.5">
                        {order.user?.email}
                      </span>
                    </div>
                  </td>

                  <td className="p-6 text-center font-black text-sm tracking-tighter">
                    ฿{order.totalPrice.toLocaleString()}
                  </td>

                  {/* Slip Section */}
                  <td className="p-6 text-center">
                    {order.slipUrl ? (
                      <button
                        onClick={() =>
                          setSelectedSlipUrl(order.slipUrl || null)
                        }
                        className="inline-flex items-center justify-center px-4 py-2 border border-black text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ctive:translate-x-px active:translate-y-px"
                      >
                        View_Slip
                      </button>
                    ) : (
                      <span className="text-[9px] text-zinc-300 italic tracking-widest">
                        N/A
                      </span>
                    )}
                  </td>

                  <td className="p-6 text-center">
                    <span
                      className={`px-3 py-1 border text-[9px] font-black tracking-widest ${
                        order.status === "PAID"
                          ? "border-green-500 text-green-600 bg-green-50"
                          : order.status === "SHIPPED"
                            ? "border-blue-500 text-blue-600 bg-blue-50"
                            : order.status === "PENDING"
                              ? "border-orange-400 text-orange-500 bg-orange-50"
                              : "border-red-500 text-red-600 bg-red-50"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-6 text-right">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="bg-zinc-50 border border-zinc-200 text-[10px] font-black uppercase tracking-widest px-3 py-2 outline-none focus:border-black transition-all cursor-pointer appearance-none text-center rounded-none"
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

      {/* --- Slip Preview Modal (Modern Style) --- */}
      {selectedSlipUrl && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedSlipUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white border border-black animate-in zoom-in-95 duration-200 shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black">
                Payment_Evidence
              </h3>
              <button
                onClick={() => setSelectedSlipUrl(null)}
                className="hover:rotate-90 transition-transform cursor-pointer font-light text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-zinc-100 flex justify-center items-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedSlipUrl}
                alt="Slip"
                className="max-w-full h-auto border border-black"
              />
            </div>
            <button
              onClick={() => setSelectedSlipUrl(null)}
              className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Return_To_Dashboard
            </button>
          </div>
        </div>
      )}

      {/* --- Order Detail Modal (Modern Style) --- */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white border border-black w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-black flex justify-between items-end bg-zinc-50">
              <div>
                <h3 className="text-3xl font-black text-black tracking-tighter uppercase italic">
                  Order_Details
                </h3>
                <p className="text-[10px] font-black text-zinc-400 tracking-widest mt-1">
                  ID: {selectedOrder.id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-2xl hover:rotate-90 transition-transform cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto bg-white">
              <div className="space-y-4">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-6 p-4 border border-zinc-100 hover:border-black transition-colors group"
                  >
                    <div className="w-20 h-20 bg-zinc-100 border border-zinc-200 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      <img
                        src={item.product?.imageUrl ?? ""}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 uppercase">
                      <h4 className="font-black text-black text-sm tracking-tight">
                        {item.product?.name}
                      </h4>
                      <p className="text-[9px] text-zinc-400 font-bold mt-1 tracking-widest">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-black text-sm">
                        ฿
                        {(
                          item.priceAtPurchase * item.quantity
                        ).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-zinc-400 tracking-widest uppercase italic">
                        ฿{item.priceAtPurchase.toLocaleString()} / UNIT
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-black flex justify-between items-center text-white">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-1">
                  Final_Amount
                </p>
                <p className="text-4xl font-black tracking-tighter italic">
                  ฿{selectedOrder.totalPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-10 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]"
              >
                Confirm_&_Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
