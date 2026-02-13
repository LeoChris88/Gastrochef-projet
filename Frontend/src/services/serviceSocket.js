import { io } from "socket.io-client";

export const createServiceSocket = (token) =>
  io("http://localhost:5000", {
    auth: { token },
  });