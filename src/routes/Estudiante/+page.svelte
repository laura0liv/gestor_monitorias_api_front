<script>
  import { materias } from "$lib/materias.js";   // lista de materias disponibles
  import { monitores } from "$lib/monitores.js"; // lista de monitores con materia y horarios

  let materiaSeleccionada = "";
  let monitorSeleccionado = "";
  let horarioSeleccionado = "";

  let monitoresFiltrados = [];

  // Acción 1: Consultar materias disponibles
  // Acción 2: Filtrar monitores según la materia seleccionada
  function filtrarMonitores() {
    monitoresFiltrados = monitores.filter(m => m.materia === materiaSeleccionada);
    monitorSeleccionado = "";
    horarioSeleccionado = "";
  }

  // Acción 3: Reservar monitoría (selección completa)
  function reservar() {
    alert(`Materia: ${materiaSeleccionada}
Monitor: ${monitorSeleccionado}
Horario: ${horarioSeleccionado}`);
    // Aquí luego se conectará con la API (POST reserva)
  }
</script>

<div class="container mt-5">
  <h1 class="text-center mb-4">Panel del Estudiante</h1>

  <form class="card shadow p-4" on:submit|preventDefault={reservar}>
    <!-- Selección de materia -->
    <div class="mb-3">
      <label for="materia" class="form-label">Materia</label>
      <select id="materia" class="form-select" bind:value={materiaSeleccionada} on:change={filtrarMonitores}>
        <option value="">Seleccione una materia</option>
        {#each materias as m}
          <option value={m}>{m}</option>
        {/each}
      </select>
    </div>

    <!-- Selección de monitor según materia -->
    {#if monitoresFiltrados.length > 0}
      <div class="mb-3">
        <label for="monitor" class="form-label">Monitor disponible</label>
        <select id="monitor" class="form-select" bind:value={monitorSeleccionado}>
          <option value="">Seleccione un monitor</option>
          {#each monitoresFiltrados as monitor}
            <option value={monitor.nombre}>{monitor.nombre} - {monitor.materia}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Selección de horario según monitor -->
    {#if monitorSeleccionado}
      <div class="mb-3">
        <label for="horario" class="form-label">Horario disponible</label>
        <select id="horario" class="form-select" bind:value={horarioSeleccionado}>
          <option value="">Seleccione un horario</option>
          {#each monitoresFiltrados.find(m => m.nombre === monitorSeleccionado).horarios as h}
            <option value={h}>{h}</option>
          {/each}
        </select>
      </div>
    {/if}

    <!-- Confirmar reserva -->
    <button type="submit" class="btn btn-success w-100" disabled={!materiaSeleccionada || !monitorSeleccionado || !horarioSeleccionado}>
      Reservar
    </button>
  </form>
</div>