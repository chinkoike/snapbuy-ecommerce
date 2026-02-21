// src/pages/ProfilePage.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useUserStore } from "../store/ีuseUserStore";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { logout, isAuthenticated, isLoading } = useAuth0();
  const userFromDb = useUserStore((state) => state.user);
  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        กำลังโหลด...
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">
          เข้าถึงได้เฉพาะสมาชิกเท่านั้น
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-end border-b pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              โปรไฟล์ของฉัน
            </h1>
            <p className="text-gray-500 mt-1">
              จัดการข้อมูลส่วนตัวและตรวจสอบสถานะคำสั่งซื้อของคุณ
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-md transition"
          >
            ออกจากระบบ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: User Info Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-sm text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded-full inline-block mt-1">
                {userFromDb?.role?.toUpperCase() || "USER"}
              </p>

              <div className="mt-6 text-left space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">
                    Email Address
                  </label>
                  <p className="text-gray-700 truncate">{userFromDb?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: E-commerce Features */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">คำสั่งซื้อทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">ที่ต้องชำระ</p>
                <p className="text-2xl font-bold text-orange-500">1</p>
              </div>
            </div>

            {/* Recent Orders (Mockup) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="font-bold text-gray-800">คำสั่งซื้อล่าสุด</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2].map((order) => (
                  <div
                    key={order}
                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        📦
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          Order #SN-202{order}
                        </p>
                        <p className="text-xs text-gray-500">
                          14 กุมภาพันธ์ 2026
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">฿1,250.00</p>
                      <span className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase font-bold">
                        สำเร็จ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 text-center">
                <button className="text-sm font-semibold text-blue-600 hover:underline">
                  ดูประวัติทั้งหมด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
