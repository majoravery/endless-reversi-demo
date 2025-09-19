import { writable } from "svelte/store";

interface ReversiState {
  playerCount: Record<Team, number>;
}

const initialState: ReversiState = {
  playerCount: {
    black: 0,
    white: 0,
  },
};

function createReversiStore() {
  const { subscribe, update } = writable(initialState);

  return {
    subscribe,

    updatePlayerCount: (team: Team, playerCount: number) => {
      update((state) => {
        return {
          ...state,
          playerCount: { ...state.playerCount, [team]: playerCount },
        };
      });
    },
  };
}

export const reversiStore = createReversiStore();
