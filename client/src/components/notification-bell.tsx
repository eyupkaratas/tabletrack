"use client";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);

export function NotificationBell() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/count/open`)
      .then((res) => res.json())
      .then((n) => setCount(n))
      .catch(() => {});
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("openCount", (n: number) => {
      console.log("openCount event:", n);
      setCount(n);
    });

    return () => {
      socket.off("openCount");
      socket.off("connect");
    };
  }, []);

  return (
    <div className="relative">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1  bg-red-500 text-white text-xs font-semibold rounded-full w-3.5 h-3.5 flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
  );
}
