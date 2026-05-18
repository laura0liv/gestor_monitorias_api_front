<script>
  const features = [
    {
      icon: '📅',
      color: 'blue',
      title: 'Agenda inteligente',
      desc: 'Visualiza la disponibilidad de los tutores en tiempo real y reserva sesiones con confirmación automática.',
    },
    {
      icon: '📊',
      color: 'teal',
      title: 'Seguimiento académico',
      desc: 'Historial completo de sesiones, avances y recomendaciones para cada estudiante.',
    },
    {
      icon: '🔔',
      color: 'gold',
      title: 'Recordatorios automáticos',
      desc: 'Notificaciones por correo y sistema para no perder ninguna sesión programada.',
    },
    {
      icon: '🎓',
      color: 'teal',
      title: 'Perfiles de tutor',
      desc: 'Conoce la especialidad, experiencia y calificaciones de cada tutor antes de elegir.',
    },
    {
      icon: '📝',
      color: 'gold',
      title: 'Informes y reportes',
      desc: 'Reportes detallados para coordinadores sobre participación, asistencia y rendimiento.',
    },
    {
      icon: '🔒',
      color: 'blue',
      title: 'Acceso seguro',
      desc: 'Autenticación institucional con roles diferenciados para estudiantes, tutores y administradores.',
    },
  ];
</script>

<div class="features-wrapper">
  <div class="section">
    <div class="section-tag">¿Qué ofrecemos?</div>
    <div class="section-title">Todo lo que necesitas para tu acompañamiento académico</div>
    <p class="section-sub">Una plataforma centralizada para que estudiantes, tutores y coordinadores trabajen en sincronía.</p>

    <div class="features-grid">
      {#each features as feature}
        <div class="feature-card">
          <div class="feature-icon {feature.color}">{feature.icon}</div>
          <h3>{feature.title}</h3>
          <p>{feature.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .features-wrapper {
  background:
    linear-gradient(to bottom, #f4f8ff 0%, #eef4ff 100%);
  padding: 5rem 0;
  position: relative;
  overflow: hidden;
}

/* Decoración de fondo */
.features-wrapper::before {
  content: '';
  position: absolute;
  top: -120px;
  right: -120px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.08);
  filter: blur(10px);
}

.features-wrapper::after {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -100px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.08);
  filter: blur(10px);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.feature-card {
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(37, 99, 235, 0.08);
  border-radius: 22px;
  padding: 2.3rem 2rem;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease;
  position: relative;
  overflow: hidden;
}

/* Línea decorativa arriba */
.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(
    90deg,
    #2563eb,
    #3b82f6,
    #60a5fa
  );
  opacity: 0;
  transition: opacity 0.25s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 12px 30px rgba(37, 99, 235, 0.12),
    0 4px 12px rgba(0,0,0,0.05);
  border-color: rgba(37, 99, 235, 0.18);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 26px;
  position: relative;
  overflow: hidden;
}

/* Iconos en tonos azules */
.feature-icon.blue {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
}

.feature-icon.teal {
  background: linear-gradient(135deg, #dbeafe, #c7d2fe);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15);
}

.feature-icon.gold {
  background: linear-gradient(135deg, #e0e7ff, #dbeafe);
  box-shadow: 0 8px 20px rgba(96, 165, 250, 0.15);
}

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.8rem;
  letter-spacing: -0.02em;
}

.feature-card p {
  font-size: 0.92rem;
  color: #64748b;
  line-height: 1.75;
}

/* ── Tablet ── */
@media (max-width: 860px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ── Móvil ── */
@media (max-width: 480px) {
  .features-wrapper {
    padding: 4rem 0;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 1.8rem 1.4rem;
    border-radius: 18px;
  }

  .feature-icon {
    width: 52px;
    height: 52px;
    font-size: 22px;
    border-radius: 14px;
  }

  .feature-card h3 {
    font-size: 1rem;
  }

  .feature-card p {
    font-size: 0.88rem;
  }
}
</style>