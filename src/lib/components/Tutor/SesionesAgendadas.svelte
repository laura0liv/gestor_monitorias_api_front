<script>
  import { onMount } from "svelte";
  import { API } from "$lib/services/api";

  let { idTutor } = $props();

  let monitorias = $state([]);
  let cargando   = $state(false);
  let error      = $state("");
  let filtro     = $state("todas");

  const ESTADOS = {
    pendiente:  { label: "Pendiente",  bg: "#FFF8E1", color: "#7D5A00", icon: "bi-hourglass-split"  },
    programada: { label: "Programada", bg: "#E1F5EE", color: "#085041", icon: "bi-calendar-check"   },
    completada: { label: "Completada", bg: "#EEF0FF", color: "#2D4E8A", icon: "bi-patch-check"       },
    cancelada:  { label: "Cancelada",  bg: "#FCEBEB", color: "#A32D2D", icon: "bi-x-circle"          },
    rechazada:  { label: "Rechazada",  bg: "#FDECEC", color: "#B42318", icon: "bi-slash-circle"      }
  };

  function normalizar(m) {
    return {
      ...m,
      estado: (m.estado ?? "").toLowerCase(),
      estudiante: m.estudiante ?? `${m.nombre_estudiante ?? ""} ${m.apellido_estudiante ?? ""}`.trim(),
      materia:    m.nombre_materia ?? "Sin materia",
      aula:       m.nombre_aula ? `${m.nombre_aula}${m.bloque ? ` · ${m.bloque}` : ""}` : "Sin aula",
      hora_inicio: m.hora_inicio?.slice(0, 5) ?? "",
      hora_fin:    m.hora_fin?.slice(0, 5) ?? ""
    };
  }

  onMount(async () => {
    cargando = true;
    try {
      const res = await fetch(`${API}/monitorias/tutor/${idTutor}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      monitorias = (await res.json()).map(normalizar);
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  });

  const FILTROS = [
    { id: "todas",      label: "Todas"      },
    { id: "pendiente",  label: "Pendientes" },
    { id: "programada", label: "Programadas"},
    { id: "completada", label: "Completadas"},
    { id: "cancelada",  label: "Canceladas" },
    { id: "rechazada",  label: "Rechazadas" }
  ];

  let monitoriasFiltradas = $derived(
    filtro === "todas" ? monitorias : monitorias.filter(m => m.estado === filtro)
  );

  let conteos = $derived(
    FILTROS.reduce((acc, f) => {
      acc[f.id] = f.id === "todas" ? monitorias.length : monitorias.filter(m => m.estado === f.id).length;
      return acc;
    }, {})
  );

  function formatFecha(fecha) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-CO", {
      weekday: "short", day: "2-digit", month: "short"
    });
  }
</script>

<div class="page">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h2 class="section-title">Sesiones agendadas</h2>
      <p class="section-sub">Revisa tus monitorías asignadas</p>
    </div>
    <div class="badge-pill">{monitoriasFiltradas.length} sesiones</div>
  </div>

  <!-- ERROR -->
  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" onclick={() => error = ""}>✕</button>
    </div>
  {/if}

  <!-- FILTROS -->
  <div class="filtros">
    {#each FILTROS as f}
      <button class="filtro-btn" class:active={filtro === f.id} onclick={() => filtro = f.id}>
        {f.label}
        {#if conteos[f.id] > 0}
          <span class="filtro-count">{conteos[f.id]}</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- LOADING -->
  {#if cargando}
    <div class="empty-state"><div class="spinner"></div></div>

  <!-- EMPTY -->
  {:else if monitoriasFiltradas.length === 0}
    <div class="empty-state">
      <i class="bi bi-journal-x empty-icon"></i>
      <p>No hay sesiones{filtro !== "todas" ? ` con estado "${FILTROS.find(f => f.id === filtro)?.label.toLowerCase()}"` : ""}</p>
    </div>

  <!-- TABLA desktop / CARDS mobile -->
  {:else}

    <!-- Tabla (pantallas grandes) -->
    <div class="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Estudiante</th>
            <th>Materia</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Aula</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {#each monitoriasFiltradas as m, i}
            {@const st = ESTADOS[m.estado] ?? ESTADOS.pendiente}
            <tr>
              <td class="muted">{i + 1}</td>
              <td>
                <div class="name-cell">
                  <div class="avatar">{m.estudiante?.[0] ?? "?"}</div>
                  <span class="fw">{m.estudiante}</span>
                </div>
              </td>
              <td class="hint">{m.materia}</td>
              <td class="hint">{formatFecha(m.fecha)}</td>
              <td class="hint">{m.hora_inicio} - {m.hora_fin}</td>
              <td class="hint">{m.aula}</td>
              <td>
                <span class="estado-badge" style="background:{st.bg};color:{st.color}">
                  <i class="bi {st.icon}"></i>{st.label}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Cards (móvil) -->
    <div class="cards-mobile">
      {#each monitoriasFiltradas as m, i}
        {@const st = ESTADOS[m.estado] ?? ESTADOS.pendiente}
        <div class="session-card">
          <div class="session-card-top">
            <div class="name-cell">
              <div class="avatar">{m.estudiante?.[0] ?? "?"}</div>
              <div>
                <span class="fw">{m.estudiante}</span>
                <span class="hint" style="display:block;font-size:11px">{m.materia}</span>
              </div>
            </div>
            <span class="estado-badge" style="background:{st.bg};color:{st.color}">
              <i class="bi {st.icon}"></i>{st.label}
            </span>
          </div>
          <div class="session-card-meta">
            <span><i class="bi bi-calendar3"></i> {formatFecha(m.fecha)}</span>
            <span><i class="bi bi-clock"></i> {m.hora_inicio} - {m.hora_fin}</span>
            <span><i class="bi bi-geo-alt"></i> {m.aula}</span>
          </div>
        </div>
      {/each}
    </div>

  {/if}
</div>

<style>
  .page { display:flex; flex-direction:column; gap:1.25rem; }

  .page-header {
    display:flex; align-items:flex-start;
    justify-content:space-between; gap:.5rem; flex-wrap:wrap;
  }
  .section-title { font-size:16px; font-weight:500; margin:0 0 3px; }
  .section-sub   { font-size:13px; color:#888; margin:0; }

  .badge-pill {
    background:#EEF0FF; color:#010A55;
    font-size:11px; font-weight:500;
    padding:4px 12px; border-radius:20px; white-space:nowrap;
  }

  .alert {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 14px; border-radius:8px; font-size:13px;
  }
  .alert-danger  { background:#FCEBEB; color:#A32D2D; border:.5px solid #F09595; }
  .alert-close   { background:none; border:none; cursor:pointer; color:inherit; }

  /* ── FILTROS ── */
  .filtros {
    display:flex; gap:4px; flex-wrap:wrap;
    background:#fff; border:.5px solid rgba(0,0,0,.08);
    border-radius:10px; padding:6px;
    overflow-x:auto; -webkit-overflow-scrolling:touch;
  }
  .filtro-btn {
    display:flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:7px; border:none;
    background:transparent; font-size:12px; color:#888;
    cursor:pointer; transition:.12s; white-space:nowrap;
  }
  .filtro-btn:hover     { background:#f5f5f3; color:#333; }
  .filtro-btn.active    { background:#010A55; color:white; }
  .filtro-count         { background:rgba(255,255,255,.25); font-size:10px; font-weight:600; padding:1px 6px; border-radius:10px; }
  .filtro-btn:not(.active) .filtro-count { background:rgba(0,0,0,.08); color:#666; }

  /* ── TABLA (desktop) ── */
  .card       { background:white; border:.5px solid rgba(0,0,0,.08); border-radius:12px; overflow:hidden; }
  .table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }

  table       { width:100%; border-collapse:collapse; min-width:560px; }
  thead th    { padding:10px 1.25rem; background:#fafafa; font-size:11px; font-weight:500; color:#888; text-align:left; border-bottom:.5px solid rgba(0,0,0,.08); }
  tbody tr    { border-bottom:.5px solid rgba(0,0,0,.06); }
  tbody tr:last-child { border-bottom:none; }
  tbody tr:hover { background:#fafafa; }
  td          { padding:12px 1.25rem; font-size:13px; vertical-align:middle; }
  .muted      { color:#aaa; font-size:12px; }
  .hint       { color:#666; font-size:12px; }
  .fw         { font-weight:500; }

  .name-cell  { display:flex; align-items:center; gap:8px; }
  .avatar     {
    width:28px; height:28px; border-radius:50%;
    background:#EEF0FF; color:#010A55;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:600; flex-shrink:0;
  }

  .estado-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 10px; border-radius:20px;
    font-size:11px; font-weight:500;
  }

  /* ── CARDS (móvil) ── */
  .cards-mobile { display:none; flex-direction:column; gap:10px; }

  .session-card {
    background:#fff; border:.5px solid rgba(0,0,0,.08);
    border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px;
  }
  .session-card-top {
    display:flex; align-items:flex-start;
    justify-content:space-between; gap:8px; flex-wrap:wrap;
  }
  .session-card-meta {
    display:flex; gap:10px; flex-wrap:wrap;
    font-size:12px; color:#666;
  }
  .session-card-meta span { display:flex; align-items:center; gap:4px; }

  /* ── EMPTY / SPINNER ── */
  .empty-state {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px; padding:3rem;
    color:#aaa; font-size:13px;
  }
  .empty-icon { font-size:2rem; }
  .spinner    {
    width:26px; height:26px;
    border:3px solid rgba(1,10,85,.12); border-top-color:#010A55;
    border-radius:50%; animation:spin .7s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .table-wrap  { display:none; }           /* ocultar tabla */
    .cards-mobile { display:flex; }          /* mostrar cards */

    .filtros { gap:3px; padding:5px; }
    .filtro-btn { padding:5px 10px; font-size:11px; }
  }
</style>