"use client";

import ProductsTable from "@/components/admin-page-components/products/products-table";
import UsersTable from "@/components/admin-page-components/users/users-table";

import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const AdminPage = () => {
  const [content, setContent] = useState("users");
  // sayfa ilk yüklendiğinde localStoragedan oku
  useEffect(() => {
    const savedContent = localStorage.getItem("adminContent");
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // content değiştiğinde localStoragea kaydet
  useEffect(() => {
    localStorage.setItem("adminContent", content);
  }, [content]);
  const renderContent = () => {
    switch (content) {
      case "users":
        return <UsersTable />;
      case "products":
        return <ProductsTable />;
      default:
        return <div>Select a section</div>;
    }
  };
  return (
    <div className="flex w-full flex-col gap-4 rounded-md border-2 p-4 md:flex-row md:gap-6">
      <div className="flex w-full flex-wrap items-center gap-2 rounded-md bg-sidebar p-2 md:w-56 md:flex-col md:items-stretch">
        <button
          onClick={() => setContent("users")}
          className={`w-full cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold transition hover:bg-sidebar-accent ${
            content === "users" ? "bg-sidebar-accent" : ""
          }`}
        >
          Users
        </button>
        <Separator className="hidden md:block" />
        <button
          onClick={() => setContent("products")}
          className={`w-full cursor-pointer rounded-md px-3 py-2 text-center text-sm font-semibold transition hover:bg-sidebar-accent ${
            content === "products" ? "bg-sidebar-accent" : ""
          }`}
        >
          Products
        </button>
        <Separator className="hidden md:block" />
      </div>
      <div className="flex-1 rounded-md border border-border/60 p-2 md:border-none md:p-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;
