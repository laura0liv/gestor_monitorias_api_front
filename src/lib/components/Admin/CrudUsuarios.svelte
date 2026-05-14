<script>
  import { onMount } from 'svelte';
  import { API } from '$lib/services/api';
  import DataTable from '$lib/components/DataTable.svelte';
  import '$lib/styles/data-table.css';
  import '$lib/styles/crud-usuarios.css';

  // ─── Estado ───────────────────────────────────────────────────────────────
  let usuarios = $state([]);
  let cargando = $state(false);
  let error    = $state('');
  let success  = $state('');
  let editando = $state(false);

  let usuario = $state({
    tipo_documento: '', numero_documento: '', nombre: '',
    apellido: '', correo: '', telefono: '',
    contrasena: '', estado: 'activo', id_rol: ''
  });

  const rolLabel = { '1': 'Admin', '2': 'Tutor', '3': 'Estudiante' };

  // ─── Columnas para DataTable ──────────────────────────────────────────────
  // render()       → HTML que se muestra en la celda
  // exportRender() → texto plano para CSV / PDF
  const columns = [
    {
      key:   'nombre',
      label: 'Usuario',
      render: row => `
        <div class="name-cell">
          <div class="avatar">${row.nombre[0]}${row.apellido[0]}</div>
          <span class="fw">${row.nombre} ${row.apellido}</span>
        </div>`,
      exportRender: row => `${row.nombre} ${row.apellido}`,
    },
    {
      key:   'numero_documento',
      label: 'Documento',
      render: row =>
        `<span class="hint">${row.tipo_documento} ${row.numero_documento}</span>`,
      exportRender: row => `${row.tipo_documento} ${row.numero_documento}`,
    },
    {
      key:   'correo',
      label: 'Correo',
      render: row => `<span class="hint">${row.correo}</span>`,
    },
    {
      key:   'id_rol',
      label: 'Rol',
      render: row => {
        const label = rolLabel[String(row.id_rol)] ?? row.id_rol;
        return `<span class="rol rol-${row.id_rol}">${label}</span>`;
      },
      exportRender: row => rolLabel[String(row.id_rol)] ?? row.id_rol,
    },
    {
      key:   'estado',
      label: 'Estado',
      render: row => {
        const activo = row.estado === 'activo';
        return `<span class="status ${activo ? 'status-on' : 'status-off'}">${row.estado}</span>`;
      },
    },
  ];

  // Keys por las que filtra el buscador del DataTable
  const searchKeys = ['nombre', 'apellido', 'correo', 'numero_documento'];

  // ─── Stats derivadas ──────────────────────────────────────────────────────
  let totalActivos = $derived(usuarios.filter(u => u.estado === 'activo').length);
  let totalTutores = $derived(usuarios.filter(u => String(u.id_rol) === '2').length);

  // ─── API ──────────────────────────────────────────────────────────────────
  async function cargarUsuarios() {
    cargando = true; error = '';
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(usuario),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      usuarios = [...usuarios, await res.json()];
      limpiar(); flash('Usuario creado correctamente');
    } catch (e) { error = e.message; }
  }

  async function actualizarUsuario() {
    try {
      const res = await fetch(`${API}/usuarios/update_usuario/${usuario.id_usuario}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(usuario),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const act = await res.json();
      usuarios = usuarios.map(u => u.id_usuario === act.id_usuario ? act : u);
      limpiar(); flash('Usuario actualizado');
    } catch (e) { error = e.message; }
  }

  async function eliminarUsuario(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      const res = await fetch(`${API}/usuarios/delete_usuario/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      usuarios = usuarios.filter(u => u.id_usuario !== id);
      flash('Usuario eliminado');
    } catch (e) { error = e.message; }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function editarUsuario(u) { usuario = { ...u }; editando = true; }

  function limpiar() {
    usuario = {
      tipo_documento: '', numero_documento: '', nombre: '',
      apellido: '', correo: '', telefono: '',
      contrasena: '', estado: 'activo', id_rol: ''
    };
    editando = false;
  }

  function flash(msg) {
    success = msg;
    setTimeout(() => { success = ''; }, 3000);
  }

  function enviar(e) {
    e.preventDefault();
    editando ? actualizarUsuario() : crearUsuario();
  }
</script>

<div class="page">

  <!-- ── Encabezado ── -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Gestión de usuarios</h1>
      <p class="page-sub">Administra tutores, estudiantes y administradores</p>
    </div>
    <span class="badge-pill">{usuarios.length} registros</span>
  </div>

  <!-- ── Stats ── -->
  <div class="stats-grid">
    <div class="stat">
      <div class="stat-label">Total</div>
      <div class="stat-val">{usuarios.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Activos</div>
      <div class="stat-val">{totalActivos}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Tutores</div>
      <div class="stat-val">{totalTutores}</div>
    </div>
  </div>

  <!-- ── Alertas ── -->
  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" onclick={() => error = ''}>✕</button>
    </div>
  {/if}
  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <!-- ── Formulario crear / editar ── -->
  <div class="form-panel">
    <div class="panel-label">
      {editando ? 'Editar usuario' : 'Agregar nuevo usuario'}
    </div>

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
          {editando ? 'Guardar cambios' : 'Crear usuario'}
        </button>
        {#if editando}
          <button type="button" class="btn btn-ghost" onclick={limpiar}>
            Cancelar
          </button>
        {/if}
      </div>
    </form>
  </div>

  <!-- ── Tabla con búsqueda, paginación y exportación ── -->
  <!--
    DataTable maneja: buscador · paginación · exportar CSV/JSON/PDF.
    El slot #acciones recibe { row } y pinta los botones de esta vista.
  -->
  <DataTable
    data={usuarios}
    {columns}
    {searchKeys}
    {cargando}
    exportName="usuarios"
    emptyText="No hay usuarios registrados"
  >
    {#snippet acciones({ row })}
      <button class="act-btn warn"   type="button" onclick={() => editarUsuario(row)}>
        Editar
      </button>
      <button class="act-btn danger" type="button" onclick={() => eliminarUsuario(row.id_usuario)}>
        Eliminar
      </button>
    {/snippet}
  </DataTable>

</div>