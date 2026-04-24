<script>
  import { onMount } from "svelte";

  let { idTutor } = $props();

  const API = "http://127.0.0.1:8000";
  let sesiones = $state([]);
  let cargando = $state(false);
  let error    = $state("");
  let filtro   = $state("todas");   // todas | pendientes | confirmadas | completadas

  const ESTADOS = {
    pendiente:   { label:"Pendiente",   bg:"#FAEEDA", color:"#633806" },
    confirmada:  { label:"Confirmada",  bg:"#E1F5EE", color:"#085041" },
    completada:  { label:"Completada",  bg:"#E6F1FB", color:"#0C447C" },
    cancelada:   { label:"Cancelada",   bg:"#FCEBEB", color:"#791F1F" },
  };

  onMount(async () => {
    cargando = true;
    try {
      const res = await fetch(`${API}/sesion/get_sesiones_tutor/${idTutor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      sesiones = await res.json();
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  });

  let filtradas = $derived(
    filtro === "todas"
      ? sesiones
      : sesiones.filter(s => s.estado === filtro)
  );

  function formatFecha(f) {
    if (!f) return "—";
    return new Date(f).toLocaleDateString("es-CO", { weekday:"short", day:"2-digit", month:"short" });
  }
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Sesiones agendadas</h2>
      <p class="section-sub">Revisa y gestiona tus próximas monitorías</p>
    </div>
    <span class="badge-pill">{filtradas.length} sesiones</span>
  </div>

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <!-- FILTROS -->
  <div class="filtros">
    {#each ["todas","pendiente","confirmada","completada","cancelada"] as f}
      <button class="filtro-btn" class:active={filtro === f} onclick={() => filtro = f}>
        {f === "todas" ? "Todas" : ESTADOS[f]?.label ?? f}
      </button>
    {/each}
  </div>

  {#if cargando}
    <div class="loading">Cargando sesiones...</div>

  {:else if filtradas.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📅</div>
      <div class="empty-title">No hay sesiones {filtro !== "todas" ? `con estado "${filtro}"` : "agendadas"}</div>
    </div>

  {:else}
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Estudiante</th>
            <th>Materia</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Lugar</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {#each filtradas as s, i}
            {@const est = ESTADOS[s.estado] ?? ESTADOS.pendiente}
            <tr>
              <td class="muted">{i + 1}</td>
              <td>
                <div class="name-cell">
                  <div class="avatar">{(s.nombre_estudiante ?? "?")[0]}</div>
                  <span class="fw">{s.nombre_estudiante ?? "—"}</span>
                </div>
              </td>
              <td class="hint">{s.nombre_materia ?? "—"}</td>
              <td class="hint">{formatFecha(s.fecha)}</td>
              <td class="hint">{s.hora_inicio ?? "—"}</td>
              <td class="hint">{s.lugar ?? "—"}</td>
              <td>
                <span class="estado-badge" style="background:{est.bg};color:{est.color}">
                  {est.label}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub { font-size:13px; color:#888; margin:0; }
  .badge-pill { background:#E1F5EE; color:#085041; font-size:11px; font-weight:500; padding:4px 12px; border-radius:20px; white-space:nowrap; }

  .alert { padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; }

  .filtros { display:flex; gap:6px; flex-wrap:wrap; }
  .filtro-btn {
    padding:5px 14px; border-radius:20px; font-size:12px; font-weight:500;
    border:0.5px solid rgba(0,0,0,0.12); background:#fff; cursor:pointer; color:#555;
    transition:background .12s;
  }
  .filtro-btn:hover { background:#f0f0f0; }
  .filtro-btn.active { background:#010A55; color:#fff; border-color:#010A55; }

  .loading { text-align:center; padding:3rem; color:#aaa; font-size:13px; }

  .empty-state {
    background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:12px;
    padding:3rem; text-align:center;
  }
  .empty-icon  { font-size:36px; margin-bottom:.75rem; }
  .empty-title { font-size:15px; font-weight:500; }

  .card { background:#fff; border:0.5px solid rgba(0,0,0,0.08); border-radius:12px; overflow:hidden; }
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

  .estado-badge { font-size:11px; padding:2px 9px; border-radius:20px; font-weight:500; }
</style>