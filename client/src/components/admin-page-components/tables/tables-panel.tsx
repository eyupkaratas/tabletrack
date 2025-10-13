import { Badge } from "@/components/ui/badge";
import { Tables } from "@/types";
import { useCallback, useEffect, useState } from "react";
import AddTableButton from "./add-table-button";
import RemoveTableButton from "./remove-table-button";

const TablesPanel = () => {
  const [tables, setTables] = useState<Tables[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables`);
      const data = await res.json();
      setTables(data);
    } catch (error) {
      console.error("Can't get tables:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  if (loading) return <div className="text-center">Loading tables...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tables</h2>
        <span className="flex gap-2">
          <RemoveTableButton onDeleted={fetchTables} />
          <AddTableButton onAdded={fetchTables} />
        </span>
      </div>

      <div className="w-full grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 border-2 overflow-hidden">
        {tables.map((table) => (
          <div
            key={table.id}
            className="w-20 h-16 border-2 rounded-md text-center cursor-default mx-2 my-1"
          >
            Table {table.number}
            <Badge
              className={
                table.status === "available" ? "bg-green-500" : "bg-orange-500"
              }
            >
              {table.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablesPanel;
