import type { TeamName } from "./types";
import { createServer } from "http";
import { Server } from "socket.io";
import { Socket as TSocket } from "socket.io";
import { TEAMS } from "./src/constants";
import cors from "cors";
import express from "express";
import Game from "./src/game";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

new Game({ dimension: 10 });

// Attach socket.io to http.Server instance
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5174", // SvelteKit dev server default port
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: TSocket) => {
  console.log("Client connected:", socket.id);

  Game.startGame();

  socket.emit("initial-state", {
    board: Game.state.board,
    dimension: Game.state.dimension,
  });

  socket.on("join-team", ({ teamName }: { teamName: TeamName }) => {
    if (!TEAMS.includes(teamName)) {
      throw new Error(`join-team(): ${teamName} is not a valid team`);
    }

    socket.join(teamName);
    io.emit("team-updated", {
      teamName,
      playerCount: io.sockets.adapter.rooms.get(teamName)?.size || 0,
    });
  });

  socket.on(
    "play-piece",
    ({
      x,
      y,
      teamName,
      playerId,
    }: {
      x: number;
      y: number;
      teamName: TeamName;
      playerId: string;
    }) => {
      if (!TEAMS.includes(teamName)) {
        throw new Error(`play-piece: ${teamName} is not a valid team`);
      }

      const { success, message } = Game.makeMove(x, y, teamName, playerId);
      if (!success) {
        socket.emit("invalid-move", { x, y, teamName, playerId });
        console.warn(message);
        return;
      }

      Game.update();
      io.emit("board-updated", Game.newState);
    }
  );

  socket.on("leave-team", ({ teamName }: { teamName: TeamName }) => {
    if (!TEAMS.includes(teamName)) {
      throw new Error(`leave-team(): ${teamName} is not a valid team`);
    }

    socket.leave(teamName);
    io.emit("team-updated", {
      teamName,
      playerCount: io.sockets.adapter.rooms.get(teamName)?.size || 0,
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
