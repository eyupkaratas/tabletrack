import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
/* 
export type Table = {
  id: string;
  number: number;
  status: string;
}; */

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
};
