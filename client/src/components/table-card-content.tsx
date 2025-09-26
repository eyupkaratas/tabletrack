import { TableCardContentProps } from "@/types";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TableCardContent = ({ table, onClose }: TableCardContentProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-2xl relative">
        {/* kapatma butonu */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* masa başlığı */}
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Masa {table.number}</span>
            <span
              className={`px-2 py-1 rounded text-xs ${
                table.status === "active"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {table.status}
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Açılış:</p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {table.orders?.length ? (
              table.orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        Sipariş –{" "}
                        {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {order.orderStatus}
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
                      Toplam: {order.total}₺
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Bu masada hiç sipariş yok.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableCardContent;
