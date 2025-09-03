import { io } from "socket.io-client";

let socket;

export const initSocket = (backendurl, query) => {
  if (socket) {
    socket.disconnect();  // cleanup old connection
  }
  socket = io(backendurl, { query });
  return socket;
};

export const getSocket = () => socket;
