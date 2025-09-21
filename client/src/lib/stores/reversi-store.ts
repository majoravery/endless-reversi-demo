import { DumbReversi, getOpponentTeamName } from "$lib/dumb-reversi";
import { emit } from "$lib/socket";
import { writable } from "svelte/store";

interface ReversiState {
  board: Board | null;
  dimension: number | null;
  playerCount: Record<TeamName, number>;
}

const initialState: ReversiState = {
  board: null,
  dimension: null,
  playerCount: {
    black: 0,
    white: 0,
  },
};

function createReversiStore() {
  const { subscribe, update } = writable(initialState);
  const dumbReversi = new DumbReversi();

  return {
    subscribe,

    setState: (serverState: ServerState) => {
      update((state) => {
        const newState = { ...state, ...serverState };

        // For initial states
        if (serverState.board) {
          // The Int8Array type did not get propagated (what is the right way to describe this だろう)
          // so we need to manually cast it
          const board = serverState.board.map(
            (row: Int8Array) => new Int8Array(row)
          );
          // Store it in memory
          dumbReversi.loadBoard(board);
          newState.board = board;
        }

        return newState;
      });
    },

    updatePlayerCount: (teamName: TeamName, playerCount: number) => {
      update((state) => {
        return {
          ...state,
          playerCount: { ...state.playerCount, [teamName]: playerCount },
        };
      });
    },

    // client -> server
    playPiece: (x: number, y: number, teamName: TeamName | null) => {
      if (!x || !y) {
        console.warn(`Invalid coordinates x: ${x}, y: ${y}`);
        return;
      }
      if (!teamName) {
        console.warn("Cannot play piece because team is null");
        return;
      }

      const success = dumbReversi.addPiece(x, y, teamName);
      if (!success) {
        console.warn(`Failed to play piece at (${x}, ${y}) for ${teamName}`);
        return;
      }

      emit("play-piece", { x, y, teamName, playerId: globalThis.socketId });
      const board = dumbReversi.board;

      update((state) => {
        return { ...state, board };
      });
    },

    // server -> client
    // Keep in mind that the server emits this event after it switches turns
    updateBoard: (serverState: ServerState) => {
      const { currentTeamName, lastMove, toFlip, ...rest } = serverState;

      const { x, y, playerId } = lastMove;
      const previousTeam = getOpponentTeamName(currentTeamName);

      // Updates for everyone else apart from original player
      if (playerId !== globalThis.socketId) {
        const success = dumbReversi.addPiece(x, y, previousTeam);
        if (!success) {
          console.warn(
            `Failed to add piece at (${x}, ${y}) for ${previousTeam}`
          );
          return;
        }
      }

      // currentTeam is the team that played the piece
      const success = dumbReversi.renderFlips(previousTeam, toFlip);
      if (!success) {
        console.warn(`Failed to render flips for ${previousTeam}`);
        return;
      }

      const board = dumbReversi.board;

      update((state) => {
        return { ...state, board, ...rest };
      });
    },

    // server -> client
    reverseMove: (serverState: ServerState) => {
      const { x, y, team } = serverState;
      if (!x || !y) {
        console.warn(`Invalid coordinates x: ${x}, y: ${y}`);
        return;
      }
      if (!team) {
        console.warn("Cannot reverse piece because team is null");
        return;
      }

      const success = dumbReversi.reverseMove(x, y, team);
      if (!success) {
        console.warn(`Failed to reverse piece at (${x}, ${y}) for ${team}`);
        return;
      }

      const board = dumbReversi.board;

      update((state) => {
        return { ...state, board };
      });
    },
  };
}

export const reversiStore = createReversiStore();
