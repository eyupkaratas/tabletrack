"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
import { ProductFormData, productSchema } from "@/types";
import { toast } from "sonner";

interface Props {
  onSuccess?: () => void;
}
export function CreateProductDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
    },
  });

  const onSubmit = async (values: ProductFormData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to create product");

      // success → dialog kapat
      setOpen(false);
      form.reset();
      onSuccess?.();
      toast.success("Product Created");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer" variant="outline">
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-2">Name</Label>
            <Input {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2">Category</Label>
            <Input {...form.register("category")} />
            {form.formState.errors.category && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-2">Price</Label>
            <Input {...form.register("price")} />
            {form.formState.errors.price && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
