import { useState, useEffect } from "react";
import { useProductStore } from "../../../store/useProductStore";
import { useCategoryStore } from "../../../store/useCategoryStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { ProductFormProps } from "../../../shared/types/product";
import { X } from "lucide-react"; // แนะนำให้ลง lucide-react เพื่อความสวยงาม

export const ProductForm = ({
  initialData,
  onSuccess,
  onClose,
}: ProductFormProps & { onClose: () => void }) => {
  const { createProduct, updateProduct, loading } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { getAccessTokenSilently } = useAuth0();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price?.toString() || "",
    stock: initialData?.stock?.toString() || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    categoryId: initialData?.categoryId || "",
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getAccessTokenSilently();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    if (initialData) {
      await updateProduct(initialData.id, payload, token);
    } else {
      await createProduct(payload, token);
    }
    onSuccess();
  };

  return (
    // Backdrop สำหรับ Popup
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-lg rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-black uppercase tracking-widest">
            {initialData ? "Edit Product" : "New Collection"}
          </h3>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                Product Name
              </label>
              <input
                className="w-full border-b border-gray-200 p-2 focus:border-black outline-none transition-colors"
                placeholder="Enter name..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                  Price (THB)
                </label>
                <input
                  className="w-full border-b border-gray-200 p-2 focus:border-black outline-none transition-colors"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                  Quantity
                </label>
                <input
                  className="w-full border-b border-gray-200 p-2 focus:border-black outline-none transition-colors"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                Category Selection
              </label>
              <select
                className="w-full border-b border-gray-200 p-2 focus:border-black outline-none bg-transparent transition-colors"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
              >
                <option value="">Choose category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                Image URL
              </label>
              <input
                className="w-full border-b border-gray-200 p-2 focus:border-black outline-none transition-colors"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-black py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 disabled:bg-gray-400 transition"
            >
              {loading
                ? "Syncing..."
                : initialData
                  ? "Update Item"
                  : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
