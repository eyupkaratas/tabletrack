"use client";
import Link from "next/link";

import { useCallback, useEffect, useState } from "react";
import CreateOrderDialog from "./create-order-dialog";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [resTables, resProducts] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
          credentials: "include",
        }),
      ]);

      const [tablesData, productsData] = await Promise.all([
        resTables.json(),
        resProducts.json(),
      ]);

      setTables(tablesData);
      setProducts(productsData);
    } catch (error) {
      console.error("Navbar verileri alinmadi:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOrderSuccess = useCallback(async () => {
    await fetchData();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("orderCreated"));
    }
  }, [fetchData]);

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b bg-sidebar px-4 py-2.5 shadow-sm sm:flex-nowrap">
      <div className="flex w-full items-center justify-between sm:w-auto sm:flex-1 sm:justify-start">
        <SidebarTrigger />
        <Link
          href="/dashboard"
          className="text-lg font-semibold sm:hidden"
        >
          TableTrack
        </Link>
      </div>
      <div className="hidden w-full justify-center sm:flex sm:w-auto sm:flex-1">
        <Link href="/dashboard" className="text-lg font-semibold">
          TableTrack
        </Link>
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:flex-1 sm:flex-nowrap sm:justify-end">
        <span className="cursor-pointer">
          <ThemeToggle />
        </span>
        <CreateOrderDialog
          tables={tables}
          products={products}
          onSuccess={handleOrderSuccess}
        />
      </div>
    </nav>
  );
};

export default Navbar;
