<script>
  import { onMount } from "svelte";

  let { idEstudiante } = $props();

  const API = "http://127.0.0.1:8000";

  let monitorias = $state([]);
  let cargando   = $state(true);
  let error      = $state("");
  let filtro     = $state("todas");   // "todas" | "pendiente" | "confirmada" | "completada" | "cancelada"

  const FILTROS = [
    { id: "todas",      label: "Todas"       },
    { id: "pendiente",  label: "Pendientes"  },
    { id: "confirmada", label: "Confirmadas" },
    { id: "completada", label: "Completadas" },
    { id: "cancelada",  label: "Canceladas"  },
  ];

  const STATUS_META = {
    pendiente:  { color: "#7D5A00", bg: "#FFF8E1", border: "#FFDD80", label: "Pendiente",  icon: "bi-hourglass-split" },
    confirmada: { color: "#085041", bg: "#E1F5EE", border: "#5DCAA5", label: "Confirmada", icon: "bi-calendar-check"  },
    completada: { color: "#2D4E8A", bg: "#EEF0FF", border: "#8899EE", label: "Completada", icon: "bi-patch-check"     },
    cancelada:  { color: "#A32D2D", bg: "#FCEBEB", border: "#F09595", label: "Cancelada",  icon: "bi-x-circle"        },
  };

  onMount(async () => {
    try {
      const res = await fetch(`${API}/monitorias/estudiante/${idEstudiante}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      monitorias = await res.json();
      /*
        Espera: [{
          id, materia_nombre, monitor_nombre, monitor_apellido,
          dia, hora_inicio, estado,   // pendiente | confirmada | completada | cancelada
          calificacion, comentario     // solo si completada
        }]
      */
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  });

  let monitoriasFiltradas = $derived(
    filtro === "todas"
      ? monitorias
      : monitorias.filter(m => m.estado === filtro)
  );

  // Contadores por estado para los badges del filtro
  let conteos = $derived(
    FILTROS.reduce((acc, f) => {
      acc[f.id] = f.id === "todas"
        ? monitorias.length
        : monitorias.filter(m => m.estado === f.id).length;
      return acc;
    }, {})
  );
</script>

<div class="page">

  <div class="page-header">
    <div>
      <h2 class="section-title">Mis monitorías</h2>
      <p class="section-sub">Revisa el estado de tus sesiones solicitadas y asignadas</p>
    </div>
  </div>

  {#if error}
    <div class="alert alert-danger">{error}<button class="alert-close" onclick={() => error=""}>✕</button></div>
  {/if}

  <!-- Filtros tab -->
  <div class="filtros">
    {#each FILTROS as f}
      <button
        class="filtro-btn"
        class:active={filtro === f.id}
        onclick={() => filtro = f.id}
      >
        {f.label}
        {#if conteos[f.id] > 0}
          <span class="filtro-count">{conteos[f.id]}</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if cargando}
    <div class="empty-state"><div class="spinner"></div></div>

  {:else if monitoriasFiltradas.length === 0}
    <div class="empty-state">
      <i class="bi bi-journal-x empty-icon"></i>
      <p>No tienes monitorías {filtro !== "todas" ? `con estado "${FILTROS.find(f=>f.id===filtro)?.label.toLowerCase()}"` : "registradas"}.</p>
    </div>

  {:else}
    <div class="lista">
      {#each monitoriasFiltradas as m}
        {@const st = STATUS_META[m.estado] ?? STATUS_META.pendiente}
        <div class="card">

          <div class="card-left">
            <div class="materia-icon"><i class="bi bi-book-half"></i></div>
            <div class="card-info">
              <span class="materia-nombre">{m.materia_nombre}</span>
              <span class="monitor-nombre">
                <i class="bi bi-person"></i>
                {m.monitor_nombre} {m.monitor_apellido}
              </span>
              <span class="horario">
                <i class="bi bi-clock"></i>
                {m.dia} · {m.hora_inicio}
              </span>
            </div>
          </div>

          <div class="card-right">
            <span
              class="status-badge"
              style="background:{st.bg}; color:{st.color}; border-color:{st.border}"
            >
              <i class="bi {st.icon}"></i>
              {st.label}
            </span>

            {#if m.estado === "completada" && m.calificacion}
              <div class="rating">
                {#each [1,2,3,4,5] as n}
                  <i class="bi bi-star{n <= m.calificacion ? '-fill' : ''} star" class:filled={n <= m.calificacion}></i>
                {/each}
              </div>
            {/if}
          </div>

        </div>
      {/each}
    </div>
  {/if}

</div>

<style>
  .page { display: flex; flex-direction: column; gap: 1.25rem; }

  .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
  .section-title { font-size: 16px; font-weight: 500; margin: 0 0 3px; }
  .section-sub   { font-size: 13px; color: #888; margin: 0; }

  /* Alerts */
  .alert { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:8px; font-size:13px; }
  .alert-danger { background:#FCEBEB; color:#A32D2D; border:0.5px solid #F09595; }
  .alert-close  { background:none; border:none; cursor:pointer; font-size:14px; color:inherit; }

  /* Filtros */
  .filtros {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 10px;
    padding: 6px;
  }

  .filtro-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 7px;
    border: none;
    background: transparent;
    font-size: 12px;
    color: #888;
    cursor: pointer;
    transition: background .12s, color .12s;
  }
  .filtro-btn:hover  { background: #f5f5f3; color: #333; }
  .filtro-btn.active { background: #010A55; color: #fff; }

  .filtro-count {
    background: rgba(255,255,255,0.25);
    color: inherit;
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
  }
  .filtro-btn:not(.active) .filtro-count {
    background: rgba(0,0,0,0.08);
    color: #666;
  }

  /* Lista */
  .lista { display: flex; flex-direction: column; gap: .625rem; }

  .card {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    transition: box-shadow .15s;
  }
  .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

  .card-left { display: flex; align-items: center; gap: 12px; }

  .materia-icon {
    width: 38px; height: 38px;
    border-radius: 9px;
    background: #EEF0FF;
    display: flex; align-items: center; justify-content: center;
    color: #010A55;
    font-size: 16px;
    flex-shrink: 0;
  }

  .card-info { display: flex; flex-direction: column; gap: 3px; }
  .materia-nombre { font-size: 14px; font-weight: 500; color: #222; }
  .monitor-nombre, .horario {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #999;
  }

  .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    border: 0.5px solid;
    white-space: nowrap;
  }

  .rating { display: flex; gap: 2px; }
  .star { font-size: 12px; color: #ddd; }
  .star.filled { color: #F5A623; }

  /* Empty / spinner */
  .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:3rem; color:#aaa; font-size:13px; }
  .empty-icon  { font-size: 2rem; }
  .spinner { width:26px; height:26px; border:3px solid rgba(1,10,85,0.12); border-top-color:#010A55; border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>