<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';

  let { idTutor } = $props();

  let historial = $state([]);
  let cargando  = $state(false);
  let error     = $state("");
  let busqueda  = $state("");

  onMount(async () => {
    cargando = true;
    try {
      // Endpoint real: GET /monitorias/tutor/{id_monitor}
      // Filtramos en el cliente por estado Completada
      const res = await fetch(`${API}/monitorias/tutor/${idTutor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Solo sesiones completadas para el historial
      historial = data.filter(m => (m.estado ?? "").toLowerCase() === "completada");
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  });

  let filtrado = $derived(
    historial.filter(h =>
      `${h.estudiante ?? ""} ${h.nombre_materia ?? ""}`.toLowerCase()
        .includes(busqueda.toLowerCase())
    )
  );

  let totalSesiones   = $derived(historial.length);
  let totalAsistieron = $derived(historial.filter(h => h.asistencia === true).length);
  let tasaAsistencia  = $derived(
    totalSesiones > 0
      ? Math.round((totalAsistieron / totalSesiones) * 100)
      : 0
  );

  function formatFecha(f) {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-CO", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  function hhmm(t) { return (t ?? "").slice(0, 5); }
</script>

<div class="page">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h2 class="section-title">Historial de monitorías</h2>
      <p class="section-sub">Registro completo de tus sesiones completadas</p>
    </div>
    <span class="badge-pill">{filtrado.length} sesiones</span>
  </div>

  <!-- STATS -->
  <div class="stats-grid">
    <div class="stat">
      <div class="stat-label">Total completadas</div>
      <div class="stat-val">{totalSesiones}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Estudiantes asistieron</div>
      <div class="stat-val">{totalAsistieron}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Tasa de asistencia</div>
      <div class="stat-val">
        {totalSesiones > 0 ? `${tasaAsistencia}%` : "—"}
      </div>
    </div>
  </div>

  <!-- ERROR -->
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <!-- LOADING -->
  {#if cargando}
    <div class="loading-wrap">
      <div class="spinner"></div>
      <span>Cargando historial...</span>
    </div>

  {:else}
    <div class="card">

      <!-- BUSCADOR -->
      <div class="search-bar">
        <i class="bi bi-search search-icon"></i>
        <input
          placeholder="Buscar por estudiante o materia..."
          bind:value={busqueda}
        />
        {#if busqueda}
          <button class="clear-btn" onclick={() => busqueda = ""}>
            <i class="bi bi-x"></i>
          </button>
        {/if}
      </div>

      <!-- VACÍO -->
      {#if filtrado.length === 0}
        <div class="empty-state">
          <i class="bi bi-journal-x empty-icon"></i>
          <div class="empty-title">
            {busqueda ? "Sin resultados" : "Sin sesiones completadas"}
          </div>
          <div class="empty-sub">
            {busqueda
              ? `No hay coincidencias para "${busqueda}"`
              : "Las monitorías completadas aparecerán aquí"}
          </div>
        </div>

      {:else}

        <!-- TABLA desktop -->
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Estudiante</th>
                <th>Materia</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Modalidad</th>
                <th>Asistencia</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {#each filtrado as h, i}
                <tr>
                  <td class="muted">{i + 1}</td>
                  <td>
                    <div class="name-cell">
                      <div class="avatar">
                        {(h.estudiante ?? "?")[0].toUpperCase()}
                      </div>
                      <span class="fw">{h.estudiante ?? "—"}</span>
                    </div>
                  </td>
                  <td class="hint">{h.nombre_materia ?? "—"}</td>
                  <td class="hint">{formatFecha(h.fecha)}</td>
                  <td class="hint">{hhmm(h.hora_inicio)} - {hhmm(h.hora_fin)}</td>
                  <td class="hint">{h.modalidad ?? "—"}</td>
                  <td>
                    {#if h.asistencia === true}
                      <span class="badge-yes"><i class="bi bi-check-lg"></i> Asistió</span>
                    {:else if h.asistencia === false}
                      <span class="badge-no"><i class="bi bi-x-lg"></i> No asistió</span>
                    {:else}
                      <span class="hint">—</span>
                    {/if}
                  </td>
                  <td class="obs">{h.observaciones ?? "—"}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- CARDS móvil -->
        <div class="cards-mobile">
          {#each filtrado as h, i}
            <div class="hist-card">
              <div class="hist-card-top">
                <div class="name-cell">
                  <div class="avatar">{(h.estudiante ?? "?")[0].toUpperCase()}</div>
                  <div>
                    <span class="fw">{h.estudiante ?? "—"}</span>
                    <span class="hint" style="display:block;font-size:11px">{h.nombre_materia ?? "—"}</span>
                  </div>
                </div>
                {#if h.asistencia === true}
                  <span class="badge-yes"><i class="bi bi-check-lg"></i> Asistió</span>
                {:else if h.asistencia === false}
                  <span class="badge-no"><i class="bi bi-x-lg"></i> No asistió</span>
                {:else}
                  <span class="hint">—</span>
                {/if}
              </div>
              <div class="hist-card-meta">
                <span><i class="bi bi-calendar3"></i> {formatFecha(h.fecha)}</span>
                <span><i class="bi bi-clock"></i> {hhmm(h.hora_inicio)} - {hhmm(h.hora_fin)}</span>
                <span><i class="bi bi-geo-alt"></i> {h.modalidad ?? "—"}</span>
              </div>
              {#if h.observaciones}
                <div class="hist-obs">
                  <i class="bi bi-chat-left-text"></i>
                  {h.observaciones}
                </div>
              {/if}
            </div>
          {/each}
        </div>

      {/if}
    </div>
  {/if}

</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }

  .page-header {
    display:flex; align-items:flex-start;
    justify-content:space-between; flex-wrap:wrap; gap:.5rem;
  }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub   { font-size:13px; color:#888; margin:0; }
  .badge-pill    { background:#E1F5EE; color:#085041; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; white-space:nowrap; }

  /* ── STATS ── */
  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .stat       { background:#fff; border:.5px solid rgba(0,0,0,.08); border-radius:10px; padding:.75rem 1rem; }
  .stat-label { font-size:11px; color:#888; margin-bottom:4px; }
  .stat-val   { font-size:22px; font-weight:500; }

  /* ── ALERT ── */
  .alert        { padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger { background:#FCEBEB; color:#A32D2D; border:.5px solid #F09595; }

  /* ── LOADING ── */
  .loading-wrap { display:flex; align-items:center; justify-content:center; gap:10px; padding:3rem; color:#aaa; font-size:13px; }
  .spinner      { width:20px; height:20px; border-radius:50%; border:2px solid #e0e0e0; border-top-color:#1D9E75; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── CARD ── */
  .card { background:#fff; border:.5px solid rgba(0,0,0,.08); border-radius:12px; overflow:hidden; }

  /* ── SEARCH ── */
  .search-bar {
    display:flex; align-items:center; gap:8px;
    padding:.75rem 1.25rem; border-bottom:.5px solid rgba(0,0,0,.08);
  }
  .search-icon { color:#aaa; font-size:13px; flex-shrink:0; }
  .search-bar input {
    flex:1; height:32px; padding:0 8px;
    border:.5px solid rgba(0,0,0,.15); border-radius:7px;
    font-size:13px; font-family:inherit; max-width:320px;
  }
  .search-bar input:focus { outline:none; border-color:#010A55; }
  .clear-btn { background:none; border:none; cursor:pointer; color:#aaa; font-size:14px; padding:0; display:flex; }

  /* ── EMPTY ── */
  .empty-state  { padding:3rem; text-align:center; color:#aaa; }
  .empty-icon   { font-size:2rem; margin-bottom:.75rem; }
  .empty-title  { font-size:14px; font-weight:500; color:#666; margin-bottom:4px; }
  .empty-sub    { font-size:12px; }

  /* ── TABLA desktop ── */
  .table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
  table       { width:100%; border-collapse:collapse; min-width:640px; }
  thead th    { font-size:11px; font-weight:500; color:#888; padding:9px 1.25rem; text-align:left; border-bottom:.5px solid rgba(0,0,0,.08); background:#fafafa; }
  tbody tr    { border-bottom:.5px solid rgba(0,0,0,.06); }
  tbody tr:last-child { border-bottom:none; }
  tbody tr:hover { background:#fafafa; }
  td          { padding:10px 1.25rem; font-size:13px; vertical-align:middle; }
  .muted      { color:#aaa; font-size:12px; }
  .hint       { color:#666; font-size:12px; }
  .fw         { font-weight:500; }
  .obs        { font-size:12px; color:#555; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  .name-cell { display:flex; align-items:center; gap:8px; }
  .avatar    {
    width:28px; height:28px; border-radius:50%;
    background:#EEEDFE; color:#3C3489;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:600; flex-shrink:0;
  }

  .badge-yes { display:inline-flex; align-items:center; gap:4px; background:#E1F5EE; color:#085041; font-size:11px; padding:2px 9px; border-radius:20px; }
  .badge-no  { display:inline-flex; align-items:center; gap:4px; background:#FCEBEB; color:#791F1F; font-size:11px; padding:2px 9px; border-radius:20px; }

  /* ── CARDS móvil ── */
  .cards-mobile { display:none; flex-direction:column; }

  .hist-card {
    padding:14px 1.25rem; border-bottom:.5px solid rgba(0,0,0,.06);
    display:flex; flex-direction:column; gap:8px;
  }
  .hist-card:last-child { border-bottom:none; }

  .hist-card-top  { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; flex-wrap:wrap; }
  .hist-card-meta { display:flex; gap:10px; flex-wrap:wrap; font-size:11px; color:#888; }
  .hist-card-meta span { display:flex; align-items:center; gap:4px; }

  .hist-obs {
    display:flex; align-items:flex-start; gap:6px;
    font-size:12px; color:#666;
    background:#fafafa; border-radius:7px; padding:8px 10px;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .stats-grid   { grid-template-columns:repeat(3,1fr); gap:6px; }
    .stat-val     { font-size:18px; }
    .table-wrap   { display:none; }
    .cards-mobile { display:flex; }
    .search-bar input { max-width:100%; }
  }
</style>