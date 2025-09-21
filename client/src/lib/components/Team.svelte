<script lang="ts">
  import { emit } from "$lib/socket";
  import { userStore } from "$lib/stores/user-store";
  import { reversiStore } from "$lib/stores/reversi-store";

  const { teamName }: { teamName: TeamName } = $props();

  const joined = $derived($userStore.teamName === teamName);
  const playerCount = $derived($reversiStore.playerCount[teamName]);
</script>

<div class={teamName}>
  <section>
    <p><strong>Team {teamName}</strong></p>
    <p>Player count: {playerCount}</p>
  </section>
  {#if !joined}
    <button
      style="color: green;"
      onclick={() => {
        if ($userStore.teamName) {
          userStore.leaveTeam();
        }
        userStore.joinTeam(teamName);
      }}
    >
      Join team
    </button>
  {:else}
    <button
      style="color: red;"
      onclick={() => {
        userStore.leaveTeam();
      }}
    >
      Leave team
    </button>
  {/if}
</div>

<style>
  div {
    width: 100%;
    padding: 1rem;
    border: 1px solid #111;
    display: flex;
    justify-content: space-between;
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
  }
</style>
