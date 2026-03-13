<script>
  import "bootstrap/dist/css/bootstrap.min.css";
  import { onMount } from "svelte";
  import CrudUsuarios from "$lib/components/CrudUsuarios.svelte";
  import CrudMaterias from "$lib/components/CrudMaterias.svelte";

  let modulo = $state("dashboard");

  let grupos = $state({
    gestion: true,
    tutorias: true,
    reportes: true,
  });

  const meta = {
    dashboard:    { titulo: "Dashboard",           crumb: "Inicio / Dashboard" },
    usuarios:     { titulo: "Gestión de Usuarios", crumb: "Gestión / Usuarios" },
    materias:     { titulo: "Gestión de Materias", crumb: "Gestión / Materias" },
    tutores:      { titulo: "Gestión de Tutores",  crumb: "Gestión / Tutores" },
    sesiones:     { titulo: "Sesiones",            crumb: "Tutorías / Sesiones" },
    solicitudes:  { titulo: "Solicitudes",         crumb: "Tutorías / Solicitudes" },
    horarios:     { titulo: "Horarios",            crumb: "Tutorías / Horarios" },
    estadisticas: { titulo: "Estadísticas",        crumb: "Reportes / Estadísticas" },
    asistencia:   { titulo: "Asistencia",          crumb: "Reportes / Asistencia" },
    rendimiento:  { titulo: "Rendimiento",         crumb: "Reportes / Rendimiento" },
  };

  let tituloActual = $derived(meta[modulo]?.titulo ?? modulo);
  let crumbActual  = $derived(meta[modulo]?.crumb  ?? modulo);

  onMount(async () => {
    const bootstrap = await import("bootstrap");
    return () => {};
  });
</script>

<div class="d-flex" style="min-height: 100vh;">

  <!-- SIDEBAR -->
  <nav class="d-flex flex-column bg-dark text-white" style="width: 240px; min-width: 240px;">

    <!-- Header -->
    <div class="px-3 py-3 border-bottom border-secondary">
      <small class="text-uppercase text-secondary" style="letter-spacing: .08em; font-size: 11px;">Sistema</small>
      <div class="fw-semibold fs-6 mt-1">Tutorías Admin</div>
    </div>

    <!-- Nav -->
    <div class="flex-grow-1 overflow-auto py-2">

      <!-- Dashboard -->
      <button
        class="btn btn-link text-decoration-none w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
        class:text-white={modulo !== "dashboard"}
        class:active={modulo === "dashboard"}
        style={modulo === "dashboard" ? "color:#fff; background:rgba(255,255,255,0.12); border-radius:6px;" : "color:rgba(255,255,255,0.65);"}
        onclick={() => modulo = "dashboard"}
      >
        <i class="bi bi-grid-fill" style="font-size:14px"></i>
        Dashboard
      </button>

      <!-- Grupo Gestión -->
      <div class="mt-1">
        <button
          class="btn btn-link text-decoration-none w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
          style="color:rgba(255,255,255,0.65);"
          onclick={() => grupos.gestion = !grupos.gestion}
        >
          <i class="bi bi-people-fill" style="font-size:14px"></i>
          <span class="flex-grow-1">Gestión</span>
          <i class="bi" class:bi-chevron-down={grupos.gestion} class:bi-chevron-right={!grupos.gestion} style="font-size:11px"></i>
        </button>
        {#if grupos.gestion}
          <div class="ms-3 border-start border-secondary ps-2">
            {#each ["usuarios","materias","tutores"] as m}
              <button
                class="btn btn-link text-decoration-none w-100 text-start px-2 py-1"
                style={modulo === m
                  ? "color:#fff; background:rgba(255,255,255,0.12); border-radius:6px; font-size:13px;"
                  : "color:rgba(255,255,255,0.55); font-size:13px;"}
                onclick={() => modulo = m}
              >
                {meta[m].titulo}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Grupo Tutorías -->
      <div class="mt-1">
        <button
          class="btn btn-link text-decoration-none w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
          style="color:rgba(255,255,255,0.65);"
          onclick={() => grupos.tutorias = !grupos.tutorias}
        >
          <i class="bi bi-journal-text" style="font-size:14px"></i>
          <span class="flex-grow-1">Tutorías</span>
          <i class="bi" class:bi-chevron-down={grupos.tutorias} class:bi-chevron-right={!grupos.tutorias} style="font-size:11px"></i>
        </button>
        {#if grupos.tutorias}
          <div class="ms-3 border-start border-secondary ps-2">
            {#each ["sesiones","solicitudes","horarios"] as m}
              <button
                class="btn btn-link text-decoration-none w-100 text-start px-2 py-1"
                style={modulo === m
                  ? "color:#fff; background:rgba(255,255,255,0.12); border-radius:6px; font-size:13px;"
                  : "color:rgba(255,255,255,0.55); font-size:13px;"}
                onclick={() => modulo = m}
              >
                {meta[m].titulo}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Grupo Reportes -->
      <div class="mt-1">
        <button
          class="btn btn-link text-decoration-none w-100 text-start px-3 py-2 d-flex align-items-center gap-2"
          style="color:rgba(255,255,255,0.65);"
          onclick={() => grupos.reportes = !grupos.reportes}
        >
          <i class="bi bi-bar-chart-fill" style="font-size:14px"></i>
          <span class="flex-grow-1">Reportes</span>
          <i class="bi" class:bi-chevron-down={grupos.reportes} class:bi-chevron-right={!grupos.reportes} style="font-size:11px"></i>
        </button>
        {#if grupos.reportes}
          <div class="ms-3 border-start border-secondary ps-2">
            {#each ["estadisticas","asistencia","rendimiento"] as m}
              <button
                class="btn btn-link text-decoration-none w-100 text-start px-2 py-1"
                style={modulo === m
                  ? "color:#fff; background:rgba(255,255,255,0.12); border-radius:6px; font-size:13px;"
                  : "color:rgba(255,255,255,0.55); font-size:13px;"}
                onclick={() => modulo = m}
              >
                {meta[m].titulo}
              </button>
            {/each}
          </div>
        {/if}
      </div>

    </div>

    <!-- Footer del sidebar -->
    <div class="px-3 py-3 border-top border-secondary">
      <small class="text-secondary" style="font-size:12px">v1.0.0</small>
    </div>

  </nav>

  <!-- MAIN -->
  <div class="d-flex flex-column flex-grow-1 bg-light">

    <!-- TOPBAR -->
    <header class="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between shadow-sm">
      <div>
        <h5 class="mb-0 fw-semibold">{tituloActual}</h5>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0" style="font-size:12px;">
            {#each crumbActual.split(" / ") as parte, i}
              <li class="breadcrumb-item" class:active={i === crumbActual.split(" / ").length - 1}>
                {parte}
              </li>
            {/each}
          </ol>
        </nav>
      </div>
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-secondary">Admin</span>
        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
             style="width:34px;height:34px;font-size:13px;">A</div>
      </div>
    </header>

    <!-- CONTENIDO -->
    <main class="flex-grow-1 p-4 overflow-auto">

      {#if modulo === "dashboard"}
        <div class="row g-3 mb-4">
          {#each [
            { label: "Usuarios", valor: "248", icono: "bi-people-fill",     color: "primary" },
            { label: "Tutorías activas", valor: "63", icono: "bi-journal-check", color: "success" },
            { label: "Materias",  valor: "34",  icono: "bi-book-fill",        color: "warning" },
            { label: "Completación", valor: "87%", icono: "bi-graph-up",     color: "info"    },
          ] as card}
            <div class="col-6 col-xl-3">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body d-flex align-items-center gap-3">
                  <div class="rounded-3 p-3 bg-{card.color} bg-opacity-10">
                    <i class="bi {card.icono} text-{card.color} fs-4"></i>
                  </div>
                  <div>
                    <div class="text-muted" style="font-size:12px">{card.label}</div>
                    <div class="fw-semibold fs-5">{card.valor}</div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white fw-semibold border-bottom">Sesiones recientes</div>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr><th>Estudiante</th><th>Materia</th><th>Fecha</th><th>Estado</th></tr>
              </thead>
              <tbody>
                <tr><td>Ana López</td><td>Cálculo I</td><td>13 Mar 2026</td><td><span class="badge bg-success">Completada</span></td></tr>
                <tr><td>Mario Ruiz</td><td>Física II</td><td>13 Mar 2026</td><td><span class="badge bg-primary">En curso</span></td></tr>
                <tr><td>Clara Pino</td><td>Álgebra</td><td>14 Mar 2026</td><td><span class="badge bg-warning text-dark">Pendiente</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>

      {:else if modulo === "usuarios"}
        <CrudUsuarios />

      {:else if modulo === "materias"}
        <CrudMaterias />

      {:else}
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5 text-muted">
            <i class="bi bi-tools fs-1 d-block mb-3"></i>
            <h6>{tituloActual}</h6>
            <p class="small mb-0">Módulo en construcción.</p>
          </div>
        </div>
      {/if}

    </main>
  </div>
</div>