<script>
	import '../app.css';
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();
</script>

{@render children()}
