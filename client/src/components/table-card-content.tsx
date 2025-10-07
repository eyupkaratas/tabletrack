import { TableCardContentProps } from "@/types";
import { Check, X } from "lucide-react";
import { useState } from "react";
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
                    <ul className="divide-y">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-col gap-2 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">
                              {item.productName}
                            </span>
                            -
                            <span className=" font-medium">
                              {item.quantity}
                            </span>
                            <span
                              className={`text-xs ${
                                item.status === "placed"
                                  ? "text-yellow-500"
                                  : item.status === "served"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {item.status.charAt(0).toUpperCase() +
                                item.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            {/* Status update button */}
                            {item.status !== "served" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "served")
                                }
                                className="flex items-center gap-1 rounded bg-green-500 px-2 py-1 text-xs text-white transition-transform duration-200 hover:scale-105 hover:bg-green-500/60"
                              >
                                <Check className="h-4 w-4" />
                                <span className="hidden sm:inline">Serve</span>
                              </button>
                            )}
                            {/* Status update button */}
                            {item.status !== "cancelled" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(item.id, "cancelled")
                                }
                                className="flex items-center gap-1 rounded bg-red-500 px-2 py-1 text-xs text-white transition-transform duration-200 hover:scale-105 hover:bg-red-500/60"
                              >
                                <X className="h-4 w-4" />
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            )}
                          </div>

                          {/* Item price */}
                          <span
                            className={`sm:self-end sm:text-right ${
                              item.status === "cancelled"
                                ? "line-through text-gray-400"
                                : ""
                            }`.trim()}
                          >
                            {(Number(item.unitPrice) * item.quantity).toFixed(
                              2
                            )}
                            ₺
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-right mt-2 font-bold">
                      Total:{" "}
                      {order.items
                        .filter((item) => item.status !== "cancelled") // cancelled hariç
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.unitPrice) * item.quantity,
                          0
                        )
                        .toFixed(2)}
                      ₺
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
