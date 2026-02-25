import { useAuth0 } from "@auth0/auth0-react";
import { useUserStore } from "../store/ีuseUserStore";
import { useOrderStore } from "../store/useOrderStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { OrderData } from "../../../shared/types/order";
import { UserProfileCard } from "../components/ui/UserProfileCard";
import { OrderList } from "../components/ui/OrderList";
import { OrderDetailModal } from "../components/ui/OrderDetailModal";

const ProfilePage = () => {
  const {
    logout,
    isAuthenticated,
    isLoading: isAuthLoading,
    getAccessTokenSilently,
  } = useAuth0();
  const userFromDb = useUserStore((state) => state.user);

  const { orders, fetchOrdersUser, loading: isOrdersLoading } = useOrderStore();

  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          await fetchOrdersUser(token);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      }
    };
    loadData();
  }, [isAuthenticated, getAccessTokenSilently, fetchOrdersUser]);

  const myOrders = orders.filter((o) => o.userId === userFromDb?.id);
  const pendingOrders = myOrders.filter((o) => o.status === "PENDING").length;

  if (isAuthLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#fafafa]">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-black animate-pulse">
          Authenticating...
        </div>
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#fafafa] p-6 text-center">
        <div className="bg-white p-12 border border-black max-w-md w-full shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
          <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-tighter">
            Member Access
          </h2>
          <p className="text-zinc-500 text-xs uppercase tracking-widest leading-loose mb-10">
            This curation is reserved <br /> for authenticated members only.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-black text-white px-8 py-4 font-black text-xs uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header - Minimal & High Contrast */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black pb-12">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase leading-none">
              Account
            </h1>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-black"></span>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.4em]">
                Management & Order Tracking
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-all"
          >
            <span>[ Logout Session ]</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* User Profile Info */}
          <div className="lg:col-span-1">
            <UserProfileCard userFromDb={userFromDb} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Statistics Dashboard - ปรับให้เป็นแบบกึ่งโปร่งใส เรียบหรู */}
            <div className="grid grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-8 border border-black rounded-sm group hover:bg-black transition-colors duration-300">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 group-hover:text-zinc-500 transition-colors">
                  Total Orders
                </p>
                <p className="text-4xl font-black text-black group-hover:text-white transition-colors tracking-tighter">
                  {String(myOrders.length).padStart(2, "0")}
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-8 border border-black rounded-sm group hover:bg-black transition-colors duration-300">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 group-hover:text-zinc-500 transition-colors">
                  Pending Actions
                </p>
                <p
                  className={`text-4xl font-black tracking-tighter transition-colors ${
                    pendingOrders > 0
                      ? "text-orange-500"
                      : "text-black group-hover:text-white"
                  }`}
                >
                  {String(pendingOrders).padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* ✅ Order List Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">
                  Purchase History
                </h3>
                <div className="h-px flex-1 bg-zinc-100"></div>
              </div>

              <OrderList
                myOrders={orders}
                isLoading={isOrdersLoading}
                onSelectOrder={(order) => setSelectedOrder(order)}
              />
            </div>

            {/* Details Modal Overlay */}
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
