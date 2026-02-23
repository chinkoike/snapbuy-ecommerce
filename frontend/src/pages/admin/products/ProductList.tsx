import { useEffect, useState } from "react";
import { useProductStore } from "../../../store/useProductStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { ProductData } from "../../../../../shared/types/product";

interface ProductListProps {
  onEdit: (product: ProductData) => void;
}

export const ProductList = ({ onEdit }: ProductListProps) => {
  const { getAccessTokenSilently } = useAuth0();
  const { loading, products, fetchProducts, deleteProduct } = useProductStore();
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (
      !window.confirm(
        `Are you sure you want to ${currentStatus ? "disable" : "enable"} this product?`,
      )
    )
      return;
    try {
      setProcessingId(id);
      const token = await getAccessTokenSilently();

      await deleteProduct(id, token);
    } finally {
      setProcessingId(null);
    }
  };
  if (loading && products.length === 0)
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse font-black tracking-widest uppercase opacity-20">
          Syncing Data...
        </div>
      </div>
    );
  return (
    <div className="bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] md:overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">
          <tr>
            <th className="p-6">Product_Identity</th>
            <th className="p-6">Inventory_&_Value</th>
            <th className="p-6 text-center">Status</th>
            <th className="p-6 text-right">System_Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {products.map((product) => (
            <tr
              key={product.id}
              className={`transition-all duration-300 ${
                !product.isActive
                  ? "bg-zinc-50 opacity-60 grayscale"
                  : "hover:bg-zinc-50/80"
              }`}
            >
              <td className="p-6">
                <div className="flex items-center gap-5">
                  {/* Image Box: เปลี่ยนเป็นเหลี่ยมคม */}
                  <div className="h-14 w-14 border border-zinc-200 bg-zinc-100 overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        className="h-full w-full object-cover hover:scale-110 transition-transform duration-500"
                        alt={product.name}
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-black tracking-tight uppercase ${
                        !product.isActive
                          ? "text-zinc-400 line-through"
                          : "text-black"
                      }`}
                    >
                      {product.name}
                    </p>
                    <p className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase italic">
                      Category: {product.category?.name}
                    </p>
                  </div>
                </div>
              </td>

              <td className="p-6">
                <p className="text-base font-black text-black tracking-tighter">
                  ฿{Number(product.price || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase mt-1">
                  Stock_Level:{" "}
                  <span className={product.stock < 10 ? "text-red-500" : ""}>
                    {product.stock}
                  </span>
                </p>
              </td>

              <td className="p-6 text-center">
                <span
                  className={`px-3 py-1 border text-[9px] font-black uppercase tracking-widest ${
                    product.isActive
                      ? "border-green-500 text-green-600 bg-green-50"
                      : "border-zinc-300 text-zinc-400 bg-zinc-100"
                  }`}
                >
                  {product.isActive ? "In_Stock" : "Out_Of_Service"}
                </span>
              </td>

              <td className="p-6 text-right">
                <div className="flex justify-end items-center gap-6">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-[10px] font-black uppercase tracking-widest text-black hover:underline underline-offset-4 disabled:opacity-0 transition-all cursor-pointer"
                    disabled={!product.isActive}
                  >
                    Edit_Entry
                  </button>

                  <button
                    onClick={() =>
                      handleToggleStatus(product.id, product.isActive)
                    }
                    disabled={processingId === product.id}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border transition-all cursor-pointer ${
                      product.isActive
                        ? "border-red-200 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {processingId === product.id
                      ? "Wait..."
                      : product.isActive
                        ? "Terminate"
                        : "Re-Activate"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
