<script>
  import { goto } from '$app/navigation';
  import { API } from '$lib/services/api';
  import '$lib/styles/login.css';

  let email         = $state('');
  let password      = $state('');
  let remember      = $state(false);
  let showPassword  = $state(false);
  let cargando      = $state(false);
  let error         = $state('');

  async function handleLogin(e) {
    e.preventDefault();
    error    = '';
    cargando = true;

    try {
      const res = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      if (!res.ok) {
        error = 'Correo o contraseña incorrectos';
        return;
      }

      const usuario = await res.json();

      const rutas = { '1': '/Admin', '2': '/Tutor', '3': '/Estudiante' };
      const ruta  = rutas[String(usuario.id_rol)];

      if (ruta) {
        goto(ruta);
      } else {
        error = 'Rol de usuario no reconocido';
      }
    } catch {
      error = 'No se pudo conectar con el servidor';
    } finally {
      cargando = false;
    }
  }
</script>

<div class="login-bg">
  <div class="login-wrapper">

    <!-- ── Panel izquierdo: marca ── -->
    <div class="login-brand">

      <div class="brand-logo">
        <div class="brand-logo-icon">
          <i class="ti ti-school"></i>
        </div>
        <div class="brand-logo-text">
          Sistema de Monitorías
          <span>Universidad</span>
        </div>
      </div>

      <div class="brand-body">
        <h2 class="brand-title">Aprende,<br>enseña y<br>crece.</h2>
        <p class="brand-sub">
          Conecta estudiantes con tutores y gestiona monitorías
          académicas en un solo lugar.
        </p>
      </div>

      <div class="brand-pills">
        <div class="brand-pill">
          <span class="brand-pill-dot"></span>
          Gestión de tutores y materias
        </div>
        <div class="brand-pill">
          <span class="brand-pill-dot"></span>
          Seguimiento de monitorías
        </div>
        <div class="brand-pill">
          <span class="brand-pill-dot"></span>
          Reportes y exportación de datos
        </div>
      </div>

    </div>

    <!-- ── Panel derecho: formulario ── -->
    <div class="login-form-panel">

      <div class="login-form-header">
        <h1 class="login-form-title">Bienvenido</h1>
        <p class="login-form-sub">Ingresa tus credenciales para continuar</p>
      </div>

      <form onsubmit={handleLogin}>

        <!-- Error global -->
        {#if error}
          <div style="
            background:#fef2f2;
            border:0.5px solid #fecaca;
            color:#b91c1c;
            border-radius:8px;
            padding:0.6rem 0.85rem;
            font-size:0.82rem;
            margin-bottom:1rem;
          ">
            <i class="ti ti-alert-circle" style="margin-right:5px"></i>{error}
          </div>
        {/if}

        <!-- Correo -->
        <div class="field">
          <label for="login-email">Correo electrónico</label>
          <div class="input-wrap">
            <i class="ti ti-mail input-icon" aria-hidden="true"></i>
            <input
              id="login-email"
              type="email"
              placeholder="tucorreo@universidad.edu.co"
              bind:value={email}
              autocomplete="email"
              required
            />
          </div>
        </div>

        <!-- Contraseña -->
        <div class="field">
          <label for="login-password">Contraseña</label>
          <div class="input-wrap">
            <i class="ti ti-lock input-icon" aria-hidden="true"></i>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              bind:value={password}
              autocomplete="current-password"
              required
            />
            <button
              class="btn-toggle-pwd"
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onclick={() => showPassword = !showPassword}
            >
              <i class="ti {showPassword ? 'ti-eye-off' : 'ti-eye'}" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Recordarme / olvidé -->
        <div class="login-options">
          <label class="remember-label">
            <input type="checkbox" bind:checked={remember} />
            Recordarme
          </label>
          <a href="/recuperar" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- Botón principal -->
        <button type="submit" class="btn-login" disabled={cargando}>
          {#if cargando}
            <i class="ti ti-loader-2" style="margin-right:6px;animation:spin 1s linear infinite"></i>
            Ingresando…
          {:else}
            Iniciar sesión
          {/if}
        </button>

      </form>

      <!-- Accesos rápidos (solo desarrollo / demo) -->
      <div class="login-divider"><span>acceso rápido</span></div>

      <div class="quick-access">
        <a href="/Estudiante" class="btn-quick">
          <i class="ti ti-user-graduate btn-quick-icon" aria-hidden="true"></i>
          <span class="btn-quick-label">Estudiante</span>
        </a>
        <a href="/Tutor" class="btn-quick">
          <i class="ti ti-chalkboard btn-quick-icon" aria-hidden="true"></i>
          <span class="btn-quick-label">Tutor</span>
        </a>
        <a href="/Admin" class="btn-quick">
          <i class="ti ti-settings btn-quick-icon" aria-hidden="true"></i>
          <span class="btn-quick-label">Admin</span>
        </a>
      </div>

    </div>
  </div>
</div>

<style>
  /* Animación del spinner inline — no va al CSS externo porque usa @keyframes
     que solo aplica a este componente */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>