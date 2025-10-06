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
    <div className="flex w-full h-[900px] border-2 rounded-md  ">
      {/* Sidebar */}
      <div className="w-[200px]  bg-sidebar flex flex-col">
        <button
          onClick={() => setContent("users")}
          className=" w-full text-center cursor-pointer p-2"
        >
          Users
        </button>
        <Separator />
        <button
          onClick={() => setContent("products")}
          className="w-full text-center cursor-pointer p-2"
        >
          Products
        </button>
        <Separator />
      </div>

      {/* Content */}
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
};

export default AdminPage;
