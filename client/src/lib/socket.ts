import { io, type Socket } from "socket.io-client";
import { browser } from "$app/environment";
import { reversiStore } from "./stores/reversi-store";
import type { ServerState } from "../types";

let socket: Socket;

export function initSocket() {
  if (browser) {
    socket = io("http://localhost:3001", {
      autoConnect: false,
    }); // put this in env

    socket.on("connect", () => {
      console.log("Connected to server");

      // Temporary method of identifying player
      if (socket.id) {
        globalThis.socketId = socket.id;
      }
    });

    socket.on("invalid-move", (data: ServerState) => {
      reversiStore.reverseMove(data);
    });

    socket.on("board-updated", (data: ServerState) => {
      reversiStore.updateBoard(data);
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
