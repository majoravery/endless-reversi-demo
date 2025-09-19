import { emit } from "$lib/socket";
import { writable } from "svelte/store";

interface UserState {
  team: Team | null;
}

const initialState: UserState = {
  team: null,
};

function createUserStore() {
  const { subscribe, update } = writable(initialState);

  return {
    subscribe,

    joinTeam: (team: Team) => {
      update((state) => {
        emit("join-team", { team });
        const newState = {
          ...state,
          team,
        };

        return newState;
      });
    },

    leaveTeam: () => {
      update((state) => {
        if (!state.team) {
          return state;
        }

        emit("leave-team", {
          team: state.team,
        });
        return { ...state, team: null };
      });
    },
  };
}

export const userStore = createUserStore();
