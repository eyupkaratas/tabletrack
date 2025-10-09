import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Product } from "../../../types";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
const deleteUser = async (productId: Product["id"]) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to delete user: ${msg}`);
  }

  return await res.json();
};
export const productColumns = (
  onProductDeleted: () => void,
  onStatusChange: (id: string, value: boolean) => void
): ColumnDef<Product>[] => [
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
    header: ({ column }) => (
      <Button
        className=" cursor-pointer text-left"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize pl-2">{row.getValue("name")}</div>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId) as string;
      const b = rowB.getValue(columnId) as string;
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
    ), //TODO dropdown menu for each category (map)
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("price")}₺</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Availability",
    cell: ({ row }) => (
      <span className="pl-7">
        <Checkbox
          checked={row.getValue("isActive")}
          onCheckedChange={(value) =>
            onStatusChange(row.original.id, value as boolean)
          }
        />
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {" "}
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(product.id);
                toast.success("Product ID copied to clipboard!");
              }}
            >
              Copy Product ID
            </DropdownMenuItem>
            <DropdownMenuItem>Update Product</DropdownMenuItem>
            <AlertDialog>
              {" "}
              <AlertDialogTrigger>
                {" "}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  {" "}
                  Delete Product{" "}
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
                    this product and remove that data from servers.{" "}
                  </AlertDialogDescription>{" "}
                </AlertDialogHeader>{" "}
                <AlertDialogFooter>
                  {" "}
                  <AlertDialogCancel>Cancel</AlertDialogCancel>{" "}
                  <Button
                    onClick={async () => {
                      try {
                        await deleteUser(product.id);
                        toast.success("User deleted successfully");
                        onProductDeleted();
                      } catch {
                        toast.error("Failed to delete user");
                      }
                    }}
                    variant="destructive"
                    className=""
                  >
                    {" "}
                    Delete Product{" "}
                  </Button>{" "}
                </AlertDialogFooter>{" "}
              </AlertDialogContent>{" "}
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
//TODO toast for Copy User Idr
