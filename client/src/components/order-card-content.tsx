import { OrderCardContentProps } from "@/types";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type OrderItemStatus = "placed" | "served" | "cancelled";

const statusClasses: Record<OrderItemStatus, string> = {
  placed:
    "border border-amber-500/50 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
  served:
    "border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
  cancelled:
    "border border-rose-500/50 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20",
};

const statusOptions: OrderItemStatus[] = ["placed", "served", "cancelled"];

const ensureStatus = (status: string): OrderItemStatus =>
  statusOptions.includes(status as OrderItemStatus)
    ? (status as OrderItemStatus)
    : "placed";

const formatStatusLabel = (status: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : status;

const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const output =
    typeof value === "string" && value.trim().length > 0
      ? value
      : typeof value === "number" && Number.isFinite(value)
      ? value.toString()
      : "";

  if (!output) {
    return "-";
  }

  return `${output}\u20BA`;
};

const OrderCardContent = ({ order, onClose }: OrderCardContentProps) => {
  const [items, setItems] = useState(order.items);
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    setItems(order.items);
  }, [order.items]);

  useEffect(() => {
    setCurrentStatus(order.orderStatus);
  }, [order.orderStatus]);

  const hasPendingItems = useMemo(
    () => items.some((item) => ensureStatus(item.status) === "placed"),
    [items]
  );

  const derivedTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const status = ensureStatus(item.status);
      if (status === "cancelled") {
        return sum;
      }

      const unit =
        typeof item.unitPrice === "string"
          ? parseFloat(item.unitPrice)
          : Number(item.unitPrice);
      if (!Number.isFinite(unit)) {
        return sum;
      }
      return sum + unit * item.quantity;
    }, 0);
  }, [items]);

  const handleStatusChange = useCallback(
    async (itemId: string, status: "placed" | "served" | "cancelled") => {
      setUpdatingItemId(itemId);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/order-items/${itemId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ status }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to update status");
        }

        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, status } : item))
        );
        toast.success("Order item status updated");
      } catch (error) {
        console.error("Can't update order item status:", error);
        toast.error("Unable to update item status");
      } finally {
        setUpdatingItemId(null);
      }
    },
    []
  );

  const handleCompleteOrder = useCallback(async () => {
    if (currentStatus === "completed") {
      return;
    }

    if (hasPendingItems) {
      toast.warning("Some items are still marked as placed. Serve them first.");
      return;
    }

    setIsCompleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: "completed" }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message ?? "Unable to complete order");
      }

      setCurrentStatus("completed");
      toast.success("Order completed");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("orderCreated"));
      }
    } catch (error) {
      console.error("Can't complete order:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to complete order"
      );
    } finally {
      setIsCompleting(false);
    }
  }, [currentStatus, hasPendingItems, order.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 sm:py-10"
      onClick={onClose}
    >
      <Card
        className="relative w-full max-w-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 rounded p-1 cursor-pointer"
        >
          <X className="h-5 w-5 text-red-500" />
        </button>

        <CardHeader>
          <CardTitle className="flex flex-col gap-2 text-base sm:flex-row sm:items-center sm:justify-between">
            <span>Order-{order.orderNumber}</span>
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
              <span
                className={`rounded px-2 py-1 pr-4 text-xs ${
                  currentStatus === "open"
                    ? "text-green-500"
                    : currentStatus === "completed"
                    ? "text-emerald-500"
                    : "text-yellow-500"
                }`}
              >
                {currentStatus.toUpperCase()}
              </span>

              {currentStatus !== "completed" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer mr-5"
                  onClick={handleCompleteOrder}
                  disabled={isCompleting}
                >
                  {isCompleting ? "Completing..." : "Complete Order"}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="max-h-[60vh] overflow-y-auto pr-1 sm:max-h-[70vh] sm:pr-2">
          <div className="space-y-6 text-sm">
            <div className="grid gap-2 rounded border border-border/50 bg-muted/30 p-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Table
                </span>
                <span className="font-semibold">Table-{order.tableNumber}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Waiter
                </span>
                <span className="font-semibold">{order.waiterName}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Created At
                </span>
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Order Total
                </span>
                <span className="font-semibold">
                  {formatCurrency(derivedTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Order Items</h3>
                <span className="text-xs text-muted-foreground">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {items.length ? (
                <div className="rounded border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const resolvedStatus = ensureStatus(item.status);
                        const isCancelled = resolvedStatus === "cancelled";

                        return (
                          <TableRow key={item.id}>
                            <TableCell
                              className={`font-medium ${
                                isCancelled
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.productName}
                            </TableCell>
                            <TableCell
                              className={`text-center ${
                                isCancelled
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.quantity}
                            </TableCell>
                            <TableCell
                              className={`text-right ${
                                isCancelled
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    asChild
                                    className={`cursor-pointer px-3 py-1 text-xs font-semibold ${statusClasses[resolvedStatus]}`}
                                  >
                                    <button
                                      type="button"
                                      className="capitalize outline-none"
                                      disabled={updatingItemId === item.id}
                                    >
                                      {formatStatusLabel(resolvedStatus)}
                                    </button>
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-40"
                                >
                                  {statusOptions.map((option) => (
                                    <DropdownMenuItem
                                      key={option}
                                      disabled={
                                        updatingItemId === item.id ||
                                        option === resolvedStatus
                                      }
                                      onClick={() =>
                                        handleStatusChange(item.id, option)
                                      }
                                      className="capitalize"
                                    >
                                      {formatStatusLabel(option)}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  This order does not have any items yet.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderCardContent;
