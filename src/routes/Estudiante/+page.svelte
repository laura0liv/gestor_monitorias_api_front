<script>
  import { tutores } from "$lib/tutores.js";

  let profesor = "";
  let horario = "";

  function reservar() {
    alert(`Tutor: ${profesor}\nHorario: ${horario}`);
  }
</script>

<div class="container mt-5">
  <h1 class="text-center mb-4">Panel del Estudiante</h1>

  <form class="card shadow p-4" on:submit|preventDefault={reservar}>
    <div class="mb-3">
      <label for="profesor" class="form-label">Profesor para tutoría</label>
      <select id="profesor" class="form-select" bind:value={profesor}>
        <option value="">Seleccione un tutor</option>
        {#each tutores as t}
          <option value={t.nombre}>{t.nombre} - {t.materia}</option>
        {/each}
      </select>
    </div>

    <div class="mb-3">
      <label for="horario" class="form-label">Horario disponible</label>
      <input id="horario" type="text" class="form-control" bind:value={horario} />
    </div>

    <button type="submit" class="btn btn-success w-100">Reservar</button>
  </form>
</div>