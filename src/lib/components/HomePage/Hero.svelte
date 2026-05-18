<script>
  const stats = [
    { num: '3,200+', label: 'Estudiantes activos' },
    { num: '180',    label: 'Tutores disponibles' },
    { num: '94%',    label: 'Satisfacción estudiantil' },
  ];
</script>

<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-grid-overlay"></div>

  <div class="hero-content">
    <div class="hero-badge">
      <div class="hero-badge-dot"></div>
      <span>Sistema institucional</span>
    </div>

    <h1>Gestión de<br><em>Tutorías</em><br>Académicas</h1>

    <p>
      Conectamos estudiantes con tutores de forma eficiente. Agenda, supervisa
      y haz seguimiento a tus sesiones de acompañamiento desde un solo lugar.
    </p>

    <div class="hero-btns">
      <a href="/Login" class="btn-primary">Agendar tutoría</a>
    </div>
  </div>
</section>

<style>
  .hero {
    min-height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      #020024 0%,
      #090979 35%,
      #0077ff 100%
    );
  }

  /* Fondo con imagen + overlay premium */
  .hero-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(
        to right,
        rgba(2, 6, 55, 0.88) 25%,
        rgba(10, 60, 170, 0.70) 100%
      ),
     url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80');
    background-size: cover;
    background-position: center;
  }

  /* Grid elegante */
  .hero-grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 79px,
        rgba(255,255,255,0.03) 80px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 79px,
        rgba(255,255,255,0.03) 80px
      );
  }

  /* Glow decorativo */
  .hero::before {
    content: "";
    position: absolute;
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba(0,255,255,0.18),
      transparent 70%
    );
    top: -120px;
    right: -100px;
    border-radius: 50%;
    z-index: 1;
  }

  .hero::after {
    content: "";
    position: absolute;
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(140, 82, 255, 0.20),
      transparent 70%
    );
    bottom: -100px;
    left: -80px;
    border-radius: 50%;
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 140px 3rem 80px;
    width: 100%;
  }

  /* Badge glass */
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 999px;
    margin-bottom: 2rem;
    background: rgba(255,255,255,0.10);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .hero-badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00eaff;
    box-shadow: 0 0 12px #00eaff;
  }

  .hero-badge span {
    font-size: 12px;
    color: #dbeafe;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* Título */
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.6rem, 5vw, 4.8rem);
    font-weight: 700;
    color: white;
    line-height: 1.1;
    max-width: 650px;
    margin-bottom: 1.5rem;
    text-shadow: 0 3px 20px rgba(0,0,0,0.35);
  }

  h1 em {
    color: #8be9fd;
    text-shadow: 0 0 20px rgba(139,233,253,0.4);
    font-style: normal;
  }

  /* Texto */
  p {
    font-size: 17px;
    color: rgba(255,255,255,0.82);
    max-width: 530px;
    line-height: 1.8;
    margin-bottom: 2.5rem;
  }

  /* Botón moderno */
  .btn-primary {
    display: inline-block;
    text-decoration: none;
    background: linear-gradient(
      135deg,
      #ffffff,
      #dbeafe
    );
    color: #0f172a;
    padding: 15px 30px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 15px;
    box-shadow:
      0 10px 30px rgba(0,0,0,0.2),
      0 0 20px rgba(255,255,255,0.1);
    transition: all 0.25s ease;
  }

  .btn-primary:hover {
    transform: translateY(-3px);
    box-shadow:
      0 14px 35px rgba(0,0,0,0.25),
      0 0 25px rgba(255,255,255,0.2);
  }

  /* Stats */
  .hero-stats {
    display: flex;
    gap: 3rem;
    margin-top: 3.5rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.12);
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-num {
    font-size: 2rem;
    font-weight: 700;
    color: white;
  }

  .stat-label {
    color: rgba(255,255,255,0.65);
    font-size: 13px;
  }

  /* Tablet */
  @media (max-width: 860px) {
    .hero-content {
      padding: 130px 2rem 60px;
    }
  }

  /* Mobile */
  @media (max-width: 480px) {
    .hero-content {
      padding: 110px 1.25rem 50px;
      text-align: center;
    }

    h1 {
      font-size: clamp(2rem, 8vw, 2.8rem);
    }

    p {
      font-size: 15px;
      max-width: 100%;
    }

    .hero-badge {
      justify-content: center;
    }

    .btn-primary {
      width: 100%;
      text-align: center;
    }

    .hero-stats {
      justify-content: center;
      gap: 1rem;
    }

    .stat-item {
      align-items: center;
    }
  }
</style>