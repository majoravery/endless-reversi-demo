<script lang="ts">
  import { reversiStore } from "$lib/stores/reversi-store";
  import { userStore } from "$lib/stores/user-store";

  function handleCellClick(row: number, col: number) {
    reversiStore.playPiece(row, col, $userStore.teamName);
  }
</script>

{#if $reversiStore.board}
  <section
    style:grid-template-rows="repeat({$reversiStore.dimension}, min-content)"
    style:grid-template-columns="repeat({$reversiStore.dimension}, min-content)"
  >
    {#each $reversiStore.board as row, rowIndex}
      {#each row as col, colIndex}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={() => handleCellClick(rowIndex, colIndex)}>
          {#if col === 1}
            ⚫️
          {:else if col === -1}
            ⚪️
          {/if}
        </div>
      {/each}
    {/each}
  </section>
{/if}

<style>
  section {
    display: inline-grid;
    border: 1px solid black;
  }

  div {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid black;
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
</style>
