<script lang="ts">
	import { Toaster } from "svelte-sonner";
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	import "../app.css";

	let { children } = $props();
</script>

<main class="dark select-none">
	<Toaster position="bottom-left" richColors={true} theme="dark" />
	<ParaglideJS {i18n}>
		{@render children()}
	</ParaglideJS>
</main>
