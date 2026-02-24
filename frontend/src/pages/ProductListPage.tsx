// frontend/src/components/ProductList.tsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // ✨ นำเข้ามา
import { ProductCard } from "../components/ui/ProductCard";
import { FilterSidebar } from "../components/ui/FilterSidebar";
import { Pagination } from "../components/ui/PaginationProps";
import { useProductStore } from "../store/useProductStore";
import { useCategoryStore } from "../store/useCategoryStore";

export const ProductList = () => {
  const { products, loading, error, fetchProducts, totalPages } =
    useProductStore();
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategoryStore();

  // ✨ เปลี่ยนจาก useState เป็น useSearchParams
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const currentPage = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  // ฟังก์ชันจัดการเวลาเปลี่ยนหมวดหมู่ (Update URL แทน Update State)

  const handleCategoryChange = (id: string | null) => {
    if (id) {
      setSearchParams({ category: id, page: "1" }); // เมื่อเปลี่ยนหมวดหมู่ให้กลับไปหน้า 1
    } else {
      setSearchParams({}); // ล้าง Filter ทั้งหมด
    }
  };

  // ฟังก์ชันจัดการเปลี่ยนหน้า
  const handlePageChange = (page: number) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, page: page.toString() });
  };

  useEffect(() => {
    // ✨ ดึงข้อมูลตามค่าที่ได้จาก URL จริงๆ
    fetchProducts(selectedCategory, currentPage, search);
    fetchCategories();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts, fetchCategories, selectedCategory, currentPage, search]); // เมื่อ URL เปลี่ยน useEffect จะทำงานทันที

  if (loading || categoriesLoading)
    return (
      <div className="bg-white min-h-screen animate-pulse">
        {/* Header Skeleton */}
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-6 border-b border-gray-100 flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-gray-200"></div>
            <div className="h-3 w-32 bg-gray-100"></div>
          </div>
          <div className="h-4 w-24 bg-gray-100 mb-1"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 p-6">
          {/* Sidebar Skeleton */}
          <aside className="hidden md:block w-1/5 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-100"></div>
            ))}
          </aside>

          {/* Grid Skeleton */}
          <main className="w-full md:w-4/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  {/* สัดส่วน 4/5 ตามหน้า Product Detail ของคุณ */}
                  <div className="aspect-4/5 bg-gray-100 rounded-sm"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 bg-gray-200"></div>
                    <div className="h-3 w-1/4 bg-gray-100"></div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-20 text-red-500 uppercase text-xs tracking-widest">
        {error}
      </div>
    );

  return (
    <div className="bg-white min-h-screen text-black">
      {/* ส่วนอื่นๆ เหมือนเดิม */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6 border-b border-black flex justify-between items-end">
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          {selectedCategory
            ? categories.find((c) => c.id === selectedCategory)?.name ||
              "Category"
            : "Shop All"}
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest pb-1">
          Showing {products?.length} results
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 p-6">
        <aside className="w-full md:w-1/5 border-r border-gray-100 pr-8">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </aside>

        <main className="w-full md:w-4/5">
          {products?.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-gray-200 uppercase text-xs tracking-[0.2em] text-gray-400">
              No items found in this collection.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {products
                  .filter((product) => product.isActive === true)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-20 border-t border-gray-100 pt-10 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
