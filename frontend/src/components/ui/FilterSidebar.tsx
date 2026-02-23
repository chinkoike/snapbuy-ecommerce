import type { FilterSidebarProps } from "../../../../shared/types/product";
import React from "react";

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white py-4">
      {/* Title หัวข้อ Filter */}
      <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-8 border-b border-black pb-2">
        Filters
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Categories
          </h3>
          <div className="flex flex-col gap-3">
            {/* ปุ่ม All */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`text-left text-sm transition-all duration-300 ${
                selectedCategory === null
                  ? "font-bold tracking-tighter pl-2 border-l-2 border-black"
                  : "text-gray-500 hover:text-black hover:pl-2"
              }`}
            >
              ALL COLLECTIONS
            </button>

            {/* รายการ Categories */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`text-left text-sm uppercase transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "font-bold tracking-tighter pl-2 border-l-2 border-black"
                    : "text-gray-500 hover:text-black hover:pl-2"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* สามารถเพิ่มฟิลเตอร์ราคา หรือสี ในอนาคตได้ที่นี่ */}
      </div>
    </div>
  );
};
