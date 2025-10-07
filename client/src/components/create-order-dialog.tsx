"use client";

import { getDecodedUser } from "@/utils/decodeToken";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderFormData, Product, orderSchema } from "@/types";

type TableOption = {
  id: string;
  number: number;
};

type CreateOrderDialogProps = {
  tables: TableOption[];
  products: Product[];
  onSuccess?: () => void;
};

export default function CreateOrderDialog({
  tables,
  products,
  onSuccess,
}: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    { productId: string; name: string; quantity: number }[]
  >([]);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      tableId: "",
    },
  });

  const { handleSubmit, setValue, watch, reset, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    form.register("tableId");
  }, [form]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  const handleAddProduct = (product: Product) => {
    const exists = selectedItems.find((item) => item.productId === product.id);
    if (exists) {
      toast.info("Product already added");
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      { productId: product.id, name: product.name, quantity: 1 },
    ]);
    setSearchTerm("");
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const normalized = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: normalized } : item
      )
    );
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  const onSubmit = async (values: OrderFormData) => {
    const currentUser = await getDecodedUser();
    const openedByUserId = currentUser?.id;

    if (!values.tableId) {
      toast.error("Please select a table.");
      return;
    }

    if (!openedByUserId) {
      toast.error("Unable to identify the current user.");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Add at least one product to create an order.");
      return;
    }

    const body = {
      ...values,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      openedByUserId,
    };

    try {
      const res = await fetch("http://localhost:3001/orders/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create order");

      toast.success("Order created successfully");
      setOpen(false);
      reset({ tableId: "" });
      setSelectedItems([]);
      setSearchTerm("");
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order");
    }
  };

  const selectedTableId = watch("tableId");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-2">Table</Label>
            <Select
              value={selectedTableId || undefined}
              onValueChange={(value) =>
                setValue("tableId", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    Table {table.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tableId && (
              <p className="text-sm text-red-500">{errors.tableId.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-2">Search Product</Label>
            <Input
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <div className="mt-2 max-h-32 overflow-y-auto rounded border">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className="cursor-pointer px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {product.name} - {product.price}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 border-b pb-1"
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(
                          item.productId,
                          Number(event.target.value)
                        )
                      }
                      className="w-16 text-center"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="cursor-pointer"
                      onClick={() => handleRemoveProduct(item.productId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
