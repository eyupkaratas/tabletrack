import { TableCardContentProps } from "@/types";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TableCardContent = ({ table, onClose }: TableCardContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localTable, setLocalTable] = useState(table); // local state
  const pageSize = 3;

  const openOrders = localTable.orders.filter(
    (order) => order.orderStatus === "open"
  );

  const totalPages = Math.ceil(openOrders.length / pageSize);
  const paginatedOrders = openOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleStatusChange = async (orderItemId: string, newStatus: string) => {
    try {
      const res = await fetch(
        `http://localhost:3001/orders/order-items/${orderItemId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      const data = await res.json();
      console.log("Updated:", data);

      // local state güncelle
      setLocalTable((prev) => ({
        ...prev,
        orders: prev.orders.map((order) => ({
          ...order,
          items: order.items.map((item) =>
            item.id === orderItemId ? { ...item, status: newStatus } : item
          ),
        })),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "served":
        return "border border-green-500/30 bg-green-500/10 text-green-600";
      case "cancelled":
        return "border border-red-500/30 bg-red-500/10 text-red-600";
      default:
        return "border border-amber-500/30 bg-amber-500/10 text-amber-600";
    }
  };

  const getStatusDotClasses = (status: string) => {
    switch (status) {
      case "served":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-amber-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 sm:py-10">
      <Card className="relative w-full max-w-2xl overflow-hidden">
        {/* kapatma butonu */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-500/50"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* masa başlığı */}
        <CardHeader>
          <CardTitle className="flex flex-col gap-2 text-base sm:flex-row sm:items-center sm:justify-between">
            <span>Table-{localTable.number}</span>
            <span
              className={`px-2 py-1 pr-4 rounded text-xs ${
                localTable.status === "available"
                  ? "text-green-500"
                  : "text-yellow-500"
              }`}
            >
              {localTable.status.toUpperCase()}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="max-h-[60vh] overflow-y-auto pr-1 sm:max-h-[70vh] sm:pr-2">
          <div className="space-y-4">
            {paginatedOrders.length ? (
              paginatedOrders.map((order, index) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between sm:text-base">
                      <span className="font-semibold">
                        Order#
                        {(currentPage - 1) * pageSize + index + 1} –{" "}
                        {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-sm text-muted-foreground sm:text-base">
                        {order.waiterName} •{" "}
                        {order.orderStatus.charAt(0).toUpperCase() +
                          order.orderStatus.slice(1)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {order.items.map((item) => {
                        const isCancelled = item.status === "cancelled";

                        return (
                          <li
                            key={item.id}
                            className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3 text-sm shadow-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <span className="font-semibold">
                                {item.productName} - {item.quantity}
                              </span>
                              <span
                                className={`text-sm font-semibold sm:self-start sm:text-right ${
                                  isCancelled
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {(Number(item.unitPrice) * item.quantity).toFixed(2)} TL
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                                  item.status
                                )}`}
                              >
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${getStatusDotClasses(
                                    item.status
                                  )}`}
                                />
                                {item.status.charAt(0).toUpperCase() +
                                  item.status.slice(1)}
                              </span>
                              <div className="flex flex-wrap items-center gap-2">
                                {item.status !== "served" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusChange(item.id, "served")
                                    }
                                    className="flex items-center gap-2 border-green-500/40 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                  >
                                  <Check className="h-4 w-4" />
                                  <span>Served</span>
                                  </Button>
                                )}
                                {item.status !== "cancelled" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusChange(item.id, "cancelled")
                                    }
                                    className="flex items-center gap-2 border-red-500/40 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                                  >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="text-right mt-2 font-bold">
                      Total:{" "}
                      {order.items
                        .filter((item) => item.status !== "cancelled") // cancelled haric
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.unitPrice) * item.quantity,
                          0
                        )
                        .toFixed(2)} TL
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                There are no orders on this table
              </p>
            )}
          </div>

          {/* pagination kontrolleri */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TableCardContent;
