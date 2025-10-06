import { Product } from "@/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../data-table";
import { CreateProductDialog } from "./create-product-dialog";
import { productColumns } from "./product-columns";

const ProductsTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3001/products", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center">Loading products...</div>;

  const handleStatusChange = async (id: string, value: boolean) => {
    //  UI'ı anında güncelle
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: value } : p))
    );

    try {
      const res = await fetch(`http://localhost:3001/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: value }),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      toast.error("Error updating status");
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !value } : p))
      );
    }
  };
  return (
    <div className="">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Products</h2>
          <CreateProductDialog onSuccess={fetchProducts} />
        </div>

        {/* DataTable */}
        <DataTable
          columns={productColumns(fetchProducts, handleStatusChange)}
          data={products}
          tableName={"Products"}
        />
      </div>
    </div>
  );
};

export default ProductsTable;
