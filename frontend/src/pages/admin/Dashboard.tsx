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
    <div className="p-4 md:p-12 space-y-8 md:space-y-16 bg-[#fafafa] min-h-screen animate-in fade-in duration-700">
      {/* --- Dashboard Header --- */}
      <div className="max-w-400 mx-auto border-b-2 border-black pb-8">
        <p className="text-[10px] font-black text-zinc-400 tracking-[0.5em] uppercase mb-2">
          System_Status
        </p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-black">
          Overview_Control
        </h1>
      </div>

      {/* --- Stats Cards: Modern Minimalist Grid --- */}
      <div className="max-w-400 mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white border border-black p-8 flex justify-between items-start hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 group-hover:text-black transition-colors">
                {card.label.replace(" ", "_")}
              </p>
              <p className="text-4xl md:text-5xl font-black tracking-tighter text-black">
                {card.value}
              </p>
            </div>

            {/* Icon Container: เปลี่ยนเป็นทรงเหลี่ยมคลาสสิก */}
            <div
              className={`w-12 h-12 md:w-16 md:h-16 border-2 border-black flex items-center justify-center text-xl md:text-2xl transition-transform group-hover:-rotate-12 ${card.color.replace("bg-", "text-")} bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
            >
              {card.icon}
            </div>

            {/* ตกแต่งพื้นหลังเล็กน้อยแบบ Technical Line */}
            <div className="absolute right-0 bottom-0 w-24 h-px bg-zinc-100 group-hover:bg-black transition-colors"></div>
          </div>
        ))}
      </div>

      {/* --- Recent Members Section --- */}
      <div className="max-w-400 mx-auto">
        <div className="bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.03)]">
          {/* Table Header Area */}
          <div className="p-6 md:p-8 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-zinc-50/50">
            <div className="space-y-1">
              <h3 className="font-black uppercase text-xs md:text-sm tracking-[0.3em] text-black italic">
                Recent_Member_Logs
              </h3>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                Live_User_Authentication_Feed
              </p>
            </div>
            <span className="text-[10px] font-black text-white bg-black px-4 py-1.5 tracking-widest uppercase italic shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)]">
              Sync_Active
            </span>
          </div>

          {/* ✨ Responsive Table Wrap */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-150">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 bg-white border-b border-zinc-100">
                  <th className="p-8 font-black">User_Identity</th>
                  <th className="p-8 font-black text-center">
                    Privilege_Level
                  </th>
                  <th className="p-8 font-black text-right">
                    Registration_Date
                  </th>
                </tr>
              </thead>
              <tbody className="text-[11px] md:text-xs font-bold uppercase tracking-tight">
                {stats.users.recent.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-50 transition-colors group border-b border-zinc-50 last:border-0"
                  >
                    <td className="p-8 whitespace-nowrap text-black font-black italic">
                      {user.email}
                    </td>
                    <td className="p-8 text-center">
                      <span
                        className={`px-4 py-1.5 border text-[9px] font-black tracking-[0.2em] ${
                          user.role === "ADMIN"
                            ? "bg-black text-white border-black"
                            : "bg-white text-zinc-400 border-zinc-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-8 text-zinc-400 text-right font-mono tracking-widest">
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

          {/* Mobile-only hint: ปรับให้ดูเป็น System Warning */}
          <div className="sm:hidden p-4 text-center border-t border-zinc-100 text-[9px] text-zinc-400 font-black tracking-widest uppercase bg-zinc-50">
            [ ! ] Swipe_Horizontal_To_Expand_Data
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="max-w-400 mx-auto pt-10 pb-10 flex justify-between items-center opacity-10 border-t border-black">
        <p className="text-[9px] font-black tracking-widest uppercase">
          Admin_Core_v2.0
        </p>
        <p className="text-[9px] font-black tracking-widest uppercase">
          Encryption_Active
        </p>
      </div>
    </div>
  );
};
