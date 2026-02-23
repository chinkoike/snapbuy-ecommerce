import { useState, useEffect } from "react"; // เพิ่ม useRef
import { useProductStore } from "../../../store/useProductStore";
import { useCategoryStore } from "../../../store/useCategoryStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { ProductFormProps } from "../../../../../shared/types/product";
import { ChevronDown, X, Upload } from "lucide-react"; // เพิ่ม Icon Upload

export const ProductForm = ({
  initialData,
  onSuccess,
  onClose,
}: ProductFormProps & { onClose: () => void }) => {
  const { createProduct, updateProduct, loading } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { getAccessTokenSilently } = useAuth0();

  // 1. เพิ่ม State สำหรับเก็บไฟล์ที่เลือก
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData?.imageUrl || "",
  );

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price?.toString() || "",
    stock: initialData?.stock?.toString() || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || "",
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ฟังก์ชันจัดการการเปลี่ยนไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // ทำ Preview รูปภาพ
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // เคลียร์ error เก่าก่อน

    // เช็คกรณีสร้างใหม่แต่ไม่เลือกรูป
    if (!initialData && !selectedFile) {
      setFormError("VISUAL_ASSET_REQUIRED"); // ใช้ Text เท่ๆ ให้เข้ากับธีม
      return;
    }

    const token = await getAccessTokenSilently();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      if (initialData) {
        await updateProduct(initialData.id, payload, selectedFile, token);
      } else {
        await createProduct(payload, selectedFile!, token);
      }
      onSuccess();
    } catch (error) {
      console.error("Submit Error:", error);
      setFormError("SYSTEM_SYNC_FAILED");
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg border border-black shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-8 border-b border-zinc-100 bg-zinc-50">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-zinc-400 tracking-[0.4em] uppercase">
              Inventory_Update
            </p>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-black">
              {initialData ? "Edit_Product" : "New_Collection"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border border-transparent hover:border-black hover:rotate-90 transition-all duration-300 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-10 space-y-8 bg-white max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-6">
            {/* 3. ส่วนอัปโหลดรูปภาพใหม่ (แทนที่ Input URL เดิม) */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">
                Visual_Asset_Upload
              </label>
              <div className="mt-2 relative group/upload">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 hover:border-black transition-all cursor-pointer bg-zinc-50 overflow-hidden"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-400 group-hover/upload:text-black">
                      <Upload size={24} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase mt-2">
                        Select_Image
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">
                Product_Identity
              </label>
              <input
                className="w-full border-b-2 border-zinc-100 py-3 text-sm font-bold uppercase tracking-widest focus:border-black outline-none transition-all placeholder:text-zinc-200"
                placeholder="NAME_REQUIRED..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">
                  Value_THB
                </label>
                <input
                  className="w-full border-b-2 border-zinc-100 py-3 text-sm font-black focus:border-black outline-none transition-all"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">
                  Inventory_Qty
                </label>
                <input
                  className="w-full border-b-2 border-zinc-100 py-3 text-sm font-black focus:border-black outline-none transition-all"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">
                Classification
              </label>
              <div className="relative">
                <select
                  className="w-full border-b-2 border-zinc-100 py-3 text-[11px] font-black uppercase tracking-widest focus:border-black outline-none bg-transparent appearance-none transition-all cursor-pointer"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">SELECT_CATEGORY</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-0 bottom-3 pointer-events-none text-zinc-300">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-5 border border-zinc-200 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-50 hover:border-black transition-all cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 disabled:bg-zinc-300 transition-all cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none"
            >
              {loading
                ? "System_Syncing..."
                : initialData
                  ? "Commit_Changes"
                  : "Push_To_Cloud"}
            </button>
          </div>
          {/* Footer Actions */}
          <div className="pt-4 flex flex-col gap-4">
            {/* Error Message แบบ Minimal */}
            {formError && (
              <div className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                Error // {formError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-5 border border-zinc-200 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-50 hover:border-black transition-all cursor-pointer"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none ${
                  formError
                    ? "bg-red-500 text-white" // ถ้ามี Error ปุ่มจะเปลี่ยนเป็นสีแดง
                    : "bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-300"
                }`}
              >
                {loading
                  ? "System_Syncing..."
                  : formError
                    ? "Retry_Push"
                    : initialData
                      ? "Commit_Changes"
                      : "Push_To_Cloud"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
