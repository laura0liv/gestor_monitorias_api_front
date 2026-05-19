<script>
  import { onMount } from "svelte";

  let { idTutor } = $props();

  const API = "http://127.0.0.1:8000";
  let historial = $state([]);
  let cargando  = $state(false);
  let error     = $state("");
  let busqueda  = $state("");

  onMount(async () => {
    cargando = true;
    try {
      const res = await fetch(`${API}/sesion/historial_tutor/${idTutor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      historial = await res.json();
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  });

  let filtrado = $derived(
    historial.filter(h =>
      `${h.nombre_estudiante ?? ""} ${h.nombre_materia ?? ""}`.toLowerCase()
        .includes(busqueda.toLowerCase())
    )
  );

  let totalSesiones   = $derived(historial.length);
  let totalAsistieron = $derived(historial.filter(h => h.asistio).length);
  let promCalif = $derived(
    historial.filter(h => h.calificacion != null).length
      ? (historial.reduce((s, h) => s + Number(h.calificacion ?? 0), 0) /
         historial.filter(h => h.calificacion != null).length).toFixed(1)
      : "—"
  );

  function formatFecha(f) {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" });
  }
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Historial de monitorías</h2>
      <p class="section-sub">Registro completo de tus sesiones realizadas</p>
    </div>
    <span class="badge-pill">{filtrado.length} sesiones</span>
  </div>

  <!-- STATS -->
  <div class="stats-grid">
    <div class="stat">
      <div class="stat-label">Total sesiones</div>
      <div class="stat-val">{totalSesiones}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Asistieron</div>
      <div class="stat-val">{totalAsistieron}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Calificación promedio</div>
      <div class="stat-val">{promCalif}</div>
    </div>
  </div>

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  {#if cargando}
    <div class="loading">Cargando historial...</div>

  {:else}
    <div class="card">
      <div class="search-bar">
        <input placeholder="Buscar por estudiante o materia..." bind:value={busqueda} />
      </div>

      {#if filtrado.length === 0}
        <div class="empty-state">
          <div class="empty-icon">🗂️</div>
          <div class="empty-title">Sin registros</div>
          <div class="empty-sub">No hay sesiones completadas todavía</div>
        </div>
      {:else}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Estudiante</th>
              <th>Materia</th>
              <th>Fecha</th>
              <th>Temas vistos</th>
              <th>Asistencia</th>
              <th>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {#each filtrado as h, i}
              <tr>
                <td class="muted">{i + 1}</td>
                <td>
                  <div class="name-cell">
                    <div class="avatar">{(h.nombre_estudiante ?? "?")[0]}</div>
                    <span class="fw">{h.nombre_estudiante ?? "—"}</span>
                  </div>
                </td>
                <td class="hint">{h.nombre_materia ?? "—"}</td>
                <td class="hint">{formatFecha(h.fecha)}</td>
                <td class="temas">{h.temas_vistos ?? "—"}</td>
                <td>
                  {#if h.asistio}
                    <span class="badge-yes">Asistió</span>
                  {:else}
                    <span class="badge-no">No asistió</span>
                  {/if}
                </td>
                <td>
                  {#if h.calificacion != null}
                    <span class="calificacion">{Number(h.calificacion).toFixed(1)}</span>
                  {:else}
                    <span class="hint">—</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}

</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub { font-size:13px; color:#888; margin:0; }
  .badge-pill { background:#E1F5EE; color:#085041; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; white-space:nowrap; }

  .stats-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .stat { background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:10px; padding:.75rem 1rem; }
  .stat-label { font-size:11px; color:#888; margin-bottom:4px; }
  .stat-val { font-size:22px; font-weight:500; }

  .alert { padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; }

  .loading { text-align:center; padding:3rem; color:#aaa; font-size:13px; }

  .card { background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:12px; overflow:hidden; }

  .search-bar { padding:.75rem 1.25rem; border-bottom:0.5px solid rgba(0,0,0,0.08); }
  .search-bar input {
    height:32px; padding:0 12px; border:0.5px solid rgba(0,0,0,0.15); border-radius:7px;
    font-size:13px; width:280px; font-family:inherit;
  }
  .search-bar input:focus { outline:none; border-color:#010A55; }

  .empty-state { padding:3rem; text-align:center; }
  .empty-icon  { font-size:36px; margin-bottom:.75rem; }
  .empty-title { font-size:15px; font-weight:500; }
  .empty-sub   { font-size:13px; color:#888; margin-top:4px; }

  table { width:100%; border-collapse:collapse; }
  thead th { font-size:11px; font-weight:500; color:#888; padding:9px 1.25rem; text-align:left; border-bottom:0.5px solid rgba(0,0,0,0.08); background:#fafafa; }
  tbody tr { border-bottom:0.5px solid rgba(0,0,0,0.06); }
  tbody tr:last-child { border-bottom:none; }
  tbody tr:hover { background:#fafafa; }
  td { padding:10px 1.25rem; font-size:13px; vertical-align:middle; }
  .muted { color:#aaa; font-size:12px; }
  .hint  { color:#666; font-size:12px; }
  .fw    { font-weight:500; }

  .name-cell { display:flex; align-items:center; gap:8px; }
  .avatar { width:28px; height:28px; border-radius:50%; background:#EEEDFE; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#3C3489; flex-shrink:0; }

  .temas { font-size:12px; color:#555; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  .badge-yes { background:#E1F5EE; color:#085041; font-size:11px; padding:2px 9px; border-radius:20px; }
  .badge-no  { background:#FCEBEB; color:#791F1F; font-size:11px; padding:2px 9px; border-radius:20px; }

  .calificacion { font-size:14px; font-weight:500; color:#0F6E56; }
</style>