import type { UserProfileCardProps } from "../../../../shared/types/user";
import React from "react";

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userFromDb,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="lg:col-span-1">
        <div className="bg-white p-8 border border-black relative overflow-hidden animate-pulse rounded-sm">
          {/* Badge Skeleton */}
          <div className="absolute top-0 right-0 p-6">
            <div className="h-3 w-12 bg-zinc-100" />
          </div>

          {/* Avatar Skeleton */}
          <div className="w-16 h-16 bg-zinc-200 mb-8 border border-zinc-100" />

          {/* Info Skeleton */}
          <div className="h-5 w-3/4 bg-zinc-200 mb-3" />
          <div className="h-3 w-1/2 bg-zinc-100 mb-10" />

          {/* Member Info Skeleton */}
          <div className="pt-8 border-t border-zinc-100 flex justify-between">
            <div className="h-3 w-20 bg-zinc-100" />
            <div className="h-3 w-10 bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

  // --- ส่วนของ UI จริง ---
  return (
    <div className="lg:col-span-1">
      <div className="bg-white p-8 border border-black relative overflow-hidden rounded-sm group hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] transition-all">
        {/* Role Badge */}
        <div className="absolute top-0 right-0 p-6">
          <span className="text-[9px] font-black border border-black px-2 py-0.5 uppercase tracking-[0.2em]">
            {userFromDb?.role || "Customer"}
          </span>
        </div>

        {/* Avatar Area - ใช้ Placeholder ที่ดูดีขึ้น */}
        <div className="w-16 h-16 bg-black mb-8 flex items-center justify-center text-white text-xl shadow-inner">
          <span className="font-light italic">
            {(userFromDb?.email?.[0] || "U").toUpperCase()}
          </span>
        </div>

        {/* User Info */}
        <h3 className="text-2xl font-black text-black truncate uppercase tracking-tighter leading-none mb-1">
          {userFromDb?.email?.split("@")[0] || "User Name"}
        </h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-10 truncate">
          {userFromDb?.email || "loading email..."}
        </p>

        {/* Member Details */}
        <div className="pt-8 border-t border-zinc-100 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Member Since
            </span>
            <span className="text-xs font-black text-black italic">2026</span>
          </div>

          {/* เพิ่ม Link หรือปุ่มสไตล์ Minimal ถ้าจำเป็น */}
          <button className="w-full py-3 border border-zinc-200 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
