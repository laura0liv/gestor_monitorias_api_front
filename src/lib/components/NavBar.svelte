<script>
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  const links = [
    { label: 'Inicio',   href: '/' },
  ];
</script>

<nav class:menu-open={menuOpen}>
  <!-- Marca -->
  <a href="/" class="nav-brand" on:click={closeMenu}>
    <div class="nav-logo" aria-hidden="true">U</div>
    <div>
      <div class="nav-title">Corporación Universitaria Latinoamericana</div>
      <div class="nav-subtitle">Sistema de Tutorías</div>
    </div>
  </a>

  <!-- Links desktop -->
  <div class="nav-links">
    {#each links as link}
      <a href={link.href}>{link.label}</a>
    {/each}
    <a href="/Login" class="btn-nav">Iniciar sesión</a>
  </div>

  <!-- Botón hamburguesa -->
  <button
    class="hamburger"
    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
    aria-expanded={menuOpen}
    on:click={toggleMenu}
  >
    <span class="bar bar-1"></span>
    <span class="bar bar-2"></span>
    <span class="bar bar-3"></span>
  </button>
</nav>

<!-- Menú móvil -->
<div class="mobile-menu" class:open={menuOpen} aria-hidden={!menuOpen}>
  <div class="mobile-menu-inner">
    {#each links as link}
      <a href={link.href} class="mobile-link" on:click={closeMenu}>{link.label}</a>
    {/each}
    <a href="/Login" class="mobile-btn-nav" on:click={closeMenu}>Iniciar sesión</a>
  </div>
</div>

<!-- Overlay -->
{#if menuOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="overlay" on:click={closeMenu} aria-hidden="true"></div>
{/if}

<style>
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 200;
    background: rgba(13, 43, 78, 0.97);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 3rem;
    height: 68px;
    border-bottom: #ffff;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    flex-shrink: 0;
  }

  .nav-logo {
    width: 40px; height: 40px;
    background: linear-gradient(#010A55, #010A55,#010A55);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 18px; font-weight: 700;
    color:  var(--white);
    flex-shrink: 0;
  }

  .nav-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 600;
    color: var(--white);
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  .nav-subtitle {
    font-size: 11px;
    color:  #ffff;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 1px;
    white-space: nowrap;
  }

  /* ── Links desktop ── */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-links a {
    color:  #ffff;
    font-size: 14px; font-weight: 400;
    text-decoration: none;
    transition: color 0.2s;
    white-space: nowrap;
  }

  .nav-links a:hover { color: var(--white); }

  .btn-nav {
    background: var(--blue);
    color: var(--white) !important;
    border-radius: 6px;
    padding: 9px 22px;
    font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
    white-space: nowrap;
  }

  .btn-nav:hover {
    background: var(--white) !important;
    transform: translateY(-1px);
    color: var(--navy) !important;
  }

  /* ── Hamburguesa ── */
  .hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 40px; height: 40px;
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: border-color 0.2s;
  }

  .hamburger:hover { border-color: rgba(255,255,255,0.5); }

  .bar {
    display: block;
    width: 18px; height: 1.5px;
    background: var(--white);
    border-radius: 2px;
    transition:
      transform 0.35s cubic-bezier(0.23, 1, 0.32, 1),
      opacity   0.25s ease;
    transform-origin: center;
  }

  /* Animación → X cuando menú está abierto */
  :global(nav.menu-open) .bar-1 { transform: translateY(6.5px)  rotate(45deg); }
  :global(nav.menu-open) .bar-2 { opacity: 0; transform: scaleX(0); }
  :global(nav.menu-open) .bar-3 { transform: translateY(-6.5px) rotate(-45deg); }

  /* ── Menú móvil ── */
  .mobile-menu {
    position: fixed;
    top: 68px; left: 0; right: 0;
    z-index: 190;
    background: rgba(10, 28, 50, 0.98);
    backdrop-filter: blur(16px);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    border-bottom: 1px solid rgba(201, 146, 26, 0.2);
  }

  .mobile-menu.open { max-height: 420px; }

  .mobile-menu-inner {
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1.25rem 2rem;
    gap: 0.25rem;
  }

  .mobile-link {
    color: rgba(255,255,255,0.75);
    font-size: 16px; font-weight: 400;
    text-decoration: none;
    padding: 0.85rem 1rem;
    border-radius: 8px;
    transition: background 0.2s, color 0.2s;
  }

  .mobile-link:hover {
    background: rgba(255,255,255,0.07);
    color: var(--gold-light);
  }

  .mobile-btn-nav {
    display: block;
    margin-top: 0.75rem;
    background: var(--gold);
    color: var(--navy);
    font-size: 15px; font-weight: 600;
    text-decoration: none;
    padding: 13px 1rem;
    border-radius: 8px;
    text-align: center;
    transition: background 0.2s;
  }

  .mobile-btn-nav:hover { background: var(--gold-light); }

  /* ── Overlay ── */
  .overlay {
    position: fixed;
    inset: 0;
    top: 68px;
    z-index: 180;
    background: rgba(0,0,0,0.45);
  }

  /* ── Breakpoints ── */
  @media (max-width: 860px) {
    nav { padding: 0 1.25rem; }
    .nav-subtitle { display: none; }
  }

  @media (max-width: 640px) {
    .nav-links { display: none; }
    .hamburger { display: flex; }
    .nav-title { font-size: 15px; }
  }
</style>