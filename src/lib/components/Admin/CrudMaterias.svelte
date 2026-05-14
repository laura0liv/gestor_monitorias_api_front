<script>
  import { onMount } from 'svelte';
  import { API } from '$lib/services/api';
  import DataTable from '$lib/components/DataTable.svelte';
  import '$lib/styles/data-table.css';
  import '$lib/styles/crud-materias.css';

  // ─── Estado ───────────────────────────────────────────────────────────────
  let materias = $state([]);
  let cargando = $state(false);
  let error    = $state('');
  let success  = $state('');
  let editando = $state(false);

  let materia = $state({
    id_materia:     null,
    nombre_materia: '',
    codigo_materia: '',
    creditos:       '',
    id_programa:    ''
  });

  // ─── Columnas para DataTable ──────────────────────────────────────────────
  // render()       → HTML que se muestra en la celda de la tabla
  // exportRender() → texto plano para CSV / PDF (sin HTML)
  const columns = [
    {
      key:   'nombre_materia',
      label: 'Materia',
      render: row => `<span class="fw">${row.nombre_materia}</span>`,
    },
    {
      key:          'codigo_materia',
      label:        'Código',
      render:       row => `<span class="code-badge">${row.codigo_materia}</span>`,
      exportRender: row => row.codigo_materia,
    },
    {
      key:   'creditos',
      label: 'Créditos',
    },
    {
      key:   'id_programa',
      label: 'Programa',
    },
  ];

  // Campos sobre los que actúa el buscador del DataTable
  const searchKeys = ['nombre_materia', 'codigo_materia', 'id_programa'];

  // ─── Stats derivadas ──────────────────────────────────────────────────────
  let totalCreditos = $derived(
    materias.reduce((sum, m) => sum + Number(m.creditos || 0), 0)
  );

  // ─── API: cargar ──────────────────────────────────────────────────────────
  async function cargarMaterias() {
    cargando = true;
    error = '';
    try {
      const res = await fetch(`${API}/materia/get_all_materia/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  }

  onMount(cargarMaterias);

  // ─── API: crear ───────────────────────────────────────────────────────────
  async function crearMateria() {
    try {
      const res = await fetch(`${API}/materia/create_materia/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(materia),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = [...materias, await res.json()];
      limpiar();
      flash('Materia creada correctamente');
    } catch (e) {
      error = e.message;
    }
  }

  // ─── API: actualizar ──────────────────────────────────────────────────────
  async function actualizarMateria() {
    try {
      const res = await fetch(`${API}/materia/update_materia/${materia.id_materia}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(materia),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const actualizada = await res.json();
      materias = materias.map(m =>
        m.id_materia === actualizada.id_materia ? actualizada : m
      );
      limpiar();
      flash('Materia actualizada');
    } catch (e) {
      error = e.message;
    }
  }

  // ─── API: eliminar ────────────────────────────────────────────────────────
  async function eliminarMateria(id) {
    if (!confirm('¿Eliminar esta materia?')) return;
    try {
      const res = await fetch(`${API}/materia/delete_materia/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = materias.filter(m => m.id_materia !== id);
      flash('Materia eliminada');
    } catch (e) {
      error = e.message;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function editarMateria(m) {
    materia  = { ...m };
    editando = true;
  }

  function limpiar() {
    materia  = { id_materia: null, nombre_materia: '', codigo_materia: '', creditos: '', id_programa: '' };
    editando = false;
  }

  function flash(msg) {
    success = msg;
    setTimeout(() => { success = ''; }, 3000);
  }

  function enviar(e) {
    e.preventDefault();
    editando ? actualizarMateria() : crearMateria();
  }
</script>

<div class="page">

  <!-- ── Encabezado ── -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Gestión de materias</h1>
      <p class="page-sub">Crea y administra el catálogo de materias</p>
    </div>
    <span class="badge-pill">{materias.length} materias</span>
  </div>

  <!-- ── Stats ── -->
  <div class="stats-grid">
    <div class="stat">
      <div class="stat-label">Total materias</div>
      <div class="stat-val">{materias.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Total créditos</div>
      <div class="stat-val">{totalCreditos}</div>
    </div>
  </div>

  <!-- ── Alertas ── -->
  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" type="button" aria-label="Cerrar" onclick={() => error = ''}>✕</button>
    </div>
  {/if}

  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <!-- ── Formulario crear / editar ── -->
  <div class="form-panel">
    <div class="panel-label">
      {editando ? 'Editar materia' : 'Agregar nueva materia'}
    </div>

    <form onsubmit={enviar}>
      <div class="form-row">

        <div class="field">
          <label for="nombre_materia">Nombre materia</label>
          <input
            id="nombre_materia"
            bind:value={materia.nombre_materia}
            placeholder="Ej. Cálculo Diferencial"
            required
          />
        </div>

        <div class="field">
          <label for="codigo_materia">Código</label>
          <input
            id="codigo_materia"
            bind:value={materia.codigo_materia}
            placeholder="Ej. MAT-101"
            required
          />
        </div>

        <div class="field">
          <label for="creditos">Créditos</label>
          <input
            id="creditos"
            type="number"
            min="1"
            bind:value={materia.creditos}
            required
          />
        </div>

        <div class="field">
          <label for="id_programa">ID Programa</label>
          <input
            id="id_programa"
            type="number"
            bind:value={materia.id_programa}
            required
          />
        </div>

        <div class="field field-actions">
          <div class="actions">
            <button type="submit" class="btn btn-success">
              {editando ? 'Guardar cambios' : 'Crear materia'}
            </button>
            {#if editando}
              <button type="button" class="btn btn-ghost" onclick={limpiar}>
                Cancelar
              </button>
            {/if}
          </div>
        </div>

      </div>
    </form>
  </div>

  <!-- ── Tabla con búsqueda, paginación y exportación ── -->
  <!--
    DataTable maneja internamente:
      · buscador (filtra por searchKeys)
      · paginación (8 filas por defecto)
      · exportar CSV / JSON / PDF (vía dataTableUtils.js)

    El slot #acciones recibe { row } con la fila actual
    y renderiza los botones editar / eliminar de esta vista.
  -->
  <DataTable
    data={materias}
    {columns}
    {searchKeys}
    {cargando}
    exportName="materias"
    emptyText="No hay materias registradas"
  >
    {#snippet acciones({ row })}
      <button
        class="act-btn warn"
        type="button"
        onclick={() => editarMateria(row)}
      >
        Editar
      </button>
      <button
        class="act-btn danger"
        type="button"
        onclick={() => eliminarMateria(row.id_materia)}
      >
        Eliminar
      </button>
    {/snippet}
  </DataTable>

</div>