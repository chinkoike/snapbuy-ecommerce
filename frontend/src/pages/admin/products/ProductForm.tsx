import { useState, useEffect } from "react";
import { useProductStore } from "../../../store/useProductStore";
import { useCategoryStore } from "../../../store/useCategoryStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { ProductFormProps } from "../../../../../shared/types/product";
import { ChevronDown, X, Upload, Trash2 } from "lucide-react";

export const ProductForm = ({
  initialData,
  onSuccess,
  onClose,
}: ProductFormProps & { onClose: () => void }) => {
  const products = useProductStore((state) => state.products);
  const createProduct = useProductStore((state) => state.createProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const isProductLoading = useProductStore((state) => state.loading);

  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const { getAccessTokenSilently } = useAuth0();

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
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [fetchCategories, previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormError(null);
      setSelectedFile(file);
      const newPreview = URL.createObjectURL(file);
      setPreviewUrl(newPreview);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");

    setFormData((prev) => ({
      ...prev,
      imageUrl: null,
    }));
    const input = document.getElementById("file-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!initialData && !selectedFile) {
      setFormError("VISUAL_ASSET_REQUIRED");
      return;
    }

    try {
      const token = await getAccessTokenSilently();

      // ปรับเลขให้เป็น Integer ตาม Prisma Schema
      const cleanPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Math.round(parseFloat(formData.price)) || 0,
        stock: Math.round(parseFloat(formData.stock)) || 0,
        categoryId: formData.categoryId,
      };

      if (initialData) {
        await updateProduct(initialData.id, cleanPayload, selectedFile, token);
      } else {
        if (!selectedFile) throw new Error("IMAGE_REQUIRED");
        await createProduct(cleanPayload, selectedFile, token);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error("Submission Error:", error);
      setFormError("Submission Error:");
    }
  };
  if (isProductLoading && products.length === 0)
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse font-black tracking-widest uppercase opacity-20">
          Syncing Data...
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg border-2 border-black shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b-2 border-zinc-100 bg-zinc-50">
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
          className="p-10 space-y-8 bg-white max-h-[75vh] overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Image Section */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">
                Visual_Asset_Upload
              </label>
              <div className="mt-2 relative">
                {previewUrl ? (
                  <div className="relative h-48 w-full border-2 border-black overflow-hidden group/img">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black text-white p-2 opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer hover:bg-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 hover:border-black transition-all cursor-pointer bg-zinc-50"
                    >
                      <Upload size={24} className="text-zinc-400" />
                      <span className="text-[10px] font-black uppercase mt-2 text-zinc-400">
                        Select_Image_File
                      </span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Name Input */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black">
                Product_Identity
              </label>
              <input
                className="w-full border-b-2 border-zinc-100 py-3 text-sm font-bold uppercase tracking-widest focus:border-black outline-none transition-all"
                placeholder="NAME_REQUIRED..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-2 gap-10">
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black">
                  Value_THB
                </label>
                <input
                  className="w-full border-b-2 border-zinc-100 py-3 text-sm font-black focus:border-black outline-none transition-all"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="group">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black">
                  Inventory_Qty
                </label>
                <input
                  className="w-full border-b-2 border-zinc-100 py-3 text-sm font-black focus:border-black outline-none transition-all"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black">
                Details_Specification
              </label>
              <textarea
                className="w-full border-b-2 border-zinc-100 py-3 text-xs font-medium focus:border-black outline-none transition-all resize-none h-20"
                placeholder="DESCRIPTION..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Category Select */}
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black">
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
                <ChevronDown
                  size={14}
                  className="absolute right-0 bottom-3 text-zinc-300 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 space-y-4">
            {formError && (
              <div className="text-[10px] font-black text-red-500 uppercase tracking-widest p-3 bg-red-50 border border-red-200">
                System_Error // {formError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-5 border-2 border-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProductLoading}
                className={`flex-1 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                  isProductLoading
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                    : "bg-black text-white hover:bg-zinc-800"
                }`}
              >
                {isProductLoading
                  ? "Syncing..."
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
