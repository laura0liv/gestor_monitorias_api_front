<script>
  import { onMount } from "svelte";

  let usuarios = $state([]);
  let cargando = $state(false);
  let error    = $state("");
  let success  = $state("");
  let editando = $state(false);
  let busqueda = $state("");

  let usuario = $state({
    tipo_documento: "", numero_documento: "", nombre: "",
    apellido: "", correo: "", telefono: "",
    contrasena: "", estado: "activo", id_rol: ""
  });

  const API = "http://127.0.0.1:8000";
  const rolLabel = { "1": "Admin", "2": "Tutor", "3": "Estudiante" };

  async function cargarUsuarios() {
    cargando = true; error = "";
    try {
      const res = await fetch(`${API}/usuarios/get_all_usuario/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      usuarios = await res.json();
    } catch (e) { error = e.message; }
    finally { cargando = false; }
  }

  onMount(cargarUsuarios);

  async function crearUsuario() {
    try {
      const res = await fetch(`${API}/usuarios/create_usuario/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const nuevo = await res.json();
      usuarios = [...usuarios, nuevo];
      limpiar(); flash("Usuario creado correctamente");
    } catch (e) { error = e.message; }
  }

  function editarUsuario(u) { usuario = { ...u }; editando = true; }

  async function actualizarUsuario() {
    try {
      const res = await fetch(`${API}/usuarios/update_usuario/${usuario.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const act = await res.json();
      usuarios = usuarios.map(u => u.id_usuario === act.id_usuario ? act : u);
      limpiar(); flash("Usuario actualizado");
    } catch (e) { error = e.message; }
  }

  async function eliminarUsuario(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      const res = await fetch(`${API}/usuarios/delete_usuario/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      usuarios = usuarios.filter(u => u.id_usuario !== id);
      flash("Usuario eliminado");
    } catch (e) { error = e.message; }
  }

  function limpiar() {
    usuario = { tipo_documento: "", numero_documento: "", nombre: "",
      apellido: "", correo: "", telefono: "", contrasena: "", estado: "activo", id_rol: "" };
    editando = false;
  }

  function flash(msg) {
    success = msg;
    setTimeout(() => success = "", 3000);
  }

  function enviar(e) { e.preventDefault(); editando ? actualizarUsuario() : crearUsuario(); }

  let filtrados = $derived(
    usuarios.filter(u =>
      `${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  let totalActivos = $derived(usuarios.filter(u => u.estado === "activo").length);
  let totalTutores = $derived(usuarios.filter(u => String(u.id_rol) === "2").length);
</script>

<div class="page">

  <!-- HEADER -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Gestión de usuarios</h1>
      <p class="page-sub">Administra tutores, estudiantes y administradores</p>
    </div>
    <span class="badge-pill">{usuarios.length} registros</span>
  </div>

  <!-- STATS -->
  <div class="stats-grid">
    <div class="stat"><div class="stat-label">Total</div><div class="stat-val">{usuarios.length}</div></div>
    <div class="stat"><div class="stat-label">Activos</div><div class="stat-val">{totalActivos}</div></div>
    <div class="stat"><div class="stat-label">Tutores</div><div class="stat-val">{totalTutores}</div></div>
  </div>

  <!-- ALERTAS -->
  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" onclick={() => error = ""}>✕</button>
    </div>
  {/if}
  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <!-- CARD PRINCIPAL -->
  <div class="card">

    <!-- FORMULARIO -->
    <div class="form-panel">
      <div class="panel-label">{editando ? "Editar usuario" : "Agregar nuevo usuario"}</div>
      <form onsubmit={enviar}>
        <div class="form-grid-4">
          <div class="field">
            <label>Tipo doc.</label>
            <select bind:value={usuario.tipo_documento} required>
              <option value="">Seleccione</option>
              <option value="CC">CC</option>
              <option value="TI">TI</option>
              <option value="CE">CE</option>
            </select>
          </div>
          <div class="field">
            <label>N° documento</label>
            <input bind:value={usuario.numero_documento} required />
          </div>
          <div class="field">
            <label>Nombre</label>
            <input bind:value={usuario.nombre} required />
          </div>
          <div class="field">
            <label>Apellido</label>
            <input bind:value={usuario.apellido} required />
          </div>
          <div class="field">
            <label>Correo</label>
            <input type="email" bind:value={usuario.correo} required />
          </div>
          <div class="field">
            <label>Teléfono</label>
            <input bind:value={usuario.telefono} />
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" bind:value={usuario.contrasena} />
          </div>
          <div class="field">
            <label>Estado</label>
            <select bind:value={usuario.estado}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div class="field">
            <label>Rol</label>
            <select bind:value={usuario.id_rol} required>
              <option value="">Seleccione</option>
              <option value="1">Admin</option>
              <option value="2">Tutor</option>
              <option value="3">Estudiante</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {editando ? "Guardar cambios" : "Crear usuario"}
          </button>
          {#if editando}
            <button type="button" class="btn btn-ghost" onclick={limpiar}>Cancelar</button>
          {/if}
        </div>
      </form>
    </div>

    <!-- BÚSQUEDA -->
    <div class="search-bar">
      <input placeholder="Buscar por nombre, correo..." bind:value={busqueda} />
    </div>

    <!-- TABLA -->
    {#if cargando}
      <div class="loading">Cargando usuarios...</div>
    {:else if filtrados.length === 0}
      <div class="empty">Sin resultados</div>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Documento</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each filtrados as u, i}
              <tr>
                <td class="muted">{i + 1}</td>
                <td>
                  <div class="name-cell">
                    <div class="avatar">{u.nombre[0]}{u.apellido[0]}</div>
                    <div>
                      <div class="fw">{u.nombre} {u.apellido}</div>
                    </div>
                  </div>
                </td>
                <td class="hint">{u.tipo_documento} {u.numero_documento}</td>
                <td class="hint">{u.correo}</td>
                <td>
                  <span class="rol rol-{u.id_rol}">{rolLabel[u.id_rol] ?? u.id_rol}</span>
                </td>
                <td>
                  <span class="status" class:status-on={u.estado === "activo"}
                    class:status-off={u.estado !== "activo"}>{u.estado}</span>
                </td>
                <td>
                  <button class="act-btn warn" onclick={() => editarUsuario(u)}>Editar</button>
                  <button class="act-btn danger" onclick={() => eliminarUsuario(u.id_usuario)}>Eliminar</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

  </div>
</div>

<style>
  .page { padding: 1.5rem; background: var(--color-background-tertiary, #f5f5f3); min-height: 100vh; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; }
  .page-title { font-size: 18px; font-weight: 500; margin: 0 0 3px; }
  .page-sub { font-size: 13px; color: #888; margin: 0; }
  .badge-pill { background: #E1F5EE; color: #085041; font-size: 11px; font-weight: 500; padding: 4px 12px; border-radius: 20px; white-space: nowrap; }

  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 1.25rem; }
  .stat { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 10px; padding: .75rem 1rem; }
  .stat-label { font-size: 11px; color: #888; margin-bottom: 4px; }
  .stat-val { font-size: 22px; font-weight: 500; }

  .alert { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 1rem; }
  .alert-danger { background: #FCEBEB; color: #A32D2D; border: 0.5px solid #F09595; }
  .alert-success { background: #E1F5EE; color: #085041; border: 0.5px solid #5DCAA5; }
  .alert-close { background: none; border: none; cursor: pointer; font-size: 14px; color: inherit; }

  .card { background: #fff; border: 0.5px solid rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden; }
  .form-panel { padding: 1rem 1.25rem; background: #fafafa; border-bottom: 0.5px solid rgba(0,0,0,0.08); }
  .panel-label { font-size: 11px; font-weight: 500; color: #888; margin-bottom: 10px; text-transform: uppercase; letter-spacing: .04em; }

  .form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field label { font-size: 11px; color: #666; font-weight: 500; }
  .field input, .field select { height: 32px; padding: 0 10px; border: 0.5px solid rgba(0,0,0,0.15); border-radius: 7px; font-size: 13px; background: #fff; color: inherit; font-family: inherit; width: 100%; }
  .field input:focus, .field select:focus { outline: none; border-color: #010A55; box-shadow: 0 0 0 2px rgba(1,10,85,0.1); }

  .form-actions { display: flex; gap: 8px; }
  .btn { height: 32px; padding: 0 16px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; border: 0.5px solid rgba(0,0,0,0.15); background: #fff; }
  .btn-primary { background: #010A55; border-color: #010A55; color: #fff; }
  .btn-primary:hover { background: #020d6e; }
  .btn-ghost { background: transparent; color: #666; }

  .search-bar { padding: .75rem 1.25rem; border-bottom: 0.5px solid rgba(0,0,0,0.08); }
  .search-bar input { height: 32px; padding: 0 12px; border: 0.5px solid rgba(0,0,0,0.15); border-radius: 7px; font-size: 13px; width: 280px; font-family: inherit; }
  .search-bar input:focus { outline: none; border-color: #010A55; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th { font-size: 11px; font-weight: 500; color: #888; padding: 9px 1.25rem; text-align: left; border-bottom: 0.5px solid rgba(0,0,0,0.08); background: #fafafa; }
  tbody tr { border-bottom: 0.5px solid rgba(0,0,0,0.06); }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #fafafa; }
  td { padding: 10px 1.25rem; font-size: 13px; vertical-align: middle; }
  .muted { color: #aaa; font-size: 12px; }
  .hint { color: #888; font-size: 12px; }
  .fw { font-weight: 500; }

  .name-cell { display: flex; align-items: center; gap: 8px; }
  .avatar { width: 30px; height: 30px; border-radius: 50%; background: #E6F1FB; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: #0C447C; flex-shrink: 0; }

  .rol { font-size: 11px; padding: 2px 9px; border-radius: 20px; }
  .rol-1 { background: #EEEDFE; color: #3C3489; }
  .rol-2 { background: #E1F5EE; color: #085041; }
  .rol-3 { background: #E6F1FB; color: #0C447C; }

  .status { font-size: 11px; padding: 2px 9px; border-radius: 20px; }
  .status-on { background: #EAF3DE; color: #27500A; }
  .status-off { background: #F1EFE8; color: #5F5E5A; }

  .act-btn { background: none; border: none; cursor: pointer; font-size: 12px; font-weight: 500; padding: 4px 8px; border-radius: 5px; }
  .act-btn.warn { color: #854F0B; }
  .act-btn.warn:hover { background: #FAEEDA; }
  .act-btn.danger { color: #A32D2D; }
  .act-btn.danger:hover { background: #FCEBEB; }

  .loading, .empty { padding: 2.5rem; text-align: center; color: #aaa; font-size: 13px; }
</style>