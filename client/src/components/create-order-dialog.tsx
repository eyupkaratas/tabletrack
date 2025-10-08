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
    { productId: string; name: string; quantity: string }[]
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

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products
      .filter((product) =>
        product.name.toLowerCase().includes(query)
      )
      .sort((a, b) => Number(b.isActive) - Number(a.isActive));
  }, [products, searchTerm]);

  const handleAddProduct = (product: Product) => {
    if (!product.isActive) {
      toast.info("This product is unavailable.");
      return;
    }

    const exists = selectedItems.find((item) => item.productId === product.id);
    if (exists) {
      toast.info("Product already added");
      return;
    }

    setSelectedItems((prev) => [
      ...prev,
      { productId: product.id, name: product.name, quantity: "1" },
    ]);
    setSearchTerm("");
  };

  const handleQuantityChange = (productId: string, value: string) => {
    if (!/^\d*$/.test(value)) return;

    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: value } : item
      )
    );
  };

  const normalizeQuantity = (productId: string) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const parsed = Number(item.quantity);
        if (!item.quantity || Number.isNaN(parsed) || parsed < 1) {
          return { ...item, quantity: "1" };
        }

        return { ...item, quantity: String(parsed) };
      })
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
        quantity: Math.max(1, Number(item.quantity) || 1),
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
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:max-w-lg">
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
                    role="button"
                    aria-disabled={!product.isActive}
                    onClick={() => handleAddProduct(product)}
                    className={`flex items-center justify-between gap-2 px-2 py-1 text-sm ${
                      product.isActive
                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        : "cursor-not-allowed text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex-1 ${
                        product.isActive ? "" : "line-through"
                      }`}
                    >
                      {product.name}
                    </span>
                    <span
                      className={`text-xs ${
                        product.isActive ? "" : "line-through"
                      }`}
                    >
                      {product.price}
                    </span>
                    {!product.isActive && (
                      <span className="text-xs font-medium text-red-500">
                        Unavailable
                      </span>
                    )}
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
                  className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium">{item.name}</span>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={item.quantity}
                      onChange={(event) =>
                        handleQuantityChange(
                          item.productId,
                          event.target.value
                        )
                      }
                      onBlur={() => normalizeQuantity(item.productId)}
                      className="w-full max-w-[120px] text-center sm:w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full cursor-pointer sm:w-auto"
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
