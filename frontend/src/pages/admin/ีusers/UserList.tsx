import { useEffect, useState } from "react";
import { useUserStore } from "../../../store/ีuseUserStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { UserData } from "../../../../../shared/types/user";
import { X, AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";

export const UserList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { users, fetchUsers, toggleUserStatus, loading, error } =
    useUserStore();

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

  const handleConfirmToggle = async () => {
    if (!confirmModal) return;
    try {
      const token = await getAccessTokenSilently();
      await toggleUserStatus(confirmModal.id, token);
      setConfirmModal(null);
    } catch (err) {
      alert("Failed to update user status");
      console.log(err);
    }
  };

  if (loading && users.length === 0)
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse font-black tracking-[0.4em] uppercase opacity-20">
          Syncing Data...
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-10 space-y-10">
      {/* Header Section */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-zinc-400 tracking-[0.5em] uppercase italic">
          Admin_Command_Center
        </p>
        <h2 className="text-4xl font-black text-black uppercase tracking-tighter italic">
          User_Registry
        </h2>
        {error && (
          <div className="inline-block px-4 py-2 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase tracking-widest mt-4">
            Critical_Error: {error}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white text-[9px] font-black uppercase tracking-[0.3em]">
              <tr>
                <th className="p-6 border-r border-zinc-800">
                  User_Identification
                </th>
                <th className="p-6 text-center border-r border-zinc-800">
                  Activity
                </th>
                <th className="p-6 text-center border-r border-zinc-800">
                  Value_Contribution
                </th>
                <th className="p-6 text-center border-r border-zinc-800">
                  Permission_Status
                </th>
                <th className="p-6 text-right uppercase">System_Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-100">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-20 text-center text-zinc-400 font-black uppercase tracking-widest italic opacity-30"
                  >
                    Null_Dataset: No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-zinc-50 transition-colors group ${!user.isActive ? "bg-zinc-100/50" : ""}`}
                  >
                    <td className="p-6 border-r border-zinc-100">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-xl bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-black uppercase tracking-tight text-sm italic">
                            {user.email.split("@")[0]}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold lowercase tracking-tight">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center border-r border-zinc-100 font-black text-sm italic">
                      {user.orderCount || 0}{" "}
                      <span className="text-[8px] not-italic text-zinc-400 ml-1 uppercase">
                        Txns
                      </span>
                    </td>
                    <td className="p-6 text-center border-r border-zinc-100">
                      <p className="font-black text-black text-sm">
                        ฿{(user.totalSpent || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="p-6 text-center border-r border-zinc-100">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 border-2 font-black text-[9px] uppercase tracking-tighter ${
                          user.isActive
                            ? "border-green-500 text-green-600 bg-green-50"
                            : "border-red-500 text-red-600 bg-red-50"
                        }`}
                      >
                        {user.isActive ? (
                          <ShieldCheck size={12} />
                        ) : (
                          <ShieldAlert size={12} />
                        )}
                        {user.isActive ? "Authorized" : "Terminated"}
                      </div>
                    </td>
                    <td className="p-6 text-right space-x-6">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDetailOpen(true);
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-black hover:underline underline-offset-8 cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            id: user.id,
                            action: user.isActive ? "Block" : "Enable",
                            isOpen: true,
                          })
                        }
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 transition-all cursor-pointer ${
                          user.isActive
                            ? "border-red-500 text-red-600 hover:bg-red-500 hover:text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)]"
                            : "border-black text-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                        }`}
                      >
                        {user.isActive ? "Block_User" : "Restore_User"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Detail Modal (Brutalist style) --- */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white border-4 border-black w-full max-w-2xl shadow-[30px_30px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b-4 border-black bg-zinc-50 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-zinc-400 tracking-[0.4em] uppercase italic">
                  Profile_Inspector
                </p>
                <h3 className="text-3xl font-black text-black uppercase italic tracking-tighter">
                  {selectedUser.email.split("@")[0]}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="w-12 h-12 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer rotate-0 hover:rotate-90 transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 italic">
                    Contribution_Value
                  </p>
                  <p className="text-3xl font-black text-black italic">
                    ฿{selectedUser.totalSpent?.toLocaleString()}
                  </p>
                </div>
                <div className="p-6 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 italic">
                    Activity_Volume
                  </p>
                  <p className="text-3xl font-black text-black italic">
                    {selectedUser.orderCount} Orders
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                  <span className="w-10 h-0.5 bg-black"></span>{" "}
                  Transaction_History
                </h4>
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                  {!selectedUser.orders || selectedUser.orders.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-zinc-200 text-zinc-400 uppercase text-[10px] font-black italic">
                      No_System_Logs_Found
                    </div>
                  ) : (
                    selectedUser.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border-2 border-black hover:bg-zinc-50 transition-all group"
                      >
                        <div className="flex items-center gap-4 font-black italic">
                          <span className="text-[10px] text-zinc-400">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-sm">
                            ฿{order.totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[9px] font-black uppercase px-3 py-1 bg-black text-white italic tracking-widest group-hover:bg-zinc-800 transition-colors">
                          {order.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-zinc-50 border-t-2 border-zinc-100 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-12 py-4 bg-black text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-zinc-800 transition-all cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none italic"
              >
                Close_Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Confirm Block Modal (Small Brutalist) --- */}
      {confirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-white border-4 border-black w-full max-w-sm p-10 text-center shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)]">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 border-2 border-red-500 text-red-600 flex items-center justify-center rotate-3 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.2)]">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-black mb-4 uppercase italic tracking-tighter">
              System_Warning
            </h3>
            <p className="text-xs text-zinc-500 mb-10 font-bold leading-relaxed uppercase tracking-tighter">
              Executing{" "}
              <span className="text-black underline">
                {confirmModal.action.toLowerCase()}
              </span>{" "}
              protocol on target user. This will affect access permissions
              immediately.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-4 border-2 border-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-100 cursor-pointer italic"
              >
                Abort
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`flex-1 px-4 py-4 font-black uppercase text-[10px] tracking-widest text-white cursor-pointer italic shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none ${confirmModal.action === "Block" ? "bg-red-500 hover:bg-red-600" : "bg-black hover:bg-zinc-800"}`}
              >
                Confirm_Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
