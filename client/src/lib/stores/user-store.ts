import { emit } from "$lib/socket";
import { writable } from "svelte/store";

interface UserState {
  teamName: TeamName | null;
}

const initialState: UserState = {
  teamName: null,
};

function createUserStore() {
  const { subscribe, update } = writable(initialState);

  return {
    subscribe,

    joinTeam: (teamName: TeamName) => {
      update((state) => {
        emit("join-team", { teamName });
        const newState = {
          ...state,
          teamName,
        };

        return newState;
      });
    },

    leaveTeam: () => {
      update((state) => {
        if (!state.teamName) {
          return state;
        }

        emit("leave-team", {
          teamName: state.teamName,
        });
        return { ...state, teamName: null };
      });
    },
  };
}

export const userStore = createUserStore();
