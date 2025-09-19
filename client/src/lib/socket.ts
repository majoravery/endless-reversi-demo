import { io, type Socket } from "socket.io-client";
import { browser } from "$app/environment";

let socket: Socket;

export function initSocket() {
  if (browser) {
    socket = io("http://localhost:3000", {
      autoConnect: false,
    }); // put this in env

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }

  return socket;
}

export function emit(event: string, data: any) {
  if (socket && socket.connected) {
    socket.emit(event, data);
  }
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
  }
}
