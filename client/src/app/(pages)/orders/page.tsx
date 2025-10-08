"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Can't get orders:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrderCreated = () => {
      fetchOrders();
    };

    window.addEventListener("orderCreated", handleOrderCreated);
    return () => {
      window.removeEventListener("orderCreated", handleOrderCreated);
    };
  }, [fetchOrders]);
  /* const handleOpenTable = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/orders/${id}/details`);
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error("Can't get table details:", err);
    }
  }; */
  return (
    <div className="space-y-4">
      {/* ✅ GRID yapısını koruyoruz */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <AnimatePresence>
          {orders
            .filter((order) => order.orderStatus === "open")
            .map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="w-full" // 🔹 grid layout'un bozulmaması için
              >
                <Card className="border-2 cursor-pointer border-gray-500 transition-transform duration-200 hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex justify-between text-sm sm:text-base">
                      <span>Order #{order.orderNumber}</span>
                      <span>Table-{order.tableNumber}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    Created At:{" "}
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrdersPage;
