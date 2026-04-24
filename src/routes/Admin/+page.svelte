<script>
  import "bootstrap/dist/css/bootstrap.min.css";
  import { onMount } from "svelte";
  import CrudUsuarios from "$lib/components/CrudUsuarios.svelte";
  import CrudMaterias from "$lib/components/CrudMaterias.svelte";
  import CrudTutores from "$lib/components/CrudTutores.svelte";

  let modulo = $state("dashboard");

  let grupos = $state({
    gestion: true,
  });

  const meta = {
    dashboard:    { titulo: "Dashboard",           crumb: "Inicio / Dashboard" },
    usuarios:     { titulo: "Gestión de Usuarios", crumb: "Gestión / Usuarios" },
    materias:     { titulo: "Gestión de Materias", crumb: "Gestión / Materias" },
    tutores:      { titulo: "Gestión de Tutores",  crumb: "Gestión / Tutores" },

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
      
      <div style="position: relative; width: 100%; padding-bottom: 62%;">
        <iframe 
          title="primer dashboard"
          src="https://app.powerbi.com/reportEmbed?reportId=dad9ee80-7bec-4fb7-8b0f-477937a604e3&autoAuth=true&ctid=740be6bd-fd36-470e-94d9-0f0c777fadb9"
          frameborder="0"
          allowFullScreen="true"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
        </iframe>
      </div>

      {:else if modulo === "usuarios"}
        <CrudUsuarios />

      {:else if modulo === "materias"}
        <CrudMaterias />
      
      {:else if modulo === "tutores"}
        <CrudTutores />

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