<script>
  import { onMount } from 'svelte';
  import { API } from '$lib/services/api';
  import DataTable from '$lib/components/DataTable.svelte';

  let materias    = $state([]);
  let programas   = $state([]);
  let cargando    = $state(false);
  let error       = $state('');
  let success     = $state('');
  let editando    = $state(false);

  let materia = $state({
    id_materia:      null,
    nombre_materia:  '',
    codigo_materia:  '',
    creditos:        '',
    id_programa:     ''
  });

  // ── Bug 3 fix: variables derivadas ──────────────────────────────────────
  let totalCreditos = $derived(
    materias.reduce((sum, m) => sum + Number(m.creditos || 0), 0)
  );

  const columns = [
    { key: 'nombre_materia',  label: 'Nombre'   },
    { key: 'codigo_materia',  label: 'Código'   },
    { key: 'creditos',        label: 'Créditos' },
    { key: 'nombre_programa', label: 'Programa' },
  ];

  const searchKeys = ['nombre_materia', 'codigo_materia', 'nombre_programa'];
  // ────────────────────────────────────────────────────────────────────────

  async function cargarMaterias() {
    cargando = true;
    try {
      const res = await fetch(`${API}/materia/get_all_materia/`);
      materias = await res.json();
    } finally {
      cargando = false;
    }
  }

  async function cargarProgramas() {
    const res = await fetch(`${API}/programa/get_programas/`);
    programas = await res.json();
  }

  onMount(() => {
    cargarMaterias();
    cargarProgramas();
  });

  async function enviar(e) {
    e.preventDefault();
    error = '';

    if (!materia.id_programa) {
      error = "Selecciona un programa";
      return;
    }

    const url = editando
      ? `${API}/materia/update_materia/${materia.id_materia}`
      : `${API}/materia/create_materia/`;

    const res = await fetch(url, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materia)
    });

    if (!res.ok) {
      error = await res.text();
      return;
    }

    if (editando) {
      // ── Bug 2 fix: reconstruir fila localmente ─────────────────────────
      const prog = programas.find(p => p.id_programa == materia.id_programa);
      const actualizada = { ...materia, nombre_programa: prog?.nombre_programa ?? '' };
      materias = materias.map(m =>
        m.id_materia === materia.id_materia ? actualizada : m
      );
    } else {
      const data = await res.json();
      // El POST retorna solo {id_materia, message}, completamos el objeto
      const prog = programas.find(p => p.id_programa == materia.id_programa);
      materias = [...materias, {
        ...materia,
        id_materia:      data.id_materia,
        nombre_programa: prog?.nombre_programa ?? ''
      }];
    }

    limpiar();
    // ── Bug 4 fix: limpiar mensaje de éxito ────────────────────────────
    success = "Operación exitosa";
    setTimeout(() => success = '', 3000);
  }

  function editarMateria(m) {
    materia   = { ...m };
    editando  = true;
  }

  function limpiar() {
    materia = {
      id_materia:     null,
      nombre_materia: '',
      codigo_materia: '',
      creditos:       '',
      id_programa:    ''
    };
    editando = false;
  }

  async function eliminarMateria(id) {
    const res = await fetch(`${API}/materia/delete_materia/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      error = "Error al eliminar la materia";
      return;
    }
    materias = materias.filter(m => m.id_materia !== id);
  }
</script>

<div class="page">
  <!-- Encabezado -->
  <div class="page-header">
    <div>
      <h1 class="page-title">Gestión de materias</h1>
      <p class="page-sub">Crea y administra el catálogo de materias</p>
    </div>
    <span class="badge-pill">{materias.length} materias</span>
  </div>

  <!-- Stats -->
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

  <!-- Alertas -->
  {#if error}
    <div class="alert alert-danger">
      {error}
      <button class="alert-close" type="button" onclick={() => error = ''}>✕</button>
    </div>
  {/if}

  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  <!-- Formulario -->
  <div class="form-panel">
    <div class="panel-label">
      {editando ? 'Editar materia' : 'Agregar nueva materia'}
    </div>

    <form onsubmit={enviar}>
      <div class="form-row">
        <div class="field">
          <label for="nombre_materia">Nombre de la materia</label>
          <input id="nombre_materia" bind:value={materia.nombre_materia} required />
        </div>

        <div class="field">
          <label for="codigo_materia">Código</label>
          <input id="codigo_materia" bind:value={materia.codigo_materia} required />
        </div>

        <div class="field">
          <label for="creditos">Créditos</label>
          <input id="creditos" type="number" min="1" bind:value={materia.creditos} required />
        </div>

        <div class="field">
          <label for="id_programa">Programa</label>
          <select id="id_programa" bind:value={materia.id_programa} required>
            <option value="">Seleccione un programa...</option>
            {#each programas as p}
              <option value={p.id_programa}>
                {p.nombre_programa} 
                {#if p.facultad} — {p.facultad}{/if}
              </option>
            {/each}
          </select>
        </div>

        <div class="field field-actions">
          <button type="submit" class="btn btn-success">
            {editando ? 'Guardar cambios' : 'Crear materia'}
          </button>
          {#if editando}
            <button type="button" class="btn btn-ghost" onclick={limpiar}>Cancelar</button>
          {/if}
        </div>
      </div>
    </form>
  </div>

  <!-- Tabla -->
  <DataTable
    data={materias}
    {columns}
    {searchKeys}
    {cargando}
    exportName="materias"
    emptyText="No hay materias registradas"
  >
    {#snippet acciones({ row })}
      <button class="act-btn warn" type="button" onclick={() => editarMateria(row)}>
        Editar
      </button>
      <button class="act-btn danger" type="button" onclick={() => eliminarMateria(row.id_materia)}>
        Eliminar
      </button>
    {/snippet}
  </DataTable>
</div>