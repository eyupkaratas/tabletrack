"use client";
import TableCardContent from "@/components/table-card-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableWithOrders } from "@/types";
import { useEffect, useState } from "react";

const TablesPage = () => {
  const [tables, setTables] = useState<TableWithOrders[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableWithOrders | null>(
    null
  );

  useEffect(() => {
    fetch("http://localhost:3001/tables")
      .then((res) => res.json())
      .then((data) => setTables(data))
      .catch((err) => console.error(err));
  }, []);

  const handleOpenTable = async (number: number) => {
    try {
      const res = await fetch(`http://localhost:3001/tables/${number}/details`);
      const data = await res.json();
      setSelectedTable(data);
    } catch (err) {
      console.error("Masa detayları alınamadı:", err);
    }
  };
  return (
    <div className="">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p>Status: {table.status}</p>
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
