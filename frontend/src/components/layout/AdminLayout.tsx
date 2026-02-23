import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Menu, X } from "lucide-react"; // แนะนำให้ใช้ lucide-react เพื่อความสวยงาม

export const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth0(); // ✨ ดึงข้อมูล User จริง
  const [isSidebarOpen, setSidebarOpen] = useState(false); // ✨ State สำหรับเปิด/ปิด Sidebar

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: "📊" },
    { label: "Products", path: "/admin/products", icon: "📦" },
    { label: "Users", path: "/admin/users", icon: "👥" },
    { label: "Orders", path: "/admin/orders", icon: "🛒" },
  ];

  return (
    <div className="flex min-h-screen bg-[#fafafa] font-sans text-black uppercase tracking-tight">
      {/* 📱 Mobile Overlay - ปรับเป็นสีดำเข้ม backdrop-blur */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - เปลี่ยนเป็นธีมเข้ม (Dark Sidebar) เพื่อแยกความต่างจากหน้า User */}
      <aside
        className={`
    fixed inset-y-0 left-0 z-[70] w-72 bg-black text-white transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        <div className="p-10 flex justify-between items-center border-b border-zinc-800">
          <h1 className="text-xl font-black tracking-tighter text-white flex flex-col">
            <span className="text-2xl leading-none">SNAPBUY</span>
            <span className="text-[9px] text-zinc-500 tracking-[0.4em] mt-1">
              ADMIN_SYSTEM
            </span>
          </h1>
          <button
            className="lg:hidden text-zinc-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-6 mt-8 space-y-2 overflow-y-auto">
          <p className="text-[9px] font-black text-zinc-600 tracking-[0.3em] mb-4 px-4">
            MAIN_MENU
          </p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 transition-all duration-300 border ${
                isActive(item.path)
                  ? "bg-white text-black border-white"
                  : "text-zinc-500 border-transparent hover:border-zinc-700 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-black tracking-[0.2em]">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Admin Profile Section - ดีไซน์แบบ Minimal Inverted */}
        <div className="p-6">
          <div className="flex items-center gap-4 px-4 py-6 bg-zinc-900 border border-zinc-800">
            <div className="relative">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-10 h-10 border border-zinc-700 p-0.5"
                />
              ) : (
                <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-xs">
                  {user?.name?.charAt(0) || "A"}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black truncate tracking-widest text-white uppercase">
                {user?.name || "Administrator"}
              </p>
              <button
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
                className="text-[9px] text-zinc-500 font-black flex items-center gap-1 hover:text-red-500 transition-colors uppercase mt-1 tracking-widest"
              >
                [ Sign_Out ]
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        {/* Top Header Bar - ปรับให้คลีนและกว้างขึ้น */}
        <header className="h-20 bg-white border-b border-black px-6 md:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden p-2 text-black border border-black"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="text-[10px] font-black text-zinc-300 tracking-[0.3em] flex items-center gap-3">
              ADMIN_PANEL <span className="text-black">/</span>
              <span className="text-black font-black uppercase tracking-tighter text-sm">
                {location.pathname.split("/").pop() || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[9px] font-black text-black uppercase tracking-[0.2em] border-l border-black pl-6 h-10">
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </header>

        {/* Content Section */}
        <section className="flex-1 overflow-y-auto bg-[#fafafa] p-6 md:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto min-h-full">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};
