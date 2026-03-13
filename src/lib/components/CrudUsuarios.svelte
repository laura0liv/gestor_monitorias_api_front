<script>
  import { onMount } from "svelte";

  /* =========================
     VARIABLES ($state)
  ========================= */
  let usuarios  = $state([]);
  let cargando  = $state(false);
  let error     = $state("");
  let editando  = $state(false);

  let usuario = $state({
    tipo_documento:   "",
    numero_documento: "",
    nombre:           "",
    apellido:         "",
    correo:           "",
    telefono:         "",
    contrasena:       "",
    estado:           "activo",
    id_rol:           ""
  });

  /* =========================
     CARGAR USUARIOS
  ========================= */
  async function cargarUsuarios() {
    cargando = true;
    error = "";
    try {
      const res = await fetch("http://127.0.0.1:8000/usuarios/get_all_usuario/");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      usuarios = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  }

  onMount(() => cargarUsuarios());

  /* =========================
     CREAR USUARIO
  ========================= */
  async function crearUsuario() {
    try {
      const res = await fetch("http://127.0.0.1:8000/usuarios/create_usuario/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const nuevo = await res.json();
      usuarios = [...usuarios, nuevo];
      limpiar();
    } catch (e) {
      error = e.message;
    }
  }

  /* =========================
     EDITAR
  ========================= */
  function editarUsuario(u) {
    usuario  = { ...u };
    editando = true;
  }

  /* =========================
     ACTUALIZAR
  ========================= */
  async function actualizarUsuario() {
    try {
      const res = await fetch(`http://127.0.0.1:8000/usuarios/update_usuario/${usuario.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const actualizado = await res.json();
      usuarios = usuarios.map(u =>
        u.id_usuario === actualizado.id_usuario ? actualizado : u
      );
      limpiar();
    } catch (e) {
      error = e.message;
    }
  }

  /* =========================
     ELIMINAR
  ========================= */
  async function eliminarUsuario(id) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/usuarios/delete_usuario/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      usuarios = usuarios.filter(u => u.id_usuario !== id);
    } catch (e) {
      error = e.message;
    }
  }

  /* =========================
     LIMPIAR
  ========================= */
  function limpiar() {
    usuario = {
      tipo_documento:   "",
      numero_documento: "",
      nombre:           "",
      apellido:         "",
      correo:           "",
      telefono:         "",
      contrasena:       "",
      estado:           "activo",
      id_rol:           ""
    };
    editando = false;
  }

  function enviarFormulario(e) {
    e.preventDefault();
    editando ? actualizarUsuario() : crearUsuario();
  }

  const rolLabel = { "1": "Admin", "2": "Tutor", "3": "Estudiante" };
</script>

<div class="card shadow-sm border-0">

  <!-- HEADER -->
  <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between">
    <span class="fw-semibold">Gestión de Usuarios</span>
    <span class="badge bg-white text-primary">{usuarios.length} registros</span>
  </div>

  <div class="card-body">

    <!-- ERROR GLOBAL -->
    {#if error}
      <div class="alert alert-danger d-flex align-items-center gap-2 py-2">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div>
          <strong>Error:</strong> {error}
          <button class="btn btn-sm btn-outline-danger ms-2" onclick={cargarUsuarios}>Reintentar</button>
        </div>
      </div>
    {/if}

    <!-- FORMULARIO -->
    <form onsubmit={enviarFormulario}>
      <div class="row g-2">

        <div class="col-md-2">
          <label class="form-label small fw-semibold">Tipo doc.</label>
          <select class="form-select form-select-sm" bind:value={usuario.tipo_documento} required>
            <option value="">Seleccione</option>
            <option value="CC">CC</option>
            <option value="TI">TI</option>
            <option value="CE">CE</option>
          </select>
        </div>

        <div class="col-md-2">
          <label class="form-label small fw-semibold">N° Documento</label>
          <input class="form-control form-control-sm" bind:value={usuario.numero_documento} required />
        </div>

        <div class="col-md-2">
          <label class="form-label small fw-semibold">Nombre</label>
          <input class="form-control form-control-sm" bind:value={usuario.nombre} required />
        </div>

        <div class="col-md-2">
          <label class="form-label small fw-semibold">Apellido</label>
          <input class="form-control form-control-sm" bind:value={usuario.apellido} required />
        </div>

        <div class="col-md-2">
          <label class="form-label small fw-semibold">Correo</label>
          <input type="email" class="form-control form-control-sm" bind:value={usuario.correo} required />
        </div>

        <div class="col-md-2">
          <label class="form-label small fw-semibold">Teléfono</label>
          <input class="form-control form-control-sm" bind:value={usuario.telefono} />
        </div>

        <div class="col-md-3">
          <label class="form-label small fw-semibold">Contraseña</label>
          <input type="password" class="form-control form-control-sm" bind:value={usuario.contrasena} />
        </div>

        <div class="col-md-3">
          <label class="form-label small fw-semibold">Estado</label>
          <select class="form-select form-select-sm" bind:value={usuario.estado}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label small fw-semibold">Rol</label>
          <select class="form-select form-select-sm" bind:value={usuario.id_rol} required>
            <option value="">Seleccione</option>
            <option value="1">Admin</option>
            <option value="2">Tutor</option>
            <option value="3">Estudiante</option>
          </select>
        </div>

        <div class="col-md-3 d-flex align-items-end gap-2">
          <button type="submit" class="btn btn-primary btn-sm w-100">
            {editando ? "Actualizar" : "Crear usuario"}
          </button>
          {#if editando}
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick={limpiar}>
              Cancelar
            </button>
          {/if}
        </div>

      </div>
    </form>

    <hr />

    <!-- TABLA -->
    {#if cargando}
      <div class="text-center py-4 text-muted">
        <div class="spinner-border spinner-border-sm me-2"></div>
        Cargando usuarios...
      </div>

    {:else if usuarios.length === 0}
      <div class="alert alert-warning mb-0">No hay usuarios registrados.</div>

    {:else}
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each usuarios as u, i}
              <tr>
                <td class="text-muted small">{i + 1}</td>
                <td class="fw-semibold">{u.nombre} {u.apellido}</td>
                <td><span class="badge bg-secondary">{u.tipo_documento} {u.numero_documento}</span></td>
                <td>{u.correo}</td>
                <td>{rolLabel[u.id_rol] ?? u.id_rol}</td>
                <td>
                  <span class="badge" class:bg-success={u.estado === "activo"} class:bg-secondary={u.estado !== "activo"}>
                    {u.estado}
                  </span>
                </td>
                <td>
                  <button class="btn btn-warning btn-sm me-1" onclick={() => editarUsuario(u)}>
                    Editar
                  </button>
                  <button class="btn btn-danger btn-sm" onclick={() => eliminarUsuario(u.id_usuario)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

  </div>
</div>