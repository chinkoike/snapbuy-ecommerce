import { useEffect } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import { useAuth0 } from "@auth0/auth0-react";

export const Dashboard = () => {
  const { stats, loading, fetchStats } = useAdminStore();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const init = async () => {
      try {
        const token = await getAccessTokenSilently();
        await fetchStats(token);
      } catch (err) {
        console.error("Auth Error:", err);
      }
    };
    init();
  }, [fetchStats, getAccessTokenSilently]);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse font-black tracking-widest uppercase opacity-20">
          Syncing Data...
        </div>
      </div>
    );
  }

  const cards = [
    {
      ...stats.sales,
      value: `฿${stats.sales.total.toLocaleString()}`,
      color: "bg-blue-600",
    },
    {
      ...stats.inventory,
      value: stats.inventory.active.toLocaleString(),
      color: "bg-emerald-600",
    },
    {
      ...stats.users,
      value: stats.users.total.toLocaleString(),
      color: "bg-violet-600",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">
        Overview
      </h1>

      {/* Stats Cards: Responsive Grid */}
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6 md:p-8 flex justify-between items-end hover:border-black transition-colors"
          >
            <div>
              <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                {card.label}
              </p>
              <p className="text-2xl md:text-3xl font-black">{card.value}</p>
            </div>
            <div
              className={`w-10 h-10 md:w-12 md:h-12 ${card.color} text-white flex items-center justify-center text-lg md:text-xl shadow-lg`}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Members Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="font-bold uppercase text-[10px] md:text-xs tracking-widest">
            Recent Members
          </h3>
          <span className="text-[9px] md:text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
            NEW REGISTRATIONS
          </span>
        </div>

        {/* ✨ Responsive Table Wrap */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-150">
            <thead>
              <tr className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50/50">
                <th className="p-4 font-bold border-b border-gray-100">
                  Email
                </th>
                <th className="p-4 font-bold border-b border-gray-100">Role</th>
                <th className="p-4 font-bold border-b border-gray-100">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm font-medium">
              {stats.users.recent.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 whitespace-nowrap">{user.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase ${
                        user.role === "ADMIN"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile-only hint */}
        <div className="sm:hidden p-3 text-center border-t border-gray-50 text-[10px] text-gray-300 italic">
          Swipe horizontally to view full table
        </div>
      </div>
    </div>
  );
};
