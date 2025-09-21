<script lang="ts">
  import type { Socket as TSocket } from "socket.io-client";
  import { browser } from "$app/environment";
  import { initSocket } from "$lib/socket";
  import { onMount, onDestroy } from "svelte";
  import { reversiStore } from "$lib/stores/reversi-store";
  import Board from "$lib/components/Board.svelte";
  import Team from "$lib/components/Team.svelte";

  let socket: TSocket | null = null;

  onMount(() => {
    if (!browser) return;
    socket = initSocket();
    socket.connect();

    socket.on("initial-state", (data) => {
      reversiStore.setState(data);
    });

    socket.on("team-updated", ({ teamName, playerCount }) => {
      reversiStore.updatePlayerCount(teamName, playerCount);
    });

    socket.on("board-updated", (data) => {
      reversiStore.updateBoard(data);
    });
  });

  onDestroy(() => {
    if (!socket) return;
    socket.disconnect();
  });
</script>

<main>
  <Board />
  <Team teamName="black" />
  <Team teamName="white" />
</main>

<style>
  main {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    align-items: center;
    flex-direction: column;
  }
</style>
