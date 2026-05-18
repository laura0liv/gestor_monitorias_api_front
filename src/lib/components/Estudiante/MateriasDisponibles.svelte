<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';

  let { idEstudiante, onSolicitar } = $props();

  // NUEVO ENDPOINT:
  // GET /estudiante_materia/materias/{id_estudiante}

  let materias  = $state([]);
  let cargando  = $state(true);
  let error     = $state("");
  let busqueda  = $state("");

  onMount(async () => {
    try {

      // 👇 ahora trae SOLO las materias del estudiante
      const res = await fetch(
        `${API}/estudiante_materia/materias/${idEstudiante}`
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      materias = await res.json();

    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  });

  // Filtrar materias del estudiante
  let materiasFiltradas = $derived(
    materias.filter(m =>
      m.nombre_materia
        ?.toLowerCase()
        .includes(busqueda.toLowerCase())
    )
  );

  // Conteo de materias con monitores disponibles
  let totalConMonitores = $derived(
    materias.filter(
      m => (m.monitores_disponibles ?? 0) > 0
    ).length
  );
</script>

<div class="page">

  <div class="page-header">
    <div>
      <!-- 👇 texto actualizado -->
      <h2 class="section-title">Mis materias</h2>

      <p class="section-sub">
        {totalConMonitores}
        materia{totalConMonitores !== 1 ? "s" : ""}
        con monitores disponibles
      </p>
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
      <button
        class="alert-close"
        onclick={() => error = ""}
      >
        ✕
      </button>
    </div>
  {/if}

  {#if cargando}

    <div class="empty-state">
      <div class="spinner"></div>
      <span>Cargando materias…</span>
    </div>

  {:else if materiasFiltradas.length === 0}

    <div class="empty-state">
      <i class="bi bi-journal-x empty-icon"></i>

      <p>
        No tienes materias inscritas
        {busqueda ? ` para "${busqueda}"` : ""}
      </p>
    </div>

  {:else}

    <div class="grid">

      {#each materiasFiltradas as m}

        {@const sinMonitores =
          (m.monitores_disponibles ?? 0) === 0}

        <div
          class="card"
          class:sin-monitores={sinMonitores}
        >

          <div class="card-top">

            <div class="materia-icon">
              <i class="bi bi-book-half"></i>
            </div>

            <div class="tag">
              {m.creditos ?? "—"} créditos
            </div>

          </div>

          <div class="card-body">

            <h3 class="materia-nombre">
              {m.nombre_materia}
            </h3>

            <p class="materia-desc">
              {m.nombre_programa ?? "Sin programa asociado"}
            </p>

          </div>

          <div class="card-footer">

            <div
              class="monitores-badge"
              class:vacio={sinMonitores}
            >
              <i class="bi bi-person-check"></i>

              <span>
                {m.monitores_disponibles ?? 0}

                {(m.monitores_disponibles ?? 0) !== 1
                  ? " monitores disponibles"
                  : " monitor disponible"}
              </span>
            </div>

            <button
              class="btn btn-primary btn-sm"
              onclick={() => onSolicitar?.(m)}
              disabled={sinMonitores}
            >
              <i class="bi bi-plus-circle"></i>
              Solicitar
            </button>

          </div>

        </div>

      {/each}

    </div>

  {/if}

</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 3px;
    color: #1a1a1a;
  }

  .section-sub {
    font-size: 13px;
    color: #888;
    margin: 0;
  }

  /* Search */
  .search-wrap {
    position: relative;
  }

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
    transition: border-color .15s;
  }

  .search-input:focus {
    border-color: #010A55;
  }

  /* Alert */
  .alert {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
  }

  .alert-danger {
    background: #FCEBEB;
    color: #A32D2D;
    border: 0.5px solid #F09595;
  }

  .alert-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: inherit;
  }

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

  .empty-icon {
    font-size: 2rem;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(1,10,85,0.12);
    border-top-color: #010A55;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Grid */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
  }

  /* Card */
  .card {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition:
      box-shadow .15s,
      border-color .15s;
  }

  .card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  }

  .card.sin-monitores {
    opacity: .65;
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem .5rem;
  }

  .materia-icon {
    width: 36px;
    height: 36px;
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

  .card-body {
    padding: .5rem 1rem .75rem;
    flex: 1;
  }

  .materia-nombre {
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 4px;
    color: #1a1a1a;
  }

  .materia-desc {
    font-size: 12px;
    color: #888;
    margin: 0;
    line-height: 1.5;
  }

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

  .monitores-badge.vacio {
    color: #bbb;
  }

  .monitores-badge i {
    font-size: 13px;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 34px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }

  .btn-sm {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
  }

  .btn-primary {
    background: #010A55;
    color: #fff;
  }

  .btn-primary:hover {
    background: #020d6e;
  }

  .btn:disabled {
    opacity: .4;
    cursor: not-allowed;
  }
</style>