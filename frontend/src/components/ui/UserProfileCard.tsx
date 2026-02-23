import type { UserProfileCardProps } from "../../../../shared/types/user";
import React from "react";

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userFromDb,
  isLoading,
}) => {
  // --- ส่วนของ Skeleton UI ---
  if (isLoading) {
    return (
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden animate-pulse">
          {/* Badge Skeleton */}
          <div className="absolute top-0 right-0 p-4">
            <div className="h-4 w-16 bg-zinc-100 rounded-full" />
          </div>

          {/* Avatar Skeleton */}
          <div className="w-20 h-20 bg-zinc-200 rounded-3xl mb-6 shadow-lg shadow-zinc-50" />

          {/* Info Skeleton */}
          <div className="h-6 w-3/4 bg-zinc-200 rounded-md mb-2" />
          <div className="h-4 w-1/2 bg-zinc-100 rounded-md mb-6" />

          {/* Member Info Skeleton */}
          <div className="pt-6 border-t border-gray-50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-zinc-100 rounded-md" />
              <div className="h-4 w-10 bg-zinc-200 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ส่วนของ UI จริง (เหมือนเดิมของคุณ) ---
  return (
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
          {userFromDb?.email?.split("@")[0] || "User Name"}
        </h3>
        <p className="text-sm text-gray-400 font-medium mb-6 truncate">
          {userFromDb?.email || "loading email..."}
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
  );
};
