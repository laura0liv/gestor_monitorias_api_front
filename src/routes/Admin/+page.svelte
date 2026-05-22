<script>
  import { onMount } from "svelte";
  import { usuario } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import CrudUsuarios from '$lib/components/Admin/CrudUsuarios.svelte';
  import CrudMaterias from '$lib/components/Admin/CrudMaterias.svelte';
  import CrudTutores  from '$lib/components/Admin/CrudTutores.svelte';

  let modulo = $state("dashboard");
  let user = $state(null);
  let grupos = $state({ gestion: true });
  let sidebarOpen = $state(false);

  onMount(() => {
    usuario.init();
    let valorActual;
    const unsub = usuario.subscribe(val => { valorActual = val; });
    unsub();
    if (!valorActual) { goto('/Login'); return; }
    if (String(valorActual.id_rol) !== '1') { goto('/Login'); return; }
    user = valorActual;
  });

  const meta = {
    dashboard: { titulo: "Dashboard",  crumb: "Admin / Dashboard" },
    usuarios:  { titulo: "Usuarios",   crumb: "Admin / Usuarios"  },
    materias:  { titulo: "Materias",   crumb: "Admin / Materias"  },
    tutores:   { titulo: "Tutores",    crumb: "Admin / Tutores"   },
  };

  const gestionItems = [
    { id: "usuarios", label: "Usuarios", icon: "bi-people"       },
    { id: "materias", label: "Materias", icon: "bi-book"         },
    { id: "tutores",  label: "Tutores",  icon: "bi-person-badge" },
  ];

  let tituloActual = $derived(meta[modulo]?.titulo ?? modulo);
  let crumbActual  = $derived(meta[modulo]?.crumb  ?? modulo);

  function navegar(id) {
    modulo = id;
    sidebarOpen = false;
  }
</script>

{#if user}
<div class="layout">

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="overlay"
    style="display: {sidebarOpen ? 'block' : 'none'};"
    onclick={() => sidebarOpen = false}
  ></div>

  <aside class="sidebar" style="transform: {sidebarOpen ? 'translateX(0)' : ''};">
    <div class="sidebar-brand">
      <div class="brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
      <div>
        <div class="brand-name">Monitorías</div>
        <div class="brand-sub">Panel de administración</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <button
        class="nav-item"
        class:active={modulo === "dashboard"}
        onclick={() => navegar("dashboard")}
      >
        <i class="bi bi-grid"></i>
        <span>Dashboard</span>
      </button>

      <div class="nav-group">
        <button class="nav-group-toggle" onclick={() => grupos.gestion = !grupos.gestion}>
          <span class="nav-group-label">Gestión</span>
          <i class="bi" class:bi-chevron-down={grupos.gestion} class:bi-chevron-right={!grupos.gestion}></i>
        </button>

        {#if grupos.gestion}
          <div class="nav-group-items">
            {#each gestionItems as item}
              <button
                class="nav-item nav-item-sub"
                class:active={modulo === item.id}
                onclick={() => navegar(item.id)}
              >
                <i class="bi {item.icon}"></i>
                <span>{item.label}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="nav-item logout-btn"
        onclick={() => { usuario.logout(); goto('/Login'); }}>
        <i class="bi bi-box-arrow-left"></i>
        <span>Cerrar sesión</span>
      </button>
      <div class="version">v1.0.0</div>
    </div>
  </aside>

  <div class="main">
    <header class="topbar">
      <div class="topbar-left">
        <button class="hamburger" onclick={() => sidebarOpen = !sidebarOpen} aria-label="Abrir menú">
          <i class="bi bi-list"></i>
        </button>
        <div>
          <h1 class="topbar-title">{tituloActual}</h1>
          <div class="breadcrumb">
            {#each crumbActual.split(" / ") as parte, i}
              <span class:active={i === crumbActual.split(" / ").length - 1}>{parte}</span>
              {#if i < crumbActual.split(" / ").length - 1}
                <span class="sep">/</span>
              {/if}
            {/each}
          </div>
        </div>
      </div>
      <div class="topbar-right">
        <span class="role-badge">Administrador</span>
        <div class="topbar-avatar">{user.nombre[0]}</div>
      </div>
    </header>

    <main class="content">
      {#if modulo === "dashboard"}
        <div class="dashboard-embed">
          <iframe
            title="Dashboard Power BI"
            src="https://app.powerbi.com/reportEmbed?reportId=dad9ee80-7bec-4fb7-8b0f-477937a604e3&autoAuth=true&ctid=740be6bd-fd36-470e-94d9-0f0c777fadb9"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </div>
      {:else if modulo === "usuarios"}
        <CrudUsuarios />
      {:else if modulo === "materias"}
        <CrudMaterias />
      {:else if modulo === "tutores"}
        <CrudTutores />
      {:else}
        <div class="placeholder-card">
          <i class="bi bi-tools placeholder-icon"></i>
          <h6>{tituloActual}</h6>
          <p>Módulo en construcción.</p>
        </div>
      {/if}
    </main>
  </div>

</div>
{/if}

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }

  .layout { display: flex; min-height: 100vh; padding-top: 68px; background: #f5f5f3; }

  .overlay {
    position: fixed; inset: 0; top: 68px;
    background: rgba(0,0,0,0.45);
    z-index: 99;
  }

  .sidebar {
    width: 220px; min-width: 220px;
    background: #010A55;
    display: flex; flex-direction: column;
    transition: transform .25s ease;
  }

  .sidebar-brand {
    display: flex; align-items: center; gap: 10px;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .brand-icon {
    width: 36px; height: 36px; border-radius: 9px;
    background: rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 16px; flex-shrink: 0;
  }

  .brand-name { font-size: 13px; font-weight: 600; color: #fff; line-height: 1.3; }
  .brand-sub {
    font-size: 10px; color: rgba(255,255,255,0.4);
    margin-top: 1px; text-transform: uppercase; letter-spacing: .04em;
  }

  .sidebar-nav {
    flex: 1; padding: .75rem .5rem;
    display: flex; flex-direction: column; gap: 2px; overflow-y: auto;
  }

  .nav-item {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 8px 12px; border-radius: 7px;
    border: none; background: transparent;
    color: rgba(255,255,255,0.6); font-size: 13px;
    cursor: pointer; text-align: left;
    transition: background .15s, color .15s;
  }
  .nav-item:hover  { background: rgba(255,255,255,0.08); color: #fff; }
  .nav-item.active { background: rgba(255,255,255,0.14); color: #fff; }
  .nav-item i { font-size: 14px; flex-shrink: 0; }

  .nav-item-sub { padding: 7px 10px 7px 14px; font-size: 12px; }

  .nav-group { display: flex; flex-direction: column; gap: 1px; margin-top: 4px; }

  .nav-group-toggle {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 5px 12px;
    border: none; background: transparent; cursor: pointer;
  }

  .nav-group-label {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase; letter-spacing: .08em;
  }

  .nav-group-toggle i { font-size: 9px; color: rgba(255,255,255,0.25); }

  .nav-group-items {
    display: flex; flex-direction: column; gap: 1px;
    padding-left: 8px;
    border-left: 1px solid rgba(255,255,255,0.08);
    margin-left: 12px;
  }

  .logout-btn { border: none !important; cursor: pointer; }

  .sidebar-footer {
    padding: .75rem .5rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex; flex-direction: column; gap: 2px;
  }

  .version { font-size: 11px; color: rgba(255,255,255,0.25); padding: 4px 12px 0; }

  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  .topbar {
    background: #fff;
    border-bottom: 0.5px solid rgba(0,0,0,0.08);
    padding: .875rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
  }

  .topbar-left { display: flex; align-items: center; gap: 10px; }

  .hamburger {
    display: none;
    background: none; border: none; cursor: pointer;
    font-size: 24px; color: #010A55;
    padding: 2px 6px; line-height: 1;
    align-items: center; justify-content: center;
  }

  .topbar-title { font-size: 16px; font-weight: 500; margin: 0 0 3px; }

  .breadcrumb { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #aaa; }
  .breadcrumb span.active { color: #555; }
  .breadcrumb .sep { color: #ccc; }

  .topbar-right { display: flex; align-items: center; gap: 8px; }

  .role-badge {
    background: #FDECEA; color: #8B1A1A;
    font-size: 11px; font-weight: 500;
    padding: 3px 10px; border-radius: 20px;
  }

  .topbar-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #010A55;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; color: #fff;
  }

  .content { flex: 1; padding: 1.5rem; overflow-y: auto; }

  .dashboard-embed {
    position: relative; width: 100%; padding-bottom: 62%;
    border-radius: 12px; overflow: hidden;
    border: 0.5px solid rgba(0,0,0,0.08);
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .dashboard-embed iframe {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; border: none;
  }

  .placeholder-card {
    background: #fff; border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 12px; padding: 4rem;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #aaa; text-align: center;
  }
  .placeholder-icon { font-size: 2rem; margin-bottom: .75rem; }
  .placeholder-card h6 { font-size: 14px; font-weight: 500; color: #666; margin: 0 0 4px; }
  .placeholder-card p  { font-size: 13px; margin: 0; }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 68px; left: 0;
      width: 240px;
      height: 100%;
      min-width: unset;
      transform: translateX(-100%);
      z-index: 100;
    }

    .hamburger { display: flex; }

    .topbar { padding: .75rem 1rem; }

    .role-badge { display: none; }

    .content { padding: 1rem; }

    .dashboard-embed { padding-bottom: 75%; }

    .placeholder-card { padding: 2rem 1rem; }
  }

  @media (max-width: 480px) {
    .topbar-title { font-size: 14px; }
    .breadcrumb { display: none; }
  }
</style>