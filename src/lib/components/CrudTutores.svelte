<script>
  import { onMount } from "svelte";

  let tutores = $state([]);
  let materias = $state([]);
  let cargando = $state(false);
  let cargandoAsignacion = $state(false);
  let error = $state("");
  let successMsg = $state("");
  let searchQuery = $state("");
  let monitorSeleccionado = $state("");
  let materiaSeleccionada = $state("");

  const API = "http://127.0.0.1:8000";

  async function cargarTutores() {
    cargando = true;
    error = "";
    try {
      const res = await fetch(`${API}/monitor_materia/get_monitors_and_subjects/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      tutores = await res.json();
    } catch (e) {
      error = e.message;
    } finally {
      cargando = false;
    }
  }

  async function cargarMaterias() {
    try {
      const res = await fetch(`${API}/materia/get_all_materia/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      materias = await res.json();
    } catch (e) {
      error = e.message;
    }
  }

  async function asignarMateria() {
    if (!monitorSeleccionado || !materiaSeleccionada) {
      error = "Selecciona tutor y materia";
      return;
    }
    cargandoAsignacion = true;
    error = "";
    try {
      // ✅ Sin barra final
      const res = await fetch(`${API}/monitor_materia/create_monitor_materia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_monitor: Number(monitorSeleccionado),
          id_materia: Number(materiaSeleccionada)
        })
      });
      const data = await res.json();
      if (data.message && !data.id_monitor) {
        error = data.message; // "Ya existe la asignación"
      } else {
        successMsg = "Materia asignada correctamente";
        setTimeout(() => successMsg = "", 3000);
      }
      await cargarTutores();
      monitorSeleccionado = "";
      materiaSeleccionada = "";
    } catch (e) {
      error = e.message;
    } finally {
      cargandoAsignacion = false;
    }
  }

  async function eliminarAsignacion(id_monitor, id_materia) {
    if (!confirm("¿Quitar esta materia del tutor?")) return;
    try {
      // ✅ Query params, usa id_monitor correcto
      const res = await fetch(
        `${API}/monitor_materia/delete_monitor_materia?id_monitor=${id_monitor}&id_materia=${id_materia}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Error al eliminar");
      successMsg = "Materia eliminada";
      setTimeout(() => successMsg = "", 3000);
      await cargarTutores();
    } catch (e) {
      error = e.message;
    }
  }

  // ✅ Filtra por nombre y por nombre_materia (ahora es objeto)
  let tutoresFiltrados = $derived(
    (tutores ?? []).filter(t =>
      `${t.nombre} ${t.apellido}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.materias ?? []).some(m =>
        m.nombre_materia.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );

  onMount(() => {
    cargarTutores();
    cargarMaterias();
  });
</script>

<div class="container-fluid px-4 py-4">

  <!-- HEADER -->
  <div class="d-flex align-items-center justify-content-between mb-4">
    <h5 class="mb-0 fw-semibold">Gestión de tutorías</h5>
    <span class="badge bg-primary rounded-pill">{tutoresFiltrados.length} tutores</span>
  </div>

  <!-- ALERTAS -->
  {#if error}
    <div class="alert alert-danger d-flex align-items-center gap-2 py-2">
      <span>{error}</span>
      <button class="btn btn-sm btn-outline-danger ms-auto" on:click={() => error = ""}>✕</button>
    </div>
  {/if}
  {#if successMsg}
    <div class="alert alert-success py-2">{successMsg}</div>
  {/if}

  <!-- PANEL ASIGNACIÓN -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-header bg-light border-bottom py-2 px-3">
      <small class="text-muted fw-semibold">Asignar materia a tutor</small>
    </div>
    <div class="card-body py-3">
      <div class="row g-2 align-items-end">
        <div class="col-md-4">
          <label class="form-label small text-muted mb-1">Tutor</label>
          <select class="form-select form-select-sm" bind:value={monitorSeleccionado}>
            <option value="">Seleccionar tutor...</option>
            {#each tutores as t}
              <!-- ✅ usa id_usuario -->
              <option value={t.id_usuario}>{t.nombre} {t.apellido}</option>
            {/each}
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small text-muted mb-1">Materia</label>
          <select class="form-select form-select-sm" bind:value={materiaSeleccionada}>
            <option value="">Seleccionar materia...</option>
            {#each materias as m}
              <option value={m.id_materia}>{m.nombre_materia}</option>
            {/each}
          </select>
        </div>
        <div class="col-md-4">
          <button
            class="btn btn-success btn-sm w-100"
            on:click={asignarMateria}
            disabled={cargandoAsignacion}
          >
            {cargandoAsignacion ? "Asignando..." : "+ Asignar materia"}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- TABLA -->
  <div class="card border-0 shadow-sm">
    <div class="card-header bg-white border-bottom py-2 px-3">
      <input
        class="form-control form-control-sm"
        placeholder="Buscar por nombre o materia..."
        bind:value={searchQuery}
      />
    </div>

    {#if cargando}
      <div class="text-center py-5 text-muted">Cargando...</div>

    {:else if tutoresFiltrados.length === 0}
      <div class="text-center py-5 text-muted">Sin resultados</div>

    {:else}
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th style="width:50px">#</th>
            <th>Tutor</th>
            <th>Materias asignadas</th>
          </tr>
        </thead>
        <tbody>
          {#each tutoresFiltrados as t, i}
            <tr>
              <td class="text-muted small">{i + 1}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-semibold"
                    style="width:34px;height:34px;font-size:13px;flex-shrink:0">
                    {t.nombre[0]}{t.apellido[0]}
                  </div>
                  <div>
                    <div class="fw-semibold small">{t.nombre} {t.apellido}</div>                  </div>
                </div>
              </td>
              <td>
                {#if t.materias?.length}
                  <div class="d-flex flex-wrap gap-1">
                    {#each t.materias as m}
                      <!-- ✅ usa m.nombre_materia y m.id_materia -->
                      <span class="badge bg-secondary d-flex align-items-center gap-1 fw-normal">
                        {m.nombre_materia}
                        <button
                          class="btn-close btn-close-white"
                          style="font-size:9px"
                          on:click={() => eliminarAsignacion(t.id_usuario, m.id_materia)}
                          title="Quitar materia"
                        ></button>
                      </span>
                    {/each}
                  </div>
                {:else}
                  <span class="text-muted small">Sin materias</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>