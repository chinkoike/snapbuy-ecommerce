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

  // Get orders and loading state from OrderStore
  const { orders, fetchOrdersUser, loading: isOrdersLoading } = useOrderStore();

  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          // Ensure fetchOrders points to /api/user/order (Customer endpoint)
          await fetchOrdersUser(token);
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      }
    };
    loadData();
  }, [isAuthenticated, getAccessTokenSilently, fetchOrdersUser]);

  // ✅ Filter only orders belonging to this specific User
  const myOrders = orders.filter((o) => o.userId === userFromDb?.id);
  const pendingOrders = myOrders.filter((o) => o.status === "PENDING").length;

  // Combine loading states for initial entrance
  if (isAuthLoading)
    return (
      <div className="flex justify-center items-center h-screen font-bold text-gray-400 animate-pulse">
        Authenticating...
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Member Access Only
          </h2>
          <p className="text-gray-500 mb-8">
            Please log in to view your profile and orders.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform"
          >
            Back to Home
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
              My Profile
            </h1>
            <p className="text-gray-500 font-medium">
              Manage your info and track your orders
            </p>
          </div>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            className="self-start text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 px-6 py-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Info */}
          <UserProfileCard userFromDb={userFromDb} />

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {myOrders.length}
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                  Pending Payments
                </p>
                <p
                  className={`text-3xl font-black ${pendingOrders > 0 ? "text-orange-500" : "text-gray-900"}`}
                >
                  {pendingOrders}
                </p>
              </div>
            </div>

            {/* ✅ Order List with filtered data */}
            <OrderList
              myOrders={myOrders}
              isLoading={isOrdersLoading}
              onSelectOrder={(order) => setSelectedOrder(order)}
            />

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
