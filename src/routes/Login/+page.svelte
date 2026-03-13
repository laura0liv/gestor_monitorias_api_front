<script>
  import { usuarios } from "$lib/usuarios.js";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let remember = false;
  let showPassword = false;

  function handleLogin() {
    const usuario = usuarios.find(
      u => u.correo === email && u.password === password
    );

    if (usuario) {
      if (usuario.rol === "tutor") {
        goto("/Tutor");
      } else if (usuario.rol === "estudiante") {
        goto("/Estudiante");
      } else if (usuario.rol === "admin") {
        goto("/Admin");
      }
    } else {
      alert("Correo o contraseña incorrectos");
    }
  }

  function togglePassword(){
    showPassword = !showPassword;
  }
</script>

<div class="login-bg">
  <div class="container h-100">
    <div class="row justify-content-center align-items-center min-vh-100">
      <div class="col-11 col-sm-8 col-md-6 col-lg-4">
        <div class="login-card shadow">

          <!-- icono -->
          <div class="text-center mb-3">
            <i class="bi bi-person-circle login-icon"></i>
          </div>
          <h3 class="text-center mb-4">Sistema de Monitorías</h3>
          <form on:submit|preventDefault={handleLogin}>

            <!-- email -->
            <div class="input-group mb-3">
              <span class="input-group-text">
                <i class="bi bi-envelope"></i>
              </span>

              <input
                type="email"
                class="form-control"
                placeholder="Correo electrónico"
                bind:value={email}
                required
              />
            </div>

            <!-- password -->
            <div class="input-group mb-3">

              <span class="input-group-text">
                <i class="bi bi-lock"></i>
              </span>

              <input
                type={showPassword ? "text" : "password"}
                class="form-control"
                placeholder="Contraseña"
                bind:value={password}
                required
              />

              <button
                class="btn btn-outline-secondary"
                type="button"
                on:click={togglePassword}
              >
                <i class={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>

            </div>

            <!-- opciones -->
            <div class="d-flex justify-content-between align-items-center mb-3">

              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  bind:checked={remember}
                >
                <label class="form-check-label">
                  Recordarme
                </label>
              </div>

              <a href="#" class="text-decoration-none small">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <!-- login -->
            <button
              type="submit"
              class="btn btn-primary w-100 mb-3"
            >
              Iniciar sesión
            </button>

            <!-- registros -->

            <a href="/Estudiante" class="btn btn-dark w-100 mb-2">
                      Entrar como Estudiante
            </a>
    
            <a href="/Tutor" class="btn btn-dark w-100 mb-2">
              Entrar como Tutor
            </a>

            <a href="/Admin" class="btn btn-dark w-100">
              Entrar como Administrador
            </a>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<style>

.login-bg{
  min-height:100vh;
  background:linear-gradient(135deg,#eef2ff,#ffffff);
}

.login-card{
  background:white;
  padding:40px;
  border-radius:15px;
  animation:fade 0.6s ease;
}

.login-icon{
  font-size:4rem;
  color:#4f46e5;
}

button{
  border-radius:8px;
  font-weight:500;
}

.form-control{
  border-radius:8px;
}

@keyframes fade{
  from{
    opacity:0;
    transform:translateY(20px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}

/* ajustes para celular */
@media (max-width:576px){

.login-card{
  padding:25px;
}

.login-icon{
  font-size:3rem;
}

}

</style>