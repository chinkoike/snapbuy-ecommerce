import { useAuth0 } from "@auth0/auth0-react";
import { useUserStore } from "../store/ีuseUserStore"; // ตรวจสอบชื่อไฟล์ store อีกทีนะครับ
import { useOrderStore } from "../store/useOrderStore";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { OrderData } from "@/shared/types/order";

const ProfilePage = () => {
  const { logout, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const userFromDb = useUserStore((state) => state.user);
  const { orders, fetchOrders } = useOrderStore();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  // ดึงข้อมูลออเดอร์เมื่อหน้าโหลด
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        await fetchOrders(token);
      }
    };
    loadData();
  }, [isAuthenticated, getAccessTokenSilently, fetchOrders]);

  // คำนวณสถิติจากข้อมูลจริง
  const myOrders = orders.filter((o) => o.user?.email === userFromDb?.email);
  const pendingOrders = myOrders.filter((o) => o.status === "PENDING").length;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen font-bold text-gray-400 animate-pulse">
        กำลังโหลด...
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            เข้าถึงได้เฉพาะสมาชิก
          </h2>
          <p className="text-gray-500 mb-8">
            กรุณาเข้าสู่ระบบเพื่อดูข้อมูลส่วนตัวของคุณ
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              โปรไฟล์ของฉัน
            </h1>
            <p className="text-gray-500 font-medium">
              จัดการข้อมูลและติดตามสถานะสินค้าของคุณ
            </p>
          </div>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            className="self-start text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 px-6 py-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
          >
            ออกจากระบบ
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {userFromDb?.role || "Customer"}
                </span>
              </div>
              <div className="w-20 h-20 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-3xl mb-6 flex items-center justify-center text-3xl shadow-lg shadow-indigo-200">
                👤
              </div>
              <h3 className="text-xl font-black text-gray-900 truncate">
                {userFromDb?.email?.split("@")[0]}
              </h3>
              <p className="text-sm text-gray-400 font-medium mb-6 truncate">
                {userFromDb?.email}
              </p>

              <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Member Since
                  </span>
                  <span className="text-sm font-bold text-gray-700">2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2rem border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {myOrders.length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2rem border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  To Pay
                </p>
                <p
                  className={`text-3xl font-black ${pendingOrders > 0 ? "text-orange-500" : "text-gray-900"}`}
                >
                  {pendingOrders}
                </p>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">
                  Recent Orders
                </h3>
                <Link
                  to="/orders"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-gray-50">
                {myOrders.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 font-bold">
                    ไม่มีรายการคำสั่งซื้อในขณะนี้
                  </div>
                ) : (
                  myOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="cursor-pointer p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                          {order.status === "PAID" ? "✅" : "📦"}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg">
                            #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
                            {new Date(order.createdAt).toLocaleDateString(
                              "th-TH",
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                        <p className="font-black text-xl text-gray-900">
                          ฿{order.totalPrice.toLocaleString()}
                        </p>
                        <div className="flex gap-2 items-center">
                          <span
                            className={`text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase shadow-sm ${
                              order.status === "PAID"
                                ? "bg-green-100 text-green-600"
                                : order.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {order.status}
                          </span>
                          {order.status === "PENDING" && (
                            <Link
                              to={`/order-success/${order.id}`}
                              className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest hover:bg-black transition-colors"
                            >
                              Upload Slip
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ✅ Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900">
                  Order Details
                </h2>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
                  #{selectedOrder.id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Item List */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {selectedOrder.items?.map((item, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4">
                      {/* แสดงรูปสินค้าจริงจาก Product Relation */}
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          "🖼️"
                        )}
                      </div>

                      <div>
                        <p className="font-black text-gray-900">
                          {item.product?.name || "Product Name"}
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {/* ✅ เปลี่ยนจาก totalPrice เป็น priceAtPurchase (ราคาต่อชิ้น) */}
                          Qty: {item.quantity} × ฿
                          {item.priceAtPurchase?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* ✅ คำนวณราคารวมของแถวนี้ (จำนวน x ราคาต่อชิ้น) */}
                    <p className="font-black text-gray-900">
                      ฿
                      {(
                        item.quantity * (item.priceAtPurchase || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary Block */}
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>Subtotal</span>
                  <span>฿{selectedOrder.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-gray-900 font-black text-xl pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">
                    ฿{selectedOrder.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-8 bg-gray-50/50 flex gap-3">
              {selectedOrder.status === "PENDING" && (
                <button
                  onClick={() => navigate(`/order-success/${selectedOrder.id}`)}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
                >
                  Go to Payment
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-white border border-gray-200 text-gray-900 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-colors"
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

export default ProfilePage;
