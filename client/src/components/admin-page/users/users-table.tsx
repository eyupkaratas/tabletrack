"use client";

import { User } from "@/types";
import { getDecodedUser } from "@/utils/decodeToken";
import { useEffect, useState } from "react";
import { DataTable } from "../data-table";
import { CreateUserDialog } from "./create-user-dialog";
import { userColumns } from "./user-columns";

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    (async () => {
      const user = await getDecodedUser();
      if (user) setCurrentUserId(user.id);
    })();
  }, []);
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center">Loading users...</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Users</h2>
        <CreateUserDialog onSuccess={fetchUsers} />
      </div>

      {/* DataTable */}
      <DataTable
        columns={userColumns(fetchUsers, currentUserId)}
        data={users}
        tableName={"Users"}
      />
    </div>
  );
}
