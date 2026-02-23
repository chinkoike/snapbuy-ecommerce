import { useState } from "react";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import type { ProductData } from "../../../../../shared/types/product";
import { CategoryCreate } from "./CategoryCreate";

export const ProductPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(
    null,
  );

  // เมื่อกดปุ่ม Edit จาก List
  const handleEditRequest = (product: ProductData) => {
    setEditingProduct(product);
    setShowForm(true); // เปิด Modal
  };

  // เมื่อบันทึกสำเร็จ หรือกดปิดฟอร์ม
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-8 md:p-12 bg-[#fafafa] min-h-screen space-y-12 animate-in fade-in duration-700">
      {/* --- Top Navigation & Header Area --- */}
      <div className="max-w-400 mx-auto flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-black">
            Inventory_Vault
          </h1>
          <p className="text-[10px] font-black text-zinc-400 tracking-[0.5em] uppercase">
            Centralized_Product_Control_Unit
          </p>
        </div>

        {/* Toggle Button: เปลี่ยนจาก Rounded เป็น Solid Square Style */}
        <button
          onClick={
            showForm
              ? handleCloseForm
              : () => {
                  setEditingProduct(null);
                  setShowForm(true);
                }
          }
          className={`px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 ${
            showForm
              ? "bg-white text-zinc-400 border border-zinc-200 shadow-none translate-x-0.5 ranslate-y-0.5"
              : "bg-black text-white border border-black hover:bg-zinc-800"
          }`}
        >
          {showForm ? "✕ Close_Entry" : "+ Initiate_New_Product"}
        </button>
      </div>

      {/* --- Main Content Area --- */}
      <div className="max-w-400 mx-auto space-y-16">
        {/* Product Form Section */}
        {showForm && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <ProductForm
              key={editingProduct?.id || "new-product"}
              initialData={editingProduct}
              onClose={handleCloseForm}
              onSuccess={() => {
                handleCloseForm();
              }}
            />
          </div>
        )}

        {/* Section: Category Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-8 bg-black"></div>
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-black">
              Categorization_Tools
            </h2>
          </div>
          <CategoryCreate />
        </div>

        {/* Section: Product Database Table */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-0.5 w-8 bg-black"></div>
            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-black">
              Active_Product_Registry
            </h2>
          </div>
          <ProductList onEdit={handleEditRequest} />
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="max-w-400 mx-auto pt-20 pb-10 flex justify-between items-center opacity-20 border-t border-zinc-200">
        <p className="text-[9px] font-black tracking-widest uppercase">
          Admin_Terminal_V2
        </p>
        <p className="text-[9px] font-black tracking-widest uppercase">
          © 2026 Internal_System
        </p>
      </div>
    </div>
  );
};
