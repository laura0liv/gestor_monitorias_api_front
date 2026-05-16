<script>
	import Navbar from '$lib/components/NavBar.svelte';
	import '$lib/styles/global.css';
	let { children } = $props();
</script>

<Navbar />

<main class="container-fluid p-0 m-0">
	{@render children()}
</main>