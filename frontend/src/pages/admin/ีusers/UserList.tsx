import { useEffect, useState } from "react";
import { useUserStore } from "../../../store/ีuseUserStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { UserData } from "../../../shared/types/user"; // ตรวจสอบ path type ของคุณ

export const UserList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { users, fetchUsers, toggleUserStatus, loading, error } =
    useUserStore();

  // State สำหรับควบคุม Modal
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    id: string;
    action: string;
    isOpen: boolean;
  } | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        await fetchUsers(token);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    loadUsers();
  }, [fetchUsers, getAccessTokenSilently]);

  // ฟังก์ชันจัดการการเปลี่ยนสถานะ
  const handleConfirmToggle = async () => {
    if (!confirmModal) return;
    try {
      const token = await getAccessTokenSilently();
      await toggleUserStatus(confirmModal.id, token);
      setConfirmModal(null);
    } catch (err) {
      console.log(err);
      alert("Failed to update user status");
    }
  };

  if (loading && users.length === 0)
    return (
      <div className="p-8 text-center animate-pulse text-gray-500">
        Loading users...
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            User Management
          </h2>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-scroll md:overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6">User Profile</th>
              <th className="p-6 text-center">Orders</th>
              <th className="p-6 text-center">Total Spent</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-20 text-center text-gray-400 font-medium"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
                        {user.email ? user.email[0].toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {user.email.split("@")[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                      {user.orderCount || 0}
                    </span>
                  </td>
                  <td className="p-6 text-center font-bold text-green-600">
                    ฿{(user.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="p-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                      ></span>
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 font-bold text-sm"
                    >
                      Details
                    </button>
                    <button
                      onClick={() =>
                        setConfirmModal({
                          id: user.id,
                          action: user.isActive ? "Block" : "Enable",
                          isOpen: true,
                        })
                      }
                      className={`font-bold text-sm ${user.isActive ? "text-red-500 hover:text-red-700" : "text-blue-600 hover:text-blue-800"}`}
                    >
                      {user.isActive ? "Block" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- Detail Modal --- */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Customer Profile
                </h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-black text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-green-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Total Spent
                  </p>
                  <p className="text-2xl font-black text-green-700">
                    ฿{selectedUser.totalSpent?.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Total Orders
                  </p>
                  <p className="text-2xl font-black text-indigo-700">
                    {selectedUser.orderCount} Orders
                  </p>
                </div>
              </div>

              {/* Order History List */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-black rounded-full"></span>
                  Recent Orders
                </h4>

                <div className="space-y-3">
                  {/* หากไม่มี Order เลย */}
                  {!selectedUser.orders || selectedUser.orders.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-3xl text-gray-400">
                      No transaction history found.
                    </div>
                  ) : (
                    // วนลูปแสดงรายการ Order (ต้องมั่นใจว่า Backend ส่ง orders[] มาด้วย)
                    selectedUser.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-mono text-xs">
                            #{order.id.slice(-4).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              ฿{order.totalPrice.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Ordered on{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
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
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Confirm Block Modal --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-4xl w-full max-w-sm shadow-2xl overflow-hidden p-8 text-center animate-in slide-in-from-bottom-4 duration-300">
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${confirmModal.action === "Block" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
            >
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {confirmModal.action} User?
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to{" "}
              <strong>{confirmModal.action.toLowerCase()}</strong> this user?
              They will be{" "}
              {confirmModal.action === "Block" ? "restricted" : "restored"}{" "}
              immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-6 py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`flex-1 px-6 py-3 rounded-2xl font-bold text-white transition shadow-lg ${confirmModal.action === "Block" ? "bg-red-500 hover:bg-red-600 shadow-red-100" : "bg-blue-500 hover:bg-blue-600 shadow-blue-100"}`}
              >
                Yes, {confirmModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
