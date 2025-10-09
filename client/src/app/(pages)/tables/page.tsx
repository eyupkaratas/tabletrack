"use client";
import TableCardContent from "@/components/table-card-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableWithOrders } from "@/types";
import { useCallback, useEffect, useState } from "react";

const TablesPage = () => {
  const [tables, setTables] = useState<TableWithOrders[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithOrders | null>(
    null
  );

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables`);
      const data = await res.json();
      setTables(data);
    } catch (error) {
      console.error("Can't get tables:", error);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrderCreated = () => {
      fetchTables();
    };

    window.addEventListener("orderCreated", handleOrderCreated);
    return () => {
      window.removeEventListener("orderCreated", handleOrderCreated);
    };
  }, [fetchTables]);

  const handleOpenTable = async (number: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tables/${number}/details`
      );
      const data = await res.json();
      setSelectedTable(data);
    } catch (err) {
      console.error("Can't get table details:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`border-2 cursor-pointer  ${
              table.status === "available"
                ? "border-green-500"
                : "border-yellow-500"
            }`}
            onClick={() => handleOpenTable(table.number)}
          >
            <CardHeader>
              <CardTitle>Table-{table.number}</CardTitle>
            </CardHeader>
            <CardContent>
              {table.status === "available"
                ? `Status: ${
                    table.status.charAt(0).toUpperCase() + table.status.slice(1)
                  }`
                : `Open orders: ${table.openOrdersCount}`}
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedTable && (
        <TableCardContent
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
};

export default TablesPage;
