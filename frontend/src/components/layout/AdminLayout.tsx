import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Menu, X, LogOut } from "lucide-react"; // แนะนำให้ใช้ lucide-react เพื่อความสวยงาม

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
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* 📱 Mobile Overlay (ปิด Sidebar เมื่อคลิกข้างนอก) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-8 flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
            <span className="bg-black text-white p-1 rounded-lg">SB</span>
            SnapBuy{" "}
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-widest ml-1 font-bold">
              Admin
            </span>
          </h1>
          {/* ปุ่มปิดสำหรับ Mobile */}
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)} // ปิดเมนูเมื่อกดในมือถือ
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-black text-white shadow-lg shadow-black/20"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Profile Section ✨ */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-2xl border border-gray-100">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black uppercase text-xs">
                {user?.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate">
                {user?.name || "Admin"}
              </p>
              <button
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
                className="text-[10px] text-red-500 font-bold flex items-center gap-1 hover:underline"
              >
                <LogOut size={10} /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* ✨ ปุ่ม Hamburger สำหรับ Mobile */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="text-xs md:text-sm font-medium text-gray-400">
              Admin Panel /{" "}
              <span className="text-black font-black capitalize tracking-tight">
                {location.pathname.split("/").pop() || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </header>

        {/* Content Section (Scrollable) */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
          <div className="min-h-full">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};
