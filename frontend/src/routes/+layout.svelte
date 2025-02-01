<script>
	import '../app.css';
	import 'bootstrap/scss/bootstrap.scss';
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();
</script>

{@render children()}
