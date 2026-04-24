<script>
  import { page } from '$app/stores';

  const links = [
    { href: '/',            label: 'Inicio'    },
    { href: '/Estudiante',  label: 'Mi perfil' },
    { href: '/Login',       label: 'Login'     },
  ];
</script>

<nav>
  <div class="brand">
    <div class="brand-dot">GT</div>
    <span>Gestión Tutorías</span>
  </div>

  <ul class="links">
    {#each links as l}
      <li>
        <a href={l.href} class:active={$page.url.pathname === l.href}>
          {l.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 1.5rem;
    background: #010A55;
    border-bottom: 1px solid #0a1870;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
  }

  .brand-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #1D9E75;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
  }

  .links {
    display: flex;
    gap: 4px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .links a {
    display: block;
    padding: 6px 14px;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 13px;
    font-weight: 400;
    transition: background 0.15s, color 0.15s;
  }

  .links a:hover,
  .links a.active {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }
</style>