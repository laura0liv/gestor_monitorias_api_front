<script>
  import { onMount } from "svelte";

  let { idEstudiante, onSolicitar } = $props();

  const API = "http://127.0.0.1:8000";

  let materias   = $state([]);
  let cargando   = $state(true);
  let error      = $state("");
  let busqueda   = $state("");

  onMount(async () => {
    try {
      const res = await fetch(`${API}/materias/disponibles`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = await res.json();
      // Espera: [{ id, nombre, descripcion, creditos, monitores_disponibles }]
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  });

  let materiasFiltradas = $derived(
    materias.filter(m =>
      m.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  );
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Materias disponibles para monitoría</h2>
      <p class="section-sub">Explora las asignaturas con monitores activos este período</p>
    </div>
    <div class="search-wrap">
      <i class="bi bi-search search-icon"></i>
      <input
        class="search-input"
        type="text"
        placeholder="Buscar materia…"
        bind:value={busqueda}
      />
    </div>
  </div>

  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" onclick={() => error = ""}>✕</button>
    </div>
  {/if}

  {#if cargando}
    <div class="empty-state">
      <div class="spinner"></div>
      <span>Cargando materias…</span>
    </div>

  {:else if materiasFiltradas.length === 0}
    <div class="empty-state">
      <i class="bi bi-inbox empty-icon"></i>
      <p>No se encontraron materias{busqueda ? ` para "${busqueda}"` : ""}.</p>
    </div>

  {:else}
    <div class="grid">
      {#each materiasFiltradas as m}
        <div class="card">
          <div class="card-top">
            <div class="materia-icon"><i class="bi bi-book-half"></i></div>
            <div class="tag">{m.creditos ?? "—"} créditos</div>
          </div>
          <div class="card-body">
            <h3 class="materia-nombre">{m.nombre}</h3>
            <p class="materia-desc">{m.descripcion ?? "Sin descripción disponible."}</p>
          </div>
          <div class="card-footer">
            <div class="monitores-badge">
              <i class="bi bi-person-check"></i>
              <span>{m.monitores_disponibles ?? 0} monitor{(m.monitores_disponibles ?? 0) !== 1 ? "es" : ""} disponible{(m.monitores_disponibles ?? 0) !== 1 ? "s" : ""}</span>
            </div>
            <button
              class="btn btn-primary btn-sm"
              onclick={onSolicitar}
              disabled={(m.monitores_disponibles ?? 0) === 0}
            >
              Solicitar
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

</div>

<style>
  .page { display: flex; flex-direction: column; gap: 1.25rem; }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .section-title { font-size: 16px; font-weight: 500; margin: 0 0 3px; }
  .section-sub   { font-size: 13px; color: #888; margin: 0; }

  /* Search */
  .search-wrap { position: relative; }
  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #aaa;
    font-size: 13px;
    pointer-events: none;
  }
  .search-input {
    height: 34px;
    padding: 0 12px 0 30px;
    border: 0.5px solid rgba(0,0,0,0.15);
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    width: 220px;
    background: #fff;
  }
  .search-input:focus { border-color: #010A55; }

  /* Alerts */
  .alert { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger  { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; }
  .alert-close   { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; }

  /* Empty / Loading */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 3rem;
    color: #aaa;
    font-size: 13px;
  }
  .empty-icon { font-size: 2rem; }
  .spinner {
    width: 28px; height: 28px;
    border: 3px solid rgba(1,10,85,0.15);
    border-top-color: #010A55;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Grid de cards */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
  }

  .card {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow .15s;
  }
  .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem .5rem;
  }

  .materia-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: #EEF0FF;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #010A55;
    font-size: 16px;
  }

  .tag {
    font-size: 11px;
    font-weight: 500;
    background: #f5f5f3;
    color: #666;
    padding: 3px 9px;
    border-radius: 20px;
    border: 0.5px solid rgba(0,0,0,0.08);
  }

  .card-body { padding: .5rem 1rem .75rem; flex: 1; }
  .materia-nombre { font-size: 14px; font-weight: 500; margin: 0 0 5px; }
  .materia-desc   { font-size: 12px; color: #888; margin: 0; line-height: 1.5; }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .75rem 1rem;
    border-top: 0.5px solid rgba(0,0,0,0.06);
    background: #fafafa;
  }

  .monitores-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #085041;
  }
  .monitores-badge i { font-size: 13px; }

  /* Buttons */
  .btn     { height: 34px; padding: 0 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
  .btn-sm  { height: 28px; padding: 0 12px; font-size: 12px; }
  .btn-primary       { background: #010A55; color: #fff; }
  .btn-primary:hover { background: #020d6e; }
  .btn:disabled      { opacity: .4; cursor: not-allowed; }
</style>