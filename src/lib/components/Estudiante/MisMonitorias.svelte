<script>
  import { onMount } from "svelte";
  import { API } from '$lib/services/api';
  let { idEstudiante } = $props();



  // STATE
  let monitorias = $state([]);
  let cargando   = $state(true);
  let error      = $state("");
  let filtro     = $state("todas");

  // ─────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────

  const DIAS_ES = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ];

  const FILTROS = [
    { id: "todas",      label: "Todas" },
    { id: "pendiente",  label: "Pendientes" },
    { id: "programada", label: "Programadas" },
    { id: "completada", label: "Completadas" },
    { id: "cancelada",  label: "Canceladas" },
    { id: "rechazada",  label: "Rechazadas" }
  ];

  const STATUS_META = {
    pendiente: {
      color: "#7D5A00",
      bg: "#FFF8E1",
      border: "#FFDD80",
      label: "Pendiente",
      icon: "bi-hourglass-split"
    },

    programada: {
      color: "#085041",
      bg: "#E1F5EE",
      border: "#5DCAA5",
      label: "Programada",
      icon: "bi-calendar-check"
    },

    completada: {
      color: "#2D4E8A",
      bg: "#EEF0FF",
      border: "#8899EE",
      label: "Completada",
      icon: "bi-patch-check"
    },

    cancelada: {
      color: "#A32D2D",
      bg: "#FCEBEB",
      border: "#F09595",
      label: "Cancelada",
      icon: "bi-x-circle"
    },

    rechazada: {
      color: "#7A1E1E",
      bg: "#FDEDED",
      border: "#E8A0A0",
      label: "Rechazada",
      icon: "bi-calendar-x"
    }
  };

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  function formatearHora(hora) {
    return hora?.slice(0, 5) ?? "";
  }

  function obtenerDia(fechaStr) {
    if (!fechaStr) return "";

    const fecha = new Date(`${fechaStr}T12:00:00`);

    return DIAS_ES[fecha.getDay()];
  }

  function normalizar(m) {

    const estado = (m.estado ?? "").toLowerCase();

    return {
      ...m,

      id: m.id_monitoria,

      materia_nombre: m.nombre_materia,

      monitor_nombre: m.monitor ?? "",

      dia: obtenerDia(m.fecha),

      hora_inicio: formatearHora(m.hora_inicio),

      hora_fin: formatearHora(m.hora_fin),

      estado
    };
  }

  // ─────────────────────────────────────────────
  // API
  // ─────────────────────────────────────────────

  async function cargarMonitorias() {

    cargando = true;
    error = "";

    try {

      const res = await fetch(
        `${API}/monitorias/estudiante/${idEstudiante}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const raw = await res.json();

      monitorias = raw.map(normalizar);

    } catch (e) {

      error = e.message;

    } finally {

      cargando = false;

    }
  }

  async function cancelarMonitoria(idMonitoria) {

    const confirmar = confirm(
      "¿Deseas cancelar esta monitoría?"
    );

    if (!confirmar) return;

    try {

      const res = await fetch(
        `${API}/monitorias/${idMonitoria}/cancelar/estudiante/${idEstudiante}`,
        {
          method: "PATCH"
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error cancelando monitoría");
      }

      await cargarMonitorias();

    } catch (e) {

      error = e.message;

    }
  }

  onMount(cargarMonitorias);

  // ─────────────────────────────────────────────
  // DERIVED
  // ─────────────────────────────────────────────

  let monitoriasFiltradas = $derived(

    filtro === "todas"
      ? monitorias
      : monitorias.filter(m => m.estado === filtro)

  );

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

  <!-- HEADER -->
  <div class="page-header">

    <div>
      <h2 class="section-title">
        Mis monitorías
      </h2>

      <p class="section-sub">
        Revisa el estado de tus sesiones académicas
      </p>
    </div>

  </div>

  <!-- ERROR -->
  {#if error}

    <div class="alert alert-danger">

      <span>{error}</span>

      <button
        class="alert-close"
        onclick={() => error = ""}
      >
        ✕
      </button>

    </div>

  {/if}

  <!-- FILTROS -->
  <div class="filtros">

    {#each FILTROS as f}

      <button
        class="filtro-btn"
        class:active={filtro === f.id}
        onclick={() => filtro = f.id}
      >

        {f.label}

        {#if conteos[f.id] > 0}

          <span class="filtro-count">
            {conteos[f.id]}
          </span>

        {/if}

      </button>

    {/each}

  </div>

  <!-- LOADING -->
  {#if cargando}

    <div class="empty-state">

      <div class="spinner"></div>

    </div>

  <!-- EMPTY -->
  {:else if monitoriasFiltradas.length === 0}

    <div class="empty-state">

      <i class="bi bi-journal-x empty-icon"></i>

      <p>
        No tienes monitorías
        {filtro !== "todas"
          ? ` ${FILTROS.find(f => f.id === filtro)?.label.toLowerCase()}`
          : ""}
      </p>

    </div>

  <!-- LIST -->
  {:else}

    <div class="lista">

      {#each monitoriasFiltradas as m}

        {@const st = STATUS_META[m.estado] ?? STATUS_META.pendiente}

        <div class="card">

          <!-- LEFT -->
          <div class="card-left">

            <div class="materia-icon">
              <i class="bi bi-book-half"></i>
            </div>

            <div class="card-info">

              <span class="materia-nombre">
                {m.materia_nombre}
              </span>

              <span class="monitor-nombre">

                <i class="bi bi-person"></i>

                {m.monitor_nombre}

              </span>

              <span class="horario">

                <i class="bi bi-clock"></i>

                {m.dia}
                ·
                {m.hora_inicio}
                -
                {m.hora_fin}

              </span>

              {#if m.modalidad}

                <span class="modalidad">

                  <i class="bi bi-camera-video"></i>

                  {m.modalidad}

                </span>

              {/if}

              {#if m.nombre_aula}

                <span class="aula">

                  <i class="bi bi-building"></i>

                  {m.nombre_aula}
                  {#if m.bloque}
                    · Bloque {m.bloque}
                  {/if}

                </span>

              {/if}

            </div>

          </div>

          <!-- RIGHT -->
          <div class="card-right">

            <span
              class="status-badge"
              style="
                background:{st.bg};
                color:{st.color};
                border-color:{st.border}
              "
            >

              <i class="bi {st.icon}"></i>

              {st.label}

            </span>

            <!-- CANCELAR -->
            {#if m.estado === "pendiente"}

              <button
                class="btn-cancelar"
                onclick={() => cancelarMonitoria(m.id)}
              >
                Cancelar
              </button>

            {/if}

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
    justify-content: space-between;
    align-items: flex-start;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px;
  }

  .section-sub {
    font-size: 13px;
    color: #888;
    margin: 0;
  }

  .alert {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    border: none;
    background: none;
    cursor: pointer;
    color: inherit;
  }

  .filtros {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    padding: 6px;
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 10px;
  }

  .filtro-btn {
    border: none;
    background: transparent;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    color: #777;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filtro-btn:hover {
    background: #f5f5f5;
  }

  .filtro-btn.active {
    background: #010A55;
    color: white;
  }

  .filtro-count {
    background: rgba(255,255,255,0.25);
    padding: 1px 6px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
  }

  .lista {
    display: flex;
    flex-direction: column;
    gap: .75rem;
  }

  .card {
    background: white;
    border-radius: 12px;
    border: 0.5px solid rgba(0,0,0,0.08);
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    transition: .15s ease;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .materia-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #EEF0FF;
    color: #010A55;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .materia-nombre {
    font-size: 14px;
    font-weight: 600;
    color: #222;
  }

  .monitor-nombre,
  .horario,
  .modalidad,
  .aula {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #888;
  }

  .card-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 20px;
    border: 0.5px solid;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
  }

  .btn-cancelar {
    border: none;
    background: #FCEBEB;
    color: #A32D2D;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
  }

  .btn-cancelar:hover {
    background: #f8dada;
  }

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

  @media (max-width: 768px) {

    .card {
      flex-direction: column;
      align-items: flex-start;
    }

    .card-right {
      width: 100%;
      align-items: flex-start;
    }

  }

</style>