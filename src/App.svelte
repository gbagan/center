<script lang="ts">
    import { centroid, dist, geometric_median, minimum_enclosing_circle, type Disk, type Point } from "./lib/geometry";

  let points: Point[] = $state([{x: 0.1, y: 0.1}, {x: 0.3, y:0.9}, {x: 0.9, y: 0.3}]);
  let center1: Point | null = $derived(centroid(points));
  let mec: Disk | null = $derived(minimum_enclosing_circle(points));
  let median: Point | null = $derived(geometric_median(points));
  let mode: "remove" | "move" = $state("move");
  let showCenter1 = $state(true);
  let showCenter2 = $state(true);
  let showCenter3 = $state(true);
  let showMec = $state(false);
  let showPathsFromMedian = $state(false)
  let selectedNode: number | null = $state(null);
  let pointerPosition: Point | null = $state(null);

  let maxDistanceToPointer = $derived(
    pointerPosition === null
    ? null
    : Math.max(0, ...points.map(p => dist(p, pointerPosition!), 0))
  );

  let sumDistanceToPointer = $derived(
    pointerPosition === null
    ? null
    : points.reduce((acc, p) => acc + dist(p, pointerPosition!), 0)
  );

  let sumSquareDistanceToPointer = $derived(
    pointerPosition === null
    ? null
    : points.reduce((acc, p) => acc + dist(p, pointerPosition!) ** 2, 0)
  );


  let sumDistanceToCenter = $derived(
    median === null
    ? null
    : points.reduce((acc, p) => acc + dist(p, median!), 0)
  );

  let sumSquareDistanceToCenter = $derived(
    center1 === null
    ? null
    : points.reduce((acc, p) => acc + dist(p, center1!) ** 2, 0)
  );

  

  function getPointerPosition(e: MouseEvent): Point {
    const el = e.currentTarget as Element;
    const { left, top, width, height } = el.getBoundingClientRect();
    return { x: (e.clientX - left) / width, y: (e.clientY - top) / height };
  }

  function handleSvgClick(e: MouseEvent) {
    const position = getPointerPosition(e);
    if (mode === "move") {
      points.push(position);
      mode = "move";
    }
  }

  function handlePointClick(idx: number, e: MouseEvent) {
    e.stopPropagation();
    if (mode === "remove") {
      points.splice(idx, 1);
      mode = "move";
    }
  }

  function move(ev: MouseEvent) {
    const pos = getPointerPosition(ev);
    pointerPosition = pos;
    if (selectedNode !== null) {
      points[selectedNode] = pos;
    }
  }

  function handlePointerDown(idx: number, e: PointerEvent) {
    if (mode !== "move") return;
    if (e.currentTarget) {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    }
    selectedNode = idx;
    e.stopPropagation();
  }

  function handlePointerUp(e: PointerEvent) {
    selectedNode = null;
  }

  function clear() {
    points = [];
  }

</script>

{#snippet canvas()}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svg
    viewBox="0 0 100 100"
    class="canvas"
    onclick={handleSvgClick}
    onpointermove={move}
  >
    {#if showCenter2 && mec !== null && showMec}
      <circle
        r={mec.radius * 100}
        fill="rgba(255, 0, 0, 0.1)"
        stroke="red"
        stroke-width="0.1"
        cx={100 * mec.center.x}
        cy={100 * mec.center.y}
      />
    {/if}
    {#if showCenter3 && median !== null && showPathsFromMedian}
      {#each points as point}
        <line
          x1={100 * median.x}
          y1={100 * median.y}
          x2={100 * point.x}
          y2={100 * point.y}
          stroke="blue"
          stroke-width="0.08"
        />
      {/each}
    {/if}
    {#if showCenter1 && center1 !== null}
      <circle
        r="1.5"
        fill="green"
        stroke="black"
        stroke-width="0.1"
        cx={100 * center1.x}
        cy={100 * center1.y}
      />
    {/if}
    {#if showCenter2 && mec !== null}
      <circle
        r="1.5"
        fill="red"
        stroke="black"
        stroke-width="0.1"
        cx={100 * mec.center.x}
        cy={100 * mec.center.y}
        onpointerenter={() => showMec = true}
        onpointerleave={() => showMec = false}
      />
    {/if}
    {#if showCenter3 && median !== null}
      <circle
        r="1.5"
        fill="blue"
        stroke="black"
        stroke-width="0.1"
        cx={100 * median.x}
        cy={100 * median.y}
        onpointerenter={() => showPathsFromMedian = true}
        onpointerleave={() => showPathsFromMedian = false}
      />
    {/if}
    {#each points as point, i}
      <circle
        r="1.3"
        fill="black"
        stroke="black"
        stroke-width="0.1" 
        cx={100 * point.x}
        cy={100 * point.y}
        onpointerdown={e => handlePointerDown(i, e)}
        onpointerup={handlePointerUp}
        onclick={e => handlePointClick(i, e)}
      />
    {/each}
  </svg>
{/snippet}

<div class="app">
  <div>
    <h2 style:color="blue">Somme des distances</h2>
    <ul>
      <li>Du pointeur: {sumDistanceToPointer !== null ? (100 * sumDistanceToPointer).toFixed(3) : '∅'}</li>
      <li>Minimale: {sumDistanceToCenter !== null ? (100 * sumDistanceToCenter).toFixed(3) : '∅'}</li>
    </ul>
    <h2 style:color="green">Somme des distances au carré</h2>
    <ul>
      <li>Du pointeur: {sumSquareDistanceToPointer !== null ? (10000 * sumSquareDistanceToPointer).toFixed(3) : '∅'}</li>
      <li>Minimale: {sumSquareDistanceToCenter !== null ? (10000 * sumSquareDistanceToCenter).toFixed(3) : '∅'}</li>
    </ul>
    <h2 style:color="red">Distance maximale</h2>
    <ul>
      <li>Du pointeur: {maxDistanceToPointer !== null ? (100 * maxDistanceToPointer).toFixed(3) : '∅'}</li>
      <li>Minimale: {mec !== null ? (100 * mec.radius).toFixed(3) : '∅'}</li>
    </ul>
  </div>
  <main class="canvas-container">
    {@render canvas()}
    <button onclick={() => mode = "remove"}>Supprimer un sommet</button>
    <button onclick={clear}>Tout effacer</button>
  </main>

  <aside class="controls">
    <h2>Affichage des centres</h2>
    <label>
      <input type="checkbox" bind:checked={showCenter1} />
      Afficher le centre de gravité
    </label>
    <label>
      <input type="checkbox" bind:checked={showCenter2} />
      Afficher le centre du cercle englobant minimum
    </label>
    <label>
      <input type="checkbox" bind:checked={showCenter3} />
      Afficher le médian géométrique
    </label>
  </aside>
</div>

<style>
  .app {
    width: 100vw;
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    justify-content: space-between;
  }

  .canvas-container {
    flex: 1;
  }

  .canvas {
    width: 800px;
    height: 800px;
    border: 1px solid black;
    display: block;
    background: white;
  }

  .controls {
    min-width: 200px;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    background: #f9f9f9;
  }

  .controls h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    user-select: none;
  }

  button {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    cursor: pointer;
    border: 1px solid transparent;
    white-space: nowrap;
    padding: 0 1em;
    border-radius: 0.25em;
    height: 2em;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    position: relative;
    background: white;
    border-color: #d9d9d9;
    outline: 0;

    &:not(:disabled):hover {
        text-decoration: none;
    }

    &:not(:disabled):active {
        transition: none;
    }

    &:hover, &:active {
        text-decoration: none;
    }

    &:hover, &:focus {
        color: #40a9ff;
        background-color: white;
        border-color: #40a9ff;
    }
    &:active {
        color: #096dd9;
        background-color: white;
        border-color: #096dd9;
    }

    &:disabled {
        cursor: not-allowed;
        color: rgba(0, 0, 0, 0.25);
        background-color: #f5f5f5;
        border-color: #d9d9d9;
    }
  }
</style>