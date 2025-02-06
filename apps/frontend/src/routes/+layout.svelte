<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	import "../app.css";

	let { children } = $props();
</script>

<ParaglideJS {i18n}>
	<Header />
	{@render children()}
</ParaglideJS>
