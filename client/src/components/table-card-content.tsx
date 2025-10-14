import { Order, TableCardContentProps } from "@/types";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import OrderCardContent from "./order-card-content";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TableCardContent = ({ table, onClose }: TableCardContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const pageSize = 3;

  const relevantOrders = table.orders.filter(
    (order) =>
      order.orderStatus === "open" ||
      order.orderStatus === "completed" ||
      order.orderStatus === "cancelled"
  );

  const totalPages = Math.ceil(relevantOrders.length / pageSize);
  const paginatedOrders = relevantOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getOrderStatusInfo = (status: string) => {
    if (status === "open") {
      return {
        label: "open",
        classes: "border border-amber-500/50 bg-amber-500/10 text-amber-600",
      };
    }

    if (status === "completed") {
      return {
        label: "completed",
        classes:
          "border border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
      };
    }

    if (status === "cancelled") {
      return {
        label: "Order Cancelled",
        classes: "border border-rose-500/50 bg-rose-500/10 text-rose-600",
      };
    }

    return {
      label: status,
      classes: "border border-border/50 bg-muted/10 text-muted-foreground",
    };
  };

  const handleOpenOrder = useCallback(
    async (orderId: string) => {
      if (isLoadingOrder) return;

      setIsLoadingOrder(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          throw new Error("Failed to load order");
        }

        const data: Order = await res.json();
        setSelectedOrder(data);
      } catch (error) {
        console.error("Can't get order details:", error);
      } finally {
        setIsLoadingOrder(false);
      }
    },
    [isLoadingOrder]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 sm:py-10">
      <Card className="relative w-full max-w-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded p-1 hover:bg-gray-500/50"
        >
          <X className="h-5 w-5 text-red-500" />
        </button>

        <CardHeader>
          <CardTitle className="flex flex-col gap-2 text-base sm:flex-row sm:items-center sm:justify-between">
            <span>Table-{table.number}</span>
            <span
              className={`rounded px-2 py-1 pr-4 text-xs ${
                table.status === "available"
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {table.status.toUpperCase()}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="max-h-[60vh] overflow-y-auto pr-1 sm:max-h-[70vh] sm:pr-2">
          <div className="space-y-4">
            {paginatedOrders.length ? (
              paginatedOrders
                .slice() // show open orders first, then completed ones
                .sort((a, b) => {
                  const priority = (status: string) => {
                    if (status === "open") return 0;
                    if (status === "completed") return 1;
                    if (status === "cancelled") return 2;
                    return 3;
                  };

                  return priority(a.orderStatus) - priority(b.orderStatus);
                })
                .map((order, index) => {
                  const { label, classes } = getOrderStatusInfo(
                    order.orderStatus
                  );
                  const fallbackIndex =
                    (currentPage - 1) * pageSize + index + 1;
                  const displayNumber = String(
                    order.orderNumber ?? fallbackIndex
                  );

                  return (
                    <Card
                      key={order.id}
                      className="border border-border/50 cursor-pointer transition-transform hover:scale-[1.01]"
                      onClick={() => handleOpenOrder(order.id)}
                    >
                      <CardHeader className="py-3">
                        <CardTitle className="flex flex-col gap-2 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between sm:text-base">
                          <span>Order #{displayNumber}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
                          >
                            {label}
                          </span>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  );
                })
            ) : (
              <p className="text-sm text-muted-foreground">
                There are no orders on this table
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedOrder && (
        <OrderCardContent
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default TableCardContent;
