"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, XAxis } from "recharts";

type RangeOption = "hourly" | "daily" | "weekly" | "monthly";
type ChartRow = {
  date: string;
  [user: string]: number | string;
};

const RANGE_TITLES: Record<RangeOption, string> = {
  hourly: "Hourly Orders",
  daily: "Daily Orders",
  weekly: "Weekly Orders",
  monthly: "Monthly Orders",
};

const formatXAxisValue = (value: string, range: RangeOption) => {
  try {
    switch (range) {
      case "hourly":
        return value;
      case "daily": {
        const parsed = parse(value, "yyyy-MM-dd", new Date());
        return isValid(parsed) ? format(parsed, "dd/MM") : value;
      }
      case "weekly": {
        const [year, week] = value.split("-");
        return week ? `Week ${week} ${year}` : value;
      }
      case "monthly": {
        const parsed = parse(value, "yyyy-MM", new Date());
        return isValid(parsed) ? format(parsed, "MMM yyyy") : value;
      }
      default:
        return value;
    }
  } catch {
    return value;
  }
};

const getLineColor = (index: number) =>
  `hsl(${(index * 53) % 360}, 70%, 50%)`;

const buildHourlyData = (rows: ChartRow[], users: string[]): ChartRow[] => {
  const rowMap = new Map(rows.map((row) => [row.date, row]));

  return Array.from({ length: 24 }, (_, hour) => {
    const label = `${hour.toString().padStart(2, "0")}:00`;
    const existing = rowMap.get(label);
    const values = users.reduce<Record<string, number>>((acc, user) => {
      acc[user] = Number(existing?.[user] ?? 0);
      return acc;
    }, {});

    return {
      date: label,
      ...values,
    } satisfies ChartRow;
  });
};

const normalizeRows = (rows: ChartRow[], users: string[]): ChartRow[] => {
  return rows.map((row) => {
    const values = users.reduce<Record<string, number>>((acc, user) => {
      acc[user] = Number(row[user] ?? 0);
      return acc;
    }, {});

    return {
      date: row.date,
      ...values,
    } satisfies ChartRow;
  });
};

export default function WaiterOrdersChart() {
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [range, setRange] = useState<RangeOption>("hourly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const chartConfig = useMemo(() => {
    return users.reduce((config, user, index) => {
      config[user] = {
        label: user,
        color: getLineColor(index),
      };
      return config;
    }, {} as ChartConfig);
  }, [users]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const params = new URLSearchParams({ range });

      if (range === "hourly" && selectedDate) {
        params.append("date", format(selectedDate, "yyyy-MM-dd"));
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/stats?${params.toString()}`,
          { signal: controller.signal, credentials: "include" }
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const rawData: ChartRow[] = await response.json();

        const userSet = new Set<string>();
        rawData.forEach((row) => {
          Object.keys(row)
            .filter((key) => key !== "date" && key.length > 0)
            .forEach((key) => userSet.add(key));
        });

        const userList = Array.from(userSet);
        const normalizedData =
          range === "hourly"
            ? buildHourlyData(rawData, userList)
            : normalizeRows(rawData, userList);

        setUsers(userList);
        setChartData(normalizedData);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Failed to fetch waiter order stats", error);
        setUsers([]);
        setChartData([]);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [range, selectedDate]);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <CardTitle>
            {range === "hourly"
              ? `Orders for ${format(selectedDate, "PPP")}`
              : RANGE_TITLES[range]}
          </CardTitle>
        </div>

        <div className="flex gap-2 items-center">
          {range === "hourly" && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date || new Date());
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          )}

          <Select value={range} onValueChange={(val) => setRange(val as RangeOption)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                formatXAxisValue(String(value), range)
              }
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Legend />
            {users.map((user, index) => (
              <Line
                key={user}
                dataKey={user}
                type="monotone"
                stroke={getLineColor(index)}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
