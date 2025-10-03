"use client";

import UsersTable from "@/components/admin-page-components/users-table";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const AdminPage = () => {
  const [content, setContent] = useState("users");

  const renderContent = () => {
    switch (content) {
      case "users":
        return <UsersTable />;
      case "products":
        return "Products ";
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
