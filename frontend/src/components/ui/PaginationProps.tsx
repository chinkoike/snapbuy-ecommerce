// frontend/src/components/Pagination.tsx
import type { PaginationProps } from "../../../../shared/types/product";
import React from "react";

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-center items-center gap-8 mt-12">
      {/* ปุ่ม Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed transition"
      >
        <span className="text-lg group-hover:-translate-x-1 transition-transform">
          ←
        </span>
        PREV
      </button>

      {/* เลขหน้า */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-light tracking-widest">
          PAGE <span className="font-black text-lg">{currentPage}</span> /{" "}
          {totalPages}
        </span>
      </div>

      {/* ปุ่ม Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || totalPages === 0}
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed transition"
      >
        NEXT
        <span className="text-lg group-hover:translate-x-1 transition-transform">
          →
        </span>
      </button>
    </div>
  );
};
