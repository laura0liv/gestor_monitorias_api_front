<script>
  import { page } from '$app/stores';
  import '../styles/navbar.css';   // ajusta la ruta según tu estructura

  /**
   * usuario: objeto del store de sesión o null si no está logueado.
   * Forma esperada: { nombre, apellido, rol, email? }
   * rol: "estudiante" | "monitor" | "admin"
   */
  let { usuario = null } = $props();

  const ROL_META = {
    estudiante: { label: "Estudiante", color: "#010A55", bg: "#EEF0FF", href: "/Estudiante" },
    monitor:    { label: "Monitor",    color: "#085041", bg: "#E1F5EE", href: "/Tutor"      },
    admin:      { label: "Admin",      color: "#8B1A1A", bg: "#FDECEA", href: "/Admin"      },
  };

  let meta          = $derived(usuario ? (ROL_META[usuario.rol] ?? ROL_META.estudiante) : null);
  let menuAbierto   = $state(false);
  let burgerAbierto = $state(false);

  function cerrarDropdown(e) {
    if (!e.target.closest('.profile-wrap')) menuAbierto = false;
  }
</script>

<svelte:window onclick={cerrarDropdown} />

<!-- ── Navbar desktop ── -->
<nav class="navbar">

  <a href="/" class="brand">
    <div class="brand-icon"><i class="bi bi-mortarboard-fill"></i></div>
    <div class="brand-text">
      <span class="brand-name">Gestión Tutorías</span>
      <span class="brand-sub">Corporación Universitaria Latinoamericana</span>
    </div>
  </a>

  <ul class="nav-links">
    <li><a href="/" class:active={$page.url.pathname === "/"}>Inicio</a></li>
    {#if usuario}
      <li>
        <a href={meta.href} class:active={$page.url.pathname === meta.href}>Mi panel</a>
      </li>
    {/if}
  </ul>

  <div class="nav-right">
    {#if !usuario}
      <a href="/Login" class="btn-login">
        Iniciar sesión
      </a>
    {:else}
      <div class="profile-wrap">
        <button class="profile-btn" onclick={() => menuAbierto = !menuAbierto}>
          <div class="profile-avatar">{usuario.nombre[0]}{usuario.apellido[0]}</div>
          <div class="profile-info">
            <span class="profile-nombre">{usuario.nombre} {usuario.apellido}</span>
            <span class="profile-rol" style="background:{meta.bg}; color:{meta.color}">
              {meta.label}
            </span>
          </div>
          <i class="bi bi-chevron-down chevron" class:open={menuAbierto}></i>
        </button>

        {#if menuAbierto}
          <div class="dropdown">
            <div class="dropdown-header">
              <div class="dropdown-nombre">{usuario.nombre} {usuario.apellido}</div>
              {#if usuario.email}
                <div class="dropdown-email">{usuario.email}</div>
              {/if}
            </div>
            <a href={meta.href} class="dropdown-item" onclick={() => menuAbierto = false}>
              <i class="bi bi-columns-gap"></i> Mi panel
            </a>
            <div class="dropdown-divider"></div>
            <a href="/Login" class="dropdown-item danger" onclick={() => menuAbierto = false}>
              <i class="bi bi-box-arrow-right"></i> Cerrar sesión
            </a>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Hamburger — visible solo en móvil vía CSS -->
  <button class="hamburger" onclick={() => burgerAbierto = !burgerAbierto}>
    <i class="bi" class:bi-list={!burgerAbierto} class:bi-x={burgerAbierto}></i>
  </button>

</nav>

<!-- ── Menú móvil ── -->
{#if burgerAbierto}
  <div class="mobile-menu">
    {#if usuario}
      <div class="mobile-user">
        <div class="mobile-avatar">{usuario.nombre[0]}{usuario.apellido[0]}</div>
        <div class="mobile-user-info">
          <span class="mobile-nombre">{usuario.nombre} {usuario.apellido}</span>
          <span class="mobile-rol">{meta.label}</span>
        </div>
      </div>
      <div class="mobile-divider"></div>
    {/if}

    <a href="/" class:active={$page.url.pathname === "/"} onclick={() => burgerAbierto = false}>
      <i class="bi bi-house"></i> Inicio
    </a>

    {#if usuario}
      <a href={meta.href} class:active={$page.url.pathname === meta.href} onclick={() => burgerAbierto = false}>
        <i class="bi bi-columns-gap"></i> Mi panel
      </a>
      <div class="mobile-divider"></div>
      <a href="/Login" onclick={() => burgerAbierto = false} style="color:rgba(255,100,100,0.85)">
        <i class="bi bi-box-arrow-right"></i> Cerrar sesión
      </a>
    {:else}
      <a href="/Login" onclick={() => burgerAbierto = false}>
         Iniciar sesión
      </a>
    {/if}
  </div>
{/if}