import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { User } from "../../types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const deleteUser = async (userId: User["id"]) => {
  const res = await fetch(`http://localhost:3001/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete user: ${msg}`);
  }

  return await res.json();
};

export const userColumns = (
  onUserDeleted: () => void,
  currentUserId: string
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="lowercase">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <div className="lowercase">{row.getValue("role")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(user.id);
                toast.success("User ID copied to clipboard!");
              }}
            >
              Copy User ID
            </DropdownMenuItem>

            <DropdownMenuItem>Update User</DropdownMenuItem>

            {user.id !== currentUserId && (
              <AlertDialog>
                {" "}
                <AlertDialogTrigger>
                  {" "}
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    {" "}
                    Delete User{" "}
                  </DropdownMenuItem>{" "}
                </AlertDialogTrigger>{" "}
                <AlertDialogContent>
                  {" "}
                  <AlertDialogHeader>
                    {" "}
                    <AlertDialogTitle>
                      {" "}
                      Are you absolutely sure?{" "}
                    </AlertDialogTitle>{" "}
                    <AlertDialogDescription>
                      {" "}
                      This action cannot be undone. This will permanently delete
                      this user and remove that data from servers.{" "}
                    </AlertDialogDescription>{" "}
                  </AlertDialogHeader>{" "}
                  <AlertDialogFooter>
                    {" "}
                    <AlertDialogCancel>Cancel</AlertDialogCancel>{" "}
                    <Button
                      onClick={async () => {
                        try {
                          await deleteUser(user.id);
                          toast.success("User deleted successfully");
                          onUserDeleted();
                        } catch {
                          toast.error("Failed to delete user");
                        }
                      }}
                      variant="destructive"
                      className=""
                    >
                      {" "}
                      Delete User{" "}
                    </Button>{" "}
                  </AlertDialogFooter>{" "}
                </AlertDialogContent>{" "}
              </AlertDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
//TODO toast for Copy User Idr
