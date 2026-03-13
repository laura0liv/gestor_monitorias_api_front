<nav class="navbar">
  <div class="logo">Gestión Tutorías</div>
  <ul class="menu">
    <li><a href="/">Inicio</a></li>
    <li><a href="/Estudiante">Mi perfil</a></li>
    <li><a href="/Login">Login</a></li>
  </ul>
</nav>

<style>
  /* =========================
     NAVBAR
  ========================= */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #010A55;
    color: white;
  }

  .logo {
    font-weight: bold;
    font-size: 1.2rem;
  }

  /* =========================
     MENU
  ========================= */
  .menu {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .menu li a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease-in-out;
  }

  .menu li a:hover {
    color: #f0a500; /* efecto hover */
  }
</style>