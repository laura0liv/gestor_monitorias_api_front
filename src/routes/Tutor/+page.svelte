<script>
  import { agregarTutor } from "$lib/tutores.js";

  let programa = "";
  let semestre = "";
  let materia = "";
  let aula = "";
  let nombreTutor = "";

  function guardar() {
    // Guardamos el tutor en la lista
    agregarTutor(nombreTutor, materia);

    alert(`Tutor registrado:\nNombre: ${nombreTutor}\nPrograma: ${programa}\nSemestre: ${semestre}\nMateria: ${materia}\nAula: ${aula}`);

    // limpiar campos
    programa = "";
    semestre = "";
    materia = "";
    aula = "";
    nombreTutor = "";
  }
</script>

<div class="container mt-5">
  <h1 class="text-center mb-4">Panel del Tutor</h1>

  <form class="card shadow p-4" on:submit|preventDefault={guardar}>
    <div class="mb-3">
      <label for="nombreTutor" class="form-label">Nombre del Tutor</label>
      <input id="nombreTutor" type="text" class="form-control" bind:value={nombreTutor} />
    </div>

    <div class="mb-3">
      <label for="programa" class="form-label">Programa</label>
      <input id="programa" type="text" class="form-control" bind:value={programa} />
    </div>

    <div class="mb-3">
      <label for="semestre" class="form-label">Semestre</label>
      <input id="semestre" type="text" class="form-control" bind:value={semestre} />
    </div>

    <div class="mb-3">
      <label for="materia" class="form-label">Materia</label>
      <input id="materia" type="text" class="form-control" bind:value={materia} />
    </div>

    <div class="mb-3">
      <label for="aula" class="form-label">Aula</label>
      <input id="aula" type="text" class="form-control" bind:value={aula} />
    </div>

    <button type="submit" class="btn btn-primary w-100">Guardar</button>
  </form>
</div>