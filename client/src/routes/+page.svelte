<script lang="ts">
  import { browser } from "$app/environment";
  import { emit, initSocket } from "$lib/socket";
  import { onMount, onDestroy } from "svelte";
  import { reversiStore } from "$lib/stores/reversi-store";
  import { type Socket as TSocket } from "socket.io-client";
  import { userStore } from "$lib/stores/user-store";

  const teams = ["black", "white"];
  let socket: TSocket | null = null;

  onMount(() => {
    if (!browser) return;
    socket = initSocket();
    socket.connect();

    socket.on("team-updated", ({ team, playerCount }) => {
      console.log("team-updated", { team, playerCount });
      reversiStore.updatePlayerCount(team, playerCount);
    });
  });

  onDestroy(() => {
    if (!socket) return;
    socket.disconnect();
  });

  const userTeam = $derived($userStore.team);
  const bpc = $derived($reversiStore.playerCount.black);
  const wpc = $derived($reversiStore.playerCount.white);
</script>

<main>
  {#each teams as team}
    <div class={team}>
      <section>
        <p><strong>Team {team}</strong></p>
        <p>Player count: {team === "black" ? bpc : wpc}</p>
      </section>
      {#if userTeam !== team}
        <button
          style="color: green;"
          onclick={() => {
            userStore.leaveTeam();
            userStore.joinTeam(team as Team);
            emit("join-team", { team });
          }}
        >
          Join team
        </button>
      {:else}
        <button
          style="color: red;"
          onclick={() => {
            userStore.leaveTeam();
            emit("leave-team", { team });
          }}
        >
          Leave team
        </button>
      {/if}
    </div>
  {/each}
</main>

<style>
  main {
    display: flex;
    gap: 1rem;
    padding: 1rem;
  }

  div.black {
    background-color: #111;
    color: #fff;
  }

  div.white {
    background-color: #fff;
    color: #111;
  }

  div {
    width: 100%;
    padding: 1rem;
    border: 1px solid #111;
    display: flex;
    justify-content: space-between;
  }

  p {
    font-size: 1.5rem;
    letter-spacing: 0.5px;
  }

  button {
    background: revert;
    border: revert;
    border-radius: revert;
    color: revert;
    cursor: revert;
    font-family: revert;
    padding: revert;
    transition: revert;
    height: 100%;
  }
</style>
