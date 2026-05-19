<!-- src/lib/components/Navbar.svelte -->
<script>
  import { page } from '$app/stores';
  import { usuario } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let menuOpen = $state(false);
  let user = $state(null);

  onMount(() => {
    usuario.init();
    const unsub = usuario.subscribe(val => { user = val; });
    return unsub;
  });

  function toggleMenu() { menuOpen = !menuOpen; }
  function closeMenu()  { menuOpen = false; }

  const links = [
    { label: 'Inicio', href: '/' },
  ];

  const ROL_META = {
    '1': { label: 'Administrador', color: '#8B1A1A', bg: '#FDECEA', href: '/Admin',      icon: '⚙' },
    '2': { label: 'Monitor',       color: '#085041', bg: '#E1F5EE', href: '/Tutor',      icon: '📋' },
    '3': { label: 'Estudiante',    color: '#010A55', bg: '#EEF0FF', href: '/Estudiante', icon: '🎓' },
  };

  let meta = $derived(user ? (ROL_META[String(user.id_rol)] ?? null) : null);

  let mostrarPerfil = $derived(
    $page.url.pathname.startsWith('/Estudiante') ||
    $page.url.pathname.startsWith('/Tutor') ||
    $page.url.pathname.startsWith('/Admin')
  );
</script>

<nav class:menu-open={menuOpen}>

  <!-- Marca -->
  <a href="/" class="nav-brand" onclick={closeMenu}>
    <div class="nav-logo" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>
    <div>
      <div class="nav-title">Corporación Universitaria Latinoamericana</div>
      <div class="nav-subtitle">Sistema de Tutorías</div>
    </div>
  </a>

  <!-- Desktop links -->
  <div class="nav-links">
    {#each links as link}
      <a href={link.href} class="nav-link">{link.label}</a>
    {/each}

    {#if user && meta && mostrarPerfil}
      <a href={meta.href} class="nav-link">Mi panel</a>

      <div class="profile-chip">
        <div class="profile-avatar">
          {user.nombre?.[0]}{user.apellido?.[0]}
        </div>
        <div class="profile-info">
          <span class="profile-name">{user.nombre} {user.apellido}</span>
          <span class="profile-role" style="background:{meta.bg}; color:{meta.color}">
            {meta.label}
          </span>
        </div>
      </div>

    {:else if user && meta}
      <!-- Logueado pero fuera de su panel (ej: en la landing) -->
      <a href={meta.href} class="btn-nav-panel" style="background:{meta.bg}; color:{meta.color}">
        Ir a mi panel →
      </a>
      <div class="profile-chip">
        <div class="profile-avatar">
          {user.nombre?.[0]}{user.apellido?.[0]}
        </div>
        <div class="profile-info">
          <span class="profile-name">{user.nombre} {user.apellido}</span>
          <span class="profile-role" style="background:{meta.bg}; color:{meta.color}">
            {meta.label}
          </span>
        </div>
      </div>

    {:else}
      <a href="/Login" class="btn-nav">Iniciar sesión</a>
    {/if}
  </div>

  <!-- Hamburguesa -->
  <button
    class="hamburger"
    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
    aria-expanded={menuOpen}
    onclick={toggleMenu}
  >
    <span class="bar bar-1"></span>
    <span class="bar bar-2"></span>
    <span class="bar bar-3"></span>
  </button>
</nav>

<!-- Menú móvil -->
<div class="mobile-menu" class:open={menuOpen} aria-hidden={!menuOpen}>
  <div class="mobile-menu-inner">

    {#if user && meta}
      <div class="mobile-user">
        <div class="mobile-avatar">{user.nombre?.[0]}{user.apellido?.[0]}</div>
        <div class="mobile-user-info">
          <span class="mobile-name">{user.nombre} {user.apellido}</span>
          <span class="mobile-role" style="background:{meta.bg}; color:{meta.color}">
            {meta.label}
          </span>
        </div>
      </div>
    {/if}

    {#each links as link}
      <a href={link.href} class="mobile-link" onclick={closeMenu}>{link.label}</a>
    {/each}

    {#if user && meta}
      <a href={meta.href} class="mobile-link" onclick={closeMenu}>Mi panel</a>
      <button
        class="mobile-btn-logout"
        onclick={() => { usuario.logout(); goto('/Login'); closeMenu(); }}
      >
        Cerrar sesión
      </button>
    {:else}
      <a href="/Login" class="mobile-btn-nav" onclick={closeMenu}>Iniciar sesión</a>
    {/if}

  </div>
</div>

<!-- Overlay -->
{#if menuOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" onclick={closeMenu} aria-hidden="true"></div>
{/if}

<style>
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 200;
    background: rgba(1, 10, 85, 0.97);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 3rem;
    height: 68px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  /* ── BRAND ── */
  .nav-brand {
    display: flex; align-items: center; gap: 12px;
    text-decoration: none; flex-shrink: 0;
  }

  .nav-logo {
    width: 40px; height: 40px;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    color: white;
  }

  .nav-title {
    font-size: 14px; font-weight: 600; color: white; white-space: nowrap;
  }

  .nav-subtitle {
    font-size: 10px; color: rgba(255,255,255,0.45);
    letter-spacing: 1.5px; text-transform: uppercase; margin-top: 1px;
  }

  /* ── LINKS ── */
  .nav-links {
    display: flex; align-items: center; gap: 1.5rem;
  }

  .nav-link {
    color: rgba(255,255,255,0.75);
    font-size: 14px; text-decoration: none;
    transition: color .15s;
  }
  .nav-link:hover { color: white; }

  .btn-nav {
    background: white; color: #010A55 !important;
    border-radius: 7px; padding: 8px 20px;
    font-weight: 600; font-size: 13px;
    text-decoration: none;
    transition: opacity .15s;
  }
  .btn-nav:hover { opacity: .9; }

  .btn-nav-panel {
    border-radius: 7px; padding: 7px 16px;
    font-weight: 600; font-size: 12px;
    text-decoration: none;
    transition: opacity .15s;
  }
  .btn-nav-panel:hover { opacity: .85; }

  /* ── PROFILE CHIP ── */
  .profile-chip {
    display: flex; align-items: center; gap: 10px;
    padding-left: 1rem;
    border-left: 1px solid rgba(255,255,255,0.12);
  }

  .profile-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(255,255,255,0.14);
    border: 1.5px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 12px; font-weight: 700;
    flex-shrink: 0;
  }

  .profile-info {
    display: flex; flex-direction: column; gap: 3px;
  }

  .profile-name {
    color: white; font-size: 13px; font-weight: 500; line-height: 1;
  }

  .profile-role {
    width: fit-content;
    font-size: 10px; font-weight: 600;
    padding: 2px 8px; border-radius: 999px;
    line-height: 1.4;
  }

  /* ── HAMBURGUESA ── */
  .hamburger {
    display: none;
    flex-direction: column; justify-content: center; align-items: center;
    gap: 5px; width: 40px; height: 40px;
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.2); border-radius: 8px;
    cursor: pointer;
  }

  .bar {
    width: 18px; height: 1.5px;
    background: white; border-radius: 2px;
    transition: .3s;
  }

  :global(nav.menu-open) .bar-1 { transform: translateY(6.5px) rotate(45deg); }
  :global(nav.menu-open) .bar-2 { opacity: 0; }
  :global(nav.menu-open) .bar-3 { transform: translateY(-6.5px) rotate(-45deg); }

  /* ── MOBILE MENU ── */
  .mobile-menu {
    position: fixed; top: 68px; left: 0; right: 0;
    z-index: 190;
    background: rgba(1, 8, 60, 0.99);
    max-height: 0; overflow: hidden;
    transition: max-height .35s ease;
  }
  .mobile-menu.open { max-height: 480px; }

  .mobile-menu-inner {
    display: flex; flex-direction: column; gap: .5rem;
    padding: 1.25rem;
  }

  .mobile-link {
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    padding: .9rem 1rem; border-radius: 8px;
    font-size: 14px;
    transition: background .15s;
  }
  .mobile-link:hover { background: rgba(255,255,255,0.07); }

  .mobile-btn-nav {
    background: white; color: #010A55;
    text-align: center; text-decoration: none;
    padding: .95rem; border-radius: 8px;
    font-weight: 600; font-size: 14px;
  }

  .mobile-btn-logout {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; padding: .9rem 1rem;
    font-size: 14px; cursor: pointer;
    text-align: left; width: 100%;
    transition: background .15s;
  }
  .mobile-btn-logout:hover { background: rgba(255,255,255,0.1); color: white; }

  /* Usuario móvil */
  .mobile-user {
    display: flex; align-items: center; gap: 12px;
    padding-bottom: 1rem; margin-bottom: .5rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .mobile-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
    border: 1.5px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 700; font-size: 14px;
  }

  .mobile-user-info { display: flex; flex-direction: column; gap: 4px; }

  .mobile-name { color: white; font-size: 14px; font-weight: 500; }

  .mobile-role {
    width: fit-content;
    font-size: 11px; font-weight: 600;
    padding: 3px 9px; border-radius: 999px;
  }

  /* Overlay */
  .overlay {
    position: fixed; inset: 0; top: 68px;
    z-index: 180; background: rgba(0,0,0,0.5);
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 860px) {
    nav { padding: 0 1.25rem; }
    .nav-subtitle { display: none; }
  }

  @media (max-width: 640px) {
    .nav-links { display: none; }
    .hamburger { display: flex; }
    .nav-title { font-size: 13px; }
  }
</style>