<script>
  import { onMount } from "svelte";
  import { usuario } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import MateriasDisponibles from "$lib/components/Estudiante/MateriasDisponibles.svelte";
  import SolicitarMonitoria  from "$lib/components/Estudiante/SolicitarMonitoria.svelte";
  import MisMonitorias       from "$lib/components/Estudiante/MisMonitorias.svelte";

  let modulo = $state("materias");
  let user = $state(null);

  onMount(() => {
    usuario.init();

    let valorActual;
    const unsub = usuario.subscribe(val => { valorActual = val; });
    unsub();

    if (!valorActual) { goto('/Login'); return; }
    if (String(valorActual.id_rol) !== '3') { goto('/Login'); return; }

    user = valorActual;
  });

  const meta = {
    materias:  { titulo: "Materias disponibles",  crumb: "Estudiante / Materias"   },
    solicitar: { titulo: "Solicitar monitoría",   crumb: "Estudiante / Solicitar"  },
    mis:       { titulo: "Mis monitorías",        crumb: "Estudiante / Monitorías" },
  };

  const nav = [
    { id: "materias",  label: "Materias disponibles", icon: "bi-mortarboard"      },
    { id: "solicitar", label: "Solicitar monitoría",  icon: "bi-plus-circle"      },
    { id: "mis",       label: "Mis monitorías",       icon: "bi-journal-bookmark" },
  ];

  let tituloActual = $derived(meta[modulo]?.titulo ?? modulo);
  let crumbActual  = $derived(meta[modulo]?.crumb  ?? modulo);
</script>

{#if user}
<div class="layout">

  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-avatar">{user.nombre[0]}{user.apellido[0]}</div>
      <div>
        <div class="sidebar-name">{user.nombre} {user.apellido}</div>
        <div class="sidebar-role">Estudiante</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      {#each nav as item}
        <button
          class="nav-item"
          class:active={modulo === item.id}
          onclick={() => modulo = item.id}
        >
          <i class="bi {item.icon}"></i>
          <span>{item.label}</span>
        </button>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <button class="nav-item" style="border:none; cursor:pointer;"
        onclick={() => { usuario.logout(); goto('/Login'); }}>
        <i class="bi bi-box-arrow-left"></i>
        <span>Cerrar sesión</span>
      </button>
      <div class="version">v1.0.0</div>
    </div>
  </aside>

  <div class="main">
    <header class="topbar">
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
      <div class="topbar-right">
        <span class="role-badge">Estudiante</span>
        <div class="topbar-avatar">{user.nombre[0]}{user.apellido[0]}</div>
      </div>
    </header>

    <main class="content">
      {#if modulo === "materias"}
        <MateriasDisponibles idEstudiante={user.id_usuario} onSolicitar={() => modulo = "solicitar"} />
      {:else if modulo === "solicitar"}
        <SolicitarMonitoria  idEstudiante={user.id_usuario} limiteMonitorias={3} onExito={() => modulo = "mis"} />
      {:else if modulo === "mis"}
        <MisMonitorias idEstudiante={user.id_usuario} />
      {/if}
    </main>
  </div>

</div>
{/if}

<style>
  :global(body) { margin: 0; font-family: system-ui, sans-serif; }

  .layout { display: flex; min-height: 100vh; background: #f5f5f3; }

  .sidebar {
    width: 220px; min-width: 220px;
    background: #010A55;
    display: flex; flex-direction: column;
  }

  .sidebar-header {
    display: flex; align-items: center; gap: 10px;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .sidebar-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #1D9E75;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: #fff; flex-shrink: 0;
  }

  .sidebar-name { font-size: 13px; font-weight: 500; color: #fff; line-height: 1.3; }
  .sidebar-role { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 1px; }

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

  .sidebar-footer {
    padding: .75rem .5rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex; flex-direction: column; gap: 2px;
  }

  .version { font-size: 11px; color: rgba(255,255,255,0.3); padding: 4px 12px 0; }

  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

  .topbar {
    background: #fff;
    border-bottom: 0.5px solid rgba(0,0,0,0.08);
    padding: .875rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
  }

  .topbar-title { font-size: 16px; font-weight: 500; margin: 0 0 3px; }

  .breadcrumb { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #aaa; }
  .breadcrumb span.active { color: #555; }
  .breadcrumb .sep { color: #ccc; }

  .topbar-right { display: flex; align-items: center; gap: 8px; }

  .role-badge {
    background: #EEF0FF; color: #010A55;
    font-size: 11px; font-weight: 500;
    padding: 3px 10px; border-radius: 20px;
  }

  .topbar-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #1D9E75;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; color: #fff;
  }

  .content { flex: 1; padding: 1.5rem; overflow-y: auto; }
</style>