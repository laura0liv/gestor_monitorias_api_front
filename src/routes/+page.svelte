<script>
  import Hero from '$lib/components/HomePage/Hero.svelte';
  import Features from '$lib/components/HomePage/Features.svelte';
   import Rolessection from '$lib/components/HomePage/Rolessection.svelte';
  import Processsection from '$lib/components/HomePage/Processsection.svelte';
  import Footer from '$lib/components/HomePage/Footer.svelte';
</script>

<div class="homepage">
  <Hero />
  <Features />
  <Rolessection />
  <Processsection />
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