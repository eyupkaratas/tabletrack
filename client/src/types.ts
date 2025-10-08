import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "waiter"]),
});

export type UserFormData = z.infer<typeof userSchema>;

export type TableWithOrders = {
  openOrdersCount: any;
  id: string;
  number: number;
  status: string;
  createdAt: string;
  orders: Order[];
};

export type TableCardContentProps = {
  table: TableWithOrders;
  onClose: () => void;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  status: string;
};

export type Order = {
  id: string;
  orderStatus: string;
  waiterName: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
  orderNumber: string;
  tableId: string;
  tableNumber: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
};

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  price: z.string().nonempty("Price is required"),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const orderSchema = z.object({
  tableId: z.string().min(1, "Please select a table."),
});

export type OrderFormData = z.infer<typeof orderSchema>;
