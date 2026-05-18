<script>
  import Hero from './Hero.svelte';
  import Features from './Features.svelte';
  import AboutSection from './AboutSection.svelte';
  import RolesSection from './RolesSection.svelte';
  import ProcessSection from './ProcessSection.svelte';
  import Footer from './Footer.svelte';
</script>

<div class="homepage">
  <Hero />
  <Features />
   <RolesSection />
  <ProcessSection />
  <Footer />
</div>

<style>
  @import '$lib/styles/homepage.css';

  .homepage {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--text-dark);
    overflow-x: hidden;
  }
</style>