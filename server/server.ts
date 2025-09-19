import { createServer } from "http";
import { Server } from "socket.io";
import { Socket as TSocket } from "socket.io";
import cors from "cors";
import express from "express";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

type Team = "black" | "white";
const teams: Team[] = ["black", "white"];

// Attach socket.io to http.Server instance
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // SvelteKit dev server default port
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: TSocket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on("join-team", ({ team }: { team: Team }) => {
    if (!teams.includes(team)) return;

    socket.join(team);
    io.emit("team-updated", {
      team,
      playerCount: io.sockets.adapter.rooms.get(team)?.size || 0,
    });
  });

  socket.on("leave-team", ({ team }: { team: Team }) => {
    if (!teams.includes(team)) return;

    socket.leave(team);
    io.emit("team-updated", {
      team,
      playerCount: io.sockets.adapter.rooms.get(team)?.size || 0,
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
