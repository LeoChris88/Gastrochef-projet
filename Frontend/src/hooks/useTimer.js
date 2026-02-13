import { useEffect } from "react";

export const useTimer = (serviceStarted, setOrders) => {
  useEffect(() => {
    if (!serviceStarted) return;

    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((order) => {
          const now = Date.now();
          const total = order.timeLimit * 1000;
          const remaining =
            new Date(order.expiresAt).getTime() - now;

          const percentage = Math.max((remaining / total) * 100, 0);

          return { ...order, progress: percentage };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [serviceStarted]);
};