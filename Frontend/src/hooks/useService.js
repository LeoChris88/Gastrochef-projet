import { useState } from "react";
import { createServiceSocket } from "../services/serviceSocket";
import { resetRecipes } from "../services/recipeService";

export const useService = (token) => {
  const [orders, setOrders] = useState([]);
  const [satisfaction, setSatisfaction] = useState(20);
  const [serviceStarted, setServiceStarted] = useState(false);
  const [socket, setSocket] = useState(null);

  const startService = async () => {
    await resetRecipes(token);

    const newSocket = createServiceSocket(token);
    setSocket(newSocket);
    setServiceStarted(true);
    setSatisfaction(20);
    setOrders([]);

    newSocket.on("authenticated", (data) => {
      setSatisfaction(data.satisfaction);
    });

    newSocket.on("new-order", (order) => {
      setOrders((prev) => [...prev, { ...order, progress: 100 }]);
    });

    newSocket.on("order-result", ({ orderId, satisfaction }) => {
      setOrders((prev) =>
        prev.filter((o) => o.orderId !== orderId)
      );
      setSatisfaction(satisfaction);
    });

    newSocket.emit("start-service");
  };

  const serveOrder = (orderId) => {
    socket?.emit("process-order", {
      orderId,
      action: "serve",
    });
  };

  const stopService = () => {
    socket?.disconnect();
    setServiceStarted(false);
    setOrders([]);
  };

  return {
    orders,
    satisfaction,
    serviceStarted,
    startService,
    serveOrder,
    stopService,
    setOrders,
  };
};