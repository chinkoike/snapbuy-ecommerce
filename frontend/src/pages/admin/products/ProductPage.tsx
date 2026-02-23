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
    <div className="p-8 shadow-xl border border-gray-100 overflow-hidden bg-gray-50 min-h-screen space-y-6">
      {/* ... ส่วน Header เหมือนเดิม ... */}
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* เปลี่ยนปุ่ม Add Product ให้เรียก handleAddNew (ถ้ามี) หรือ set ให้เป็น null เสมอ */}
        <button
          onClick={
            showForm
              ? handleCloseForm
              : () => {
                  setEditingProduct(null);
                  setShowForm(true);
                }
          }
          className={`${
            showForm
              ? "bg-gray-200 text-gray-700"
              : "bg-black hover:bg-gray-700 text-white"
          } px-6 py-2.5 rounded-xl font-bold transition-all shadow-md`}
        >
          {showForm ? "Close" : "+ Add Product"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {showForm && (
          <ProductForm
            // ✨ หัวใจสำคัญ: เมื่อ key เปลี่ยน React จะทำลายคอมโพเนนต์เก่าและสร้างใหม่
            // ทำให้ useState ใน ProductForm รับค่าจาก initialData ใหม่ทันทีโดยไม่ Error
            key={editingProduct?.id || "new-product"}
            initialData={editingProduct}
            onClose={handleCloseForm}
            onSuccess={() => {
              handleCloseForm();
              // fetchProducts(); // เรียกผ่าน store โดยตรงใน ProductList อยู่แล้ว
            }}
          />
        )}
        <CategoryCreate />
        <ProductList onEdit={handleEditRequest} />
      </div>
    </div>
  );
};
