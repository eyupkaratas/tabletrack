"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order, OrderItem, TableWithOrders, Tables } from "@/types";

type PaymentMethod = "cash" | "card";

type OrderWithDerivedTotal = Order & { derivedTotal: number };

const statusStyles: Record<string, string> = {
  open: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700",
  completed: "border-blue-500/40 bg-blue-500/10 text-blue-700",
  cancelled: "border-rose-500/40 bg-rose-500/10 text-rose-700",
};

const formatStatus = (status: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : status;

const formatCurrency = (value: number) => {
  const numberValue = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
  return `${formatted} \u20BA`;
};

const calculateOrderTotal = (items: OrderItem[]) =>
  items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + quantity * price;
  }, 0);

const deriveOrders = (orders: Order[] = []): OrderWithDerivedTotal[] =>
  orders.map((order) => ({
    ...order,
    derivedTotal: order.total
      ? Number(order.total)
      : calculateOrderTotal(order.items),
  }));

const isPayableStatus = (status: string) =>
  !["paid", "cancelled"].includes(status);

export default function CheckoutPage() {
  const [tables, setTables] = useState<Tables[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>("");
  const [tableDetails, setTableDetails] = useState<TableWithOrders | null>(
    null
  );
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancellingOrders, setIsCancellingOrders] = useState(false);

  const fetchTables = useCallback(async () => {
    setTablesLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tables");
      const data: Tables[] = await res.json();
      setTables(data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load tables.");
    } finally {
      setTablesLoading(false);
    }
  }, []);

  const fetchTableDetails = useCallback(async (tableNumber: number) => {
    setTableLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tables/${tableNumber}/details`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to load table details");
      const data: TableWithOrders = await res.json();
      setTableDetails(data);
      setSelectedOrderId(data.orders?.[0]?.id ?? null);
      setSelectedOrderIds([]);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load table details.");
      setTableDetails(null);
      setSelectedOrderId(null);
      setSelectedOrderIds([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (!selectedTableNumber) {
      setTableDetails(null);
      setSelectedOrderId(null);
      setSelectedOrderIds([]);
      return;
    }

    const number = Number(selectedTableNumber);
    if (Number.isNaN(number)) return;
    fetchTableDetails(number);
  }, [fetchTableDetails, selectedTableNumber]);

  const enrichedOrders = useMemo(
    () => deriveOrders(tableDetails?.orders ?? []),
    [tableDetails]
  );

  useEffect(() => {
    setSelectedOrderIds((prev) =>
      prev.filter((id) => enrichedOrders.some((order) => order.id === id))
    );

    if (
      selectedOrderId &&
      !enrichedOrders.some((order) => order.id === selectedOrderId)
    ) {
      setSelectedOrderId(enrichedOrders[0]?.id ?? null);
    }
  }, [enrichedOrders, selectedOrderId]);

  const selectedOrder = useMemo(
    () => enrichedOrders.find((order) => order.id === selectedOrderId) ?? null,
    [enrichedOrders, selectedOrderId]
  );

  const selectedOrders = useMemo(
    () =>
      enrichedOrders.filter((order) => selectedOrderIds.includes(order.id)),
    [enrichedOrders, selectedOrderIds]
  );

  const payableSelectedOrders = useMemo(
    () => selectedOrders.filter((order) => isPayableStatus(order.orderStatus)),
    [selectedOrders]
  );

  const tableTotal = useMemo(
    () => enrichedOrders.reduce((sum, order) => sum + order.derivedTotal, 0),
    [enrichedOrders]
  );

  const amountDue = useMemo(
    () =>
      payableSelectedOrders.reduce(
        (sum, order) => sum + order.derivedTotal,
        0
      ),
    [payableSelectedOrders]
  );

  const updateSelection = useCallback((orderId: string, next?: boolean) => {
    setSelectedOrderIds((prev) => {
      const alreadySelected = prev.includes(orderId);
      const shouldSelect =
        typeof next === "boolean" ? next : !alreadySelected;

      if (shouldSelect) {
        if (alreadySelected) return prev;
        return [...prev, orderId];
      }

      return prev.filter((id) => id !== orderId);
    });
  }, []);

  const handlePaymentConfirm = useCallback(async () => {
    if (!selectedTableNumber) {
      toast.info("Select a table first.");
      return;
    }

    if (!selectedOrders.length) {
      toast.info("Select at least one order.");
      return;
    }

    if (!paymentMethod) {
      toast.info("Please choose a payment method.");
      return;
    }

    const targets = payableSelectedOrders;
    if (!targets.length) {
      toast.info("Selected orders are already settled.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      await Promise.all(
        targets.map(async (order) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/status`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ status: "paid" }),
            }
          );
          if (!res.ok) {
            const message = await res.text();
            throw new Error(message || "Order could not be updated");
          }
        })
      );

      toast.success("Payment captured and selected orders marked as paid.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("orderCreated"));
      }
      await fetchTableDetails(Number(selectedTableNumber));
      setSelectedOrderIds([]);
    } catch (error) {
      console.error(error);
      toast.error("Could not complete payment.");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [
    fetchTableDetails,
    payableSelectedOrders,
    paymentMethod,
    selectedOrders,
    selectedTableNumber,
  ]);

  const handleCancelOrders = useCallback(async () => {
    if (!selectedTableNumber) {
      toast.info("Select a table first.");
      return;
    }

    if (!selectedOrders.length) {
      toast.info("Select at least one order.");
      return;
    }

    const targets = selectedOrders.filter(
      (order) => order.orderStatus !== "cancelled"
    );
    if (!targets.length) {
      toast.info("Selected orders are already cancelled.");
      return;
    }

    setIsCancellingOrders(true);
    try {
      await Promise.all(
        targets.map(async (order) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/status`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ status: "cancelled" }),
            }
          );
          if (!res.ok) {
            const message = await res.text();
            throw new Error(message || "Order could not be updated");
          }
        })
      );

      toast.success("Selected orders have been cancelled.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("orderCreated"));
      }
      await fetchTableDetails(Number(selectedTableNumber));
      setSelectedOrderIds((prev) =>
        prev.filter((id) => !targets.some((order) => order.id === id))
      );
    } catch (error) {
      console.error(error);
      toast.error("Could not cancel selected orders.");
    } finally {
      setIsCancellingOrders(false);
    }
  }, [fetchTableDetails, selectedOrders, selectedTableNumber]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="sm:w-1/2 space-y-2">
              <Label className="text-sm font-medium">Table Selection</Label>
              <Select
                value={selectedTableNumber || undefined}
                onValueChange={setSelectedTableNumber}
                disabled={tablesLoading}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Pick a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem
                      key={table.id}
                      value={String(table.number)}
                      className="cursor-pointer"
                    >
                      Table {table.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded border border-border/60 p-3 text-sm">
              <p className="text-muted-foreground">Table Total</p>
              <p className="text-lg font-semibold">
                {formatCurrency(tableTotal)}
              </p>
            </div>
          </div>
          {tablesLoading && (
            <p className="text-sm text-muted-foreground">Loading tables...</p>
          )}
        </CardContent>
      </Card>

      {selectedTableNumber && (
        <Card>
          <CardHeader>
            <CardTitle>Table {selectedTableNumber} Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tableLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading orders...
              </p>
            ) : !tableDetails || enrichedOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This table has no orders yet.
              </p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
                <div className="space-y-3">
                  <Label className="text-sm font-medium uppercase text-muted-foreground">
                    Orders
                  </Label>
                  <div className="space-y-3">
                    {enrichedOrders.map((order) => {
                      const isChecked = selectedOrderIds.includes(order.id);
                      const isActive = selectedOrderId === order.id;
                      const badgeStyle =
                        statusStyles[order.orderStatus] ??
                        "border border-border/60 bg-muted text-muted-foreground";

                      return (
                        <div
                          key={order.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedOrderId(order.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedOrderId(order.id);
                            }
                          }}
                          className={`w-full rounded border p-3 text-left transition cursor-pointer ${
                            isActive
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                onClick={(event) => event.stopPropagation()}
                                onKeyDown={(event) => {
                                  event.stopPropagation();
                                }}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(value) =>
                                    updateSelection(order.id, value === true)
                                  }
                                  aria-label={`Select order ${order.orderNumber}`}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">
                                  Order #{order.orderNumber}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleTimeString(
                                    "en-GB",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`capitalize ${badgeStyle}`}
                            >
                              {formatStatus(order.orderStatus)}
                            </Badge>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(order.derivedTotal)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium uppercase text-muted-foreground">
                      Order Details
                    </Label>
                    {selectedOrder ? (
                      <div className="rounded border border-border/60">
                        <div className="flex flex-col gap-2 border-b border-border/60 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold">
                              Order #{selectedOrder.orderNumber}
                            </p>
                            <Badge
                              variant="outline"
                              className={`capitalize ${
                                statusStyles[selectedOrder.orderStatus] ??
                                "border border-border/60 bg-muted text-muted-foreground"
                              }`}
                            >
                              {formatStatus(selectedOrder.orderStatus)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Opened at:{" "}
                            {new Date(
                              selectedOrder.createdAt
                            ).toLocaleString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Server: {selectedOrder.waiterName ?? "-"}
                          </div>
                        </div>
                        <div className="p-4">
                          {selectedOrder.items.length ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead className="text-center">
                                    Qty
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Unit Price
                                  </TableHead>
                                  <TableHead className="text-right">
                                    Line Total
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedOrder.items.map((item) => {
                                  const quantity = Number(item.quantity) || 0;
                                  const unit = Number(item.unitPrice) || 0;
                                  const lineTotal = quantity * unit;

                                  return (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">
                                        {item.productName}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {quantity}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatCurrency(unit)}
                                      </TableCell>
                                      <TableCell className="text-right font-medium">
                                        {formatCurrency(lineTotal)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              This order has no items yet.
                            </p>
                          )}
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between p-4 text-sm">
                          <span className="text-muted-foreground">
                            Order Total
                          </span>
                          <span className="text-base font-semibold">
                            {formatCurrency(selectedOrder.derivedTotal)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Select an order to view its details.
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 rounded border border-border/60 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Selected Orders
                      </span>
                      <span className="font-semibold">
                        {selectedOrders.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Eligible For Payment
                      </span>
                      <span className="font-semibold">
                        {payableSelectedOrders.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount Due</span>
                      <span className="text-base font-semibold">
                        {formatCurrency(amountDue)}
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Payment Method
                      </Label>
                      <Select
                        value={paymentMethod || undefined}
                        onValueChange={(value: PaymentMethod) =>
                          setPaymentMethod(value)
                        }
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Choose a payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash" className="cursor-pointer">
                            Cash
                          </SelectItem>
                          <SelectItem value="card" className="cursor-pointer">
                            Card
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        onClick={handlePaymentConfirm}
                        disabled={
                          isProcessingPayment || !payableSelectedOrders.length
                        }
                        className="w-full cursor-pointer"
                      >
                        {isProcessingPayment
                          ? "Processing Payment..."
                          : "Confirm Payment"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelOrders}
                        disabled={isCancellingOrders || !selectedOrders.length}
                        className="w-full cursor-pointer"
                      >
                        {isCancellingOrders ? "Cancelling..." : "Cancel Orders"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
