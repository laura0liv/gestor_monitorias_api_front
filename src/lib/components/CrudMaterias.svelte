<script>
  import { onMount } from "svelte";

  let materias = $state([]);
  let cargando = $state(false);
  let error = $state("");
  let editando = $state(false);

  let materia = $state({
    id_materia: null,
    nombre_materia: "",
    codigo_materia: "",
    creditos: "",
    id_programa: ""
  });

  async function cargarMaterias() {
    cargando = true;
    error = "";
    try {
      const res = await fetch("http://127.0.0.1:8000/materia/get_all_materia/");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  }

  onMount(() => cargarMaterias());

  async function crearMateria() {
    const res = await fetch("http://127.0.0.1:8000/materia/create_materia/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materia)
    });
    const nueva = await res.json();
    materias = [...materias, nueva];
    limpiar();
  }

  function editarMateria(m) {
    materia = { ...m };
    editando = true;
  }

  async function actualizarMateria() {
    const res = await fetch(`http://127.0.0.1:8000/materia/update_materia/${materia.id_materia}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materia)
    });
    const actualizada = await res.json();
    materias = materias.map(m =>
      m.id_materia === actualizada.id_materia ? actualizada : m
    );
    limpiar();
    editando = false;
  }

  async function eliminarMateria(id) {
    if (!confirm("¿Eliminar materia?")) return;
    await fetch(`http://127.0.0.1:8000/materia/delete_materia/${id}`, {
      method: "DELETE"
    });
    materias = materias.filter(m => m.id_materia !== id);
  }

  function limpiar() {
    materia = {
      id_materia: null,
      nombre_materia: "",
      codigo_materia: "",
      creditos: "",
      id_programa: ""
    };
    editando = false;
  }

  function enviarFormulario(e) {
    e.preventDefault();
    editando ? actualizarMateria() : crearMateria();
  }
</script>

<div class="card shadow-sm border-0">
  <div class="card-header bg-success text-white d-flex align-items-center justify-content-between">
    <span class="fw-semibold">Gestión de Materias</span>
    <span class="badge bg-white text-success">{materias.length} registros</span>
  </div>

  <div class="card-body">

    <!-- FORMULARIO -->
    <form onsubmit={enviarFormulario}>
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label fw-semibold small">Nombre materia</label>
          <input class="form-control" bind:value={materia.nombre_materia} required />
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small">Código</label>
          <input class="form-control" bind:value={materia.codigo_materia} required />
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small">Créditos</label>
          <input type="number" class="form-control" bind:value={materia.creditos} required />
        </div>
        <div class="col-md-3">
          <label class="form-label fw-semibold small">ID Programa</label>
          <input type="number" class="form-control" bind:value={materia.id_programa} required />
        </div>
      </div>

      <div class="d-flex gap-2 mt-3">
        <button type="submit" class="btn btn-success btn-sm">
          {editando ? "Actualizar materia" : "Crear materia"}
        </button>
        {#if editando}
          <button type="button" class="btn btn-outline-secondary btn-sm" onclick={limpiar}>
            Cancelar
          </button>
        {/if}
      </div>
    </form>

    <hr />

    <!-- ESTADO DE CARGA -->
    {#if cargando}
      <div class="text-center py-4 text-muted">
        <div class="spinner-border spinner-border-sm me-2"></div>
        Cargando materias...
      </div>
    {:else if error}
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div>
          <strong>Error:</strong> {error}
          <button class="btn btn-sm btn-outline-danger ms-2" onclick={cargarMaterias}>Reintentar</button>
        </div>
      </div>
    {:else if materias.length === 0}
      <div class="alert alert-warning">No hay materias registradas.</div>
    {:else}

      <!-- TABLA -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Materia</th>
              <th>Código</th>
              <th>Créditos</th>
              <th>Programa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#each materias as m, i}
              <tr>
                <td class="text-muted small">{i + 1}</td>
                <td class="fw-semibold">{m.nombre_materia}</td>
                <td><span class="badge bg-secondary">{m.codigo_materia}</span></td>
                <td>{m.creditos}</td>
                <td>{m.id_programa}</td>
                <td>
                  <button class="btn btn-warning btn-sm me-1" onclick={() => editarMateria(m)}>
                    Editar
                  </button>
                  <button class="btn btn-danger btn-sm" onclick={() => eliminarMateria(m.id_materia)}>
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