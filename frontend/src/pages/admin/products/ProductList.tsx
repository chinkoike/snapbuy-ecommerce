import { useEffect, useState } from "react";
import { useProductStore } from "../../../store/useProductStore";
import { useAuth0 } from "@auth0/auth0-react";
import type { ProductData } from "../../../shared/types/product";

interface ProductListProps {
  onEdit: (product: ProductData) => void;
}

export const ProductList = ({ onEdit }: ProductListProps) => {
  const { getAccessTokenSilently } = useAuth0();
  const { products, fetchProducts, deleteProduct } = useProductStore();
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 md:overflow-hidden overflow-x-scroll">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest">
          <tr>
            <th className="p-5">Product</th>
            <th className="p-5">Price & Stock</th>
            <th className="p-5">Status</th>
            <th className="p-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr
              key={product.id}
              className={`transition-all ${!product.isActive ? "bg-gray-50 grayscale" : "hover:bg-gray-50/50"}`}
            >
              <td className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-bold ${!product.isActive ? "text-gray-400 line-through" : "text-gray-900"}`}
                    >
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {product.category?.name}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-5">
                <p className="font-bold">฿{product.price.toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-mono">
                  Stock: {product.stock}
                </p>
              </td>
              <td className="p-5">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {product.isActive ? "Active" : "Disabled"}
                </span>
              </td>
              <td className="p-5 text-right space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  className="text-indigo-600 font-bold text-sm hover:underline disabled:hidden"
                  disabled={!product.isActive}
                >
                  Edit
                </button>
                <button
                  onClick={() =>
                    handleToggleStatus(product.id, product.isActive)
                  }
                  disabled={processingId === product.id}
                  className={`text-sm font-bold ${product.isActive ? "text-red-400" : "text-blue-600"}`}
                >
                  {processingId === product.id
                    ? "..."
                    : product.isActive
                      ? "Disable"
                      : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
