import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3333";

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL);
  }
  return socket;
}
