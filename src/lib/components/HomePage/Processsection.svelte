<script>
  const steps = [
    {
      num: '1',
      title: 'Crea tu cuenta',
      desc: 'Regístrate con tu correo institucional y completa tu perfil académico.',
    },
    {
      num: '2',
      title: 'Elige tu tutor',
      desc: 'Busca por asignatura o área y revisa el perfil de cada tutor disponible.',
    },
    {
      num: '3',
      title: 'Agenda la sesión',
      desc: 'Selecciona fecha, hora y modalidad (presencial o virtual) según disponibilidad.',
    },
    {
      num: '4',
      title: 'Asiste y avanza',
      desc: 'Recibe acompañamiento, registra tu progreso y solicita nuevas sesiones.',
    },
  ];
</script>

<div class="process-wrapper">
  <div class="section">
    <div class="section-tag-light">Proceso</div>
    <div class="process-title">Así de simple es comenzar</div>

    <div class="process-steps">
      {#each steps as step, i}
        <div class="process-step">
          {#if i < steps.length - 1}
            <div class="connector" aria-hidden="true"></div>
          {/if}
          <div class="step-num">{step.num}</div>
          <h4>{step.title}</h4>
          <p>{step.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .process-wrapper {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(96, 165, 250, 0.15), transparent 35%),
      radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.18), transparent 35%),
      linear-gradient(135deg, #07152f 0%, #0b1f44 45%, #12306a 100%);
  }

  /* Glow decorativo */
  .process-wrapper::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 280px;
    height: 280px;
    background: rgba(96, 165, 250, 0.12);
    filter: blur(90px);
    border-radius: 50%;
  }

  .section {
    position: relative;
    z-index: 2;
  }

  .section-tag-light {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 1rem;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #93c5fd;
    backdrop-filter: blur(8px);
  }

  .section-tag-light::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #60a5fa;
    box-shadow: 0 0 12px rgba(96,165,250,0.9);
  }

  .process-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    color: #ffffff;
    line-height: 1.15;
    max-width: 650px;
    margin-bottom: 0;
  }

  /* ── Grid ── */
  .process-steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    margin-top: 4rem;
    position: relative;
  }

  .process-step {
    position: relative;
    padding: 2rem 1.5rem;
    border-radius: 22px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(12px);
    transition:
      transform 0.3s ease,
      background 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .process-step:hover {
    transform: translateY(-8px);
    background: rgba(255,255,255,0.08);
    border-color: rgba(96,165,250,0.45);
    box-shadow:
      0 12px 35px rgba(0,0,0,0.28),
      0 0 30px rgba(59,130,246,0.12);
  }

  /* Línea conectora */
  .connector {
    position: absolute;
    top: 40px;
    left: calc(100% - 10px);
    width: 2rem;
    height: 2px;
    background: linear-gradient(
      to right,
      rgba(96,165,250,0.4),
      rgba(255,255,255,0.15)
    );
  }

  .step-num {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background:
      linear-gradient(135deg, #2563eb, #60a5fa);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin-bottom: 1.4rem;
    box-shadow:
      0 10px 25px rgba(37,99,235,0.35),
      inset 0 1px 0 rgba(255,255,255,0.2);
  }

  .process-step h4 {
    font-size: 17px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 0.7rem;
  }

  .process-step p {
    font-size: 14px;
    color: rgba(255,255,255,0.72);
    line-height: 1.7;
    margin: 0;
  }

  /* ── Tablet ── */
  @media (max-width: 860px) {
    .process-steps {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .connector {
      display: none;
    }
  }

  /* ── Móvil ── */
  @media (max-width: 520px) {
    .process-title {
      font-size: 2rem;
    }

    .process-steps {
      grid-template-columns: 1fr;
      margin-top: 2.5rem;
    }

    .process-step {
      padding: 1.5rem;
    }

    .step-num {
      width: 50px;
      height: 50px;
      font-size: 18px;
      border-radius: 15px;
      margin-bottom: 1rem;
    }

    .process-step h4 {
      font-size: 16px;
    }

    .process-step p {
      font-size: 13px;
    }
  }
</style>