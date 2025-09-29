import { TableCardContentProps } from "@/types";
import { X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TableCardContent = ({ table, onClose }: TableCardContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const openOrders = table.orders.filter(
    (order) => order.orderStatus === "open"
  );

  const totalPages = Math.ceil(openOrders.length / pageSize);
  const paginatedOrders = openOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-2xl relative">
        {/* kapatma butonu */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-500/50"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* masa başlığı */}
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Table-{table.number}</span>
            <span
              className={`px-2 py-1 pr-4 rounded text-xs ${
                table.status === "available"
                  ? " text-green-500"
                  : " text-yellow-500"
              }`}
            >
              {table.status.toUpperCase()}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {paginatedOrders.length ? (
              paginatedOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        Order –{" "}
                        {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {order.waiterName} •{" "}
                        {order.orderStatus.charAt(0).toUpperCase() +
                          order.orderStatus.slice(1)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y">
                      {order.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between py-2 text-sm"
                        >
                          <span>
                            {item.productName} × {item.quantity}
                          </span>
                          <span>
                            {(Number(item.unitPrice) * item.quantity).toFixed(
                              2
                            )}
                            ₺
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-right mt-2 font-bold">
                      Total: {order.total}₺
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
