<script>
  import { onMount } from "svelte";
  import { API } from "$lib/services/api";

  let {
    idEstudiante,
    materiaInicial = null,
    onExito
  } = $props();

  let paso = $state(materiaInicial ? 2 : 1);

  let materiaSeleccionada = $state(materiaInicial);
  let monitorSeleccionado = $state(null);
  let slotSeleccionado = $state(null);

  let materias = $state([]);
  let monitores = $state([]);
  let slots = $state([]);
  let idPeriodoActivo = $state(null);

  let cargando = $state(false);
  let error = $state("");
  let enviando = $state(false);

  // ─────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────

  const hhmm = (t) => (t ?? "").slice(0, 5);

  const DIAS_DOW = {
    Domingo: 0,
    Lunes: 1,
    Martes: 2,
    "Miércoles": 3,
    Jueves: 4,
    Viernes: 5,
    Sábado: 6
  };

  function proximaFecha(diaSemana) {
    const hoy = new Date();

    const dow = DIAS_DOW[diaSemana] ?? 1;

    const diff = (dow - hoy.getDay() + 7) % 7 || 7;

    const d = new Date(hoy);

    d.setDate(hoy.getDate() + diff);

    return d.toISOString().slice(0, 10);
  }

  const DIAS_ORDEN = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"
  ];

  let slotsPorDia = $derived(
    DIAS_ORDEN.reduce((acc, dia) => {
      const diaSlots = slots.filter((s) => s.dia === dia);

      if (diaSlots.length) {
        acc[dia] = diaSlots;
      }

      return acc;
    }, {})
  );

  const pasos = [
    { n: 1, label: "Materia" },
    { n: 2, label: "Monitor" },
    { n: 3, label: "Horario" }
  ];

  // ─────────────────────────────────────────────
  // CARGA INICIAL
  // ─────────────────────────────────────────────

  onMount(async () => {
    try {
      cargando = true;

      const [resMat, resDisp, resPeriodo] = await Promise.all([
        fetch(`${API}/estudiante_materia/materias/${idEstudiante}`),
        fetch(`${API}/materia/disponibles`),
        fetch(`${API}/periodo_academico/activo`)
      ]);

      if (!resMat.ok) {
        throw new Error("No se pudieron cargar las materias");
      }

      if (!resDisp.ok) {
        throw new Error("No se pudieron cargar las materias disponibles");
      }

      if (!resPeriodo.ok) {
        throw new Error("No hay un periodo académico activo");
      }

      const todasLasMias = await resMat.json();
      const conMonitor = await resDisp.json();
      const periodo = await resPeriodo.json();

      idPeriodoActivo = periodo.id_periodo;

      const idsConMonitor = new Set(
        conMonitor.map((m) => m.id_materia)
      );

      materias = todasLasMias.filter((m) =>
        idsConMonitor.has(m.id_materia)
      );

      if (materiaInicial) {
        await cargarMonitores(materiaInicial);
      }

    } catch (e) {
      console.error(e);

      error = e.message ?? "No fue posible cargar la información.";

    } finally {
      cargando = false;
    }
  });

  // ─────────────────────────────────────────────
  // CARGAR MONITORES
  // ─────────────────────────────────────────────

  async function cargarMonitores(m) {
    monitores = [];
    slots = [];

    monitorSeleccionado = null;
    slotSeleccionado = null;

    error = "";

    try {
      cargando = true;

      const res = await fetch(
        `${API}/monitores/por_materia/${m.id_materia}`
      );

      if (res.status === 404) {
        monitores = [];
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      console.log("MONITORES:", data);

      monitores = data.sort(
        (a, b) =>
          (b.promedio_calificacion || 0) -
          (a.promedio_calificacion || 0)
      );

    } catch (e) {
      console.error(e);

      error = "No fue posible cargar los monitores.";

    } finally {
      cargando = false;
    }
  }

  // ─────────────────────────────────────────────
  // PASO 1 → 2
  // ─────────────────────────────────────────────

  async function seleccionarMateria(m) {
    materiaSeleccionada = m;

    await cargarMonitores(m);

    paso = 2;
  }

  // ─────────────────────────────────────────────
  // PASO 2 → 3
  // ─────────────────────────────────────────────

  async function seleccionarMonitor(mon) {

    console.log("MONITOR SELECCIONADO:", mon);

    monitorSeleccionado = mon;

    slotSeleccionado = null;
    slots = [];

    error = "";

    try {
      cargando = true;

      // IMPORTANTE:
      // verifica cuál campo realmente existe:
      // mon.id_monitor o mon.id_usuario

      const idMonitor =
        mon.id_monitor ??
        mon.id_usuario;

      console.log("ID MONITOR:", idMonitor);

      const res = await fetch(
        `${API}/disponibilidad/get_disponibilidad/${idMonitor}`
      );

      if (!res.ok) {

        const err = await res.json().catch(() => ({}));

        console.error("ERROR BACKEND:", err);

        throw new Error(
          err.detail ?? `HTTP ${res.status}`
        );
      }

      const raw = await res.json();

      console.log("DISPONIBILIDAD:", raw);

      slots = raw.map((s) => ({
        dia: s.dia_semana?.trim(),
        hora_inicio: hhmm(s.hora_inicio),
        hora_fin: hhmm(s.hora_fin)
      }));

      console.log("SLOTS FORMATEADOS:", slots);

      paso = 3;

    } catch (e) {

      console.error(e);

      error =
        e.message ??
        "No fue posible cargar la disponibilidad.";

    } finally {
      cargando = false;
    }
  }

  // ─────────────────────────────────────────────
  // ENVIAR SOLICITUD
  // ─────────────────────────────────────────────

  async function enviarSolicitud() {

    if (!slotSeleccionado) {
      return;
    }

    enviando = true;

    error = "";

    try {

      const idMonitor =
        monitorSeleccionado.id_monitor ??
        monitorSeleccionado.id_usuario;

      const body = {
        id_monitor: idMonitor,
        id_estudiante: idEstudiante,
        id_materia: materiaSeleccionada.id_materia,
        id_aula: null,

        fecha: proximaFecha(slotSeleccionado.dia),

        hora_inicio: slotSeleccionado.hora_inicio,
        hora_fin: slotSeleccionado.hora_fin,

        modalidad: "Presencial",

        id_periodo: idPeriodoActivo,

        observaciones: null
      };

      console.log("BODY:", body);

      const res = await fetch(
        `${API}/monitorias/solicitar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );

      if (!res.ok) {

        const data = await res.json().catch(() => ({}));

        throw new Error(
          data.detail ?? `HTTP ${res.status}`
        );
      }

      // RESET

      paso = 1;

      materiaSeleccionada = null;
      monitorSeleccionado = null;
      slotSeleccionado = null;

      monitores = [];
      slots = [];

      onExito?.();

    } catch (e) {

      console.error(e);

      error = e.message;

    } finally {
      enviando = false;
    }
  }
</script>