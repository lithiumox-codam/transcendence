<script lang="ts">
    import FriendSearch from "$lib/components/FriendSearch.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

{JSON.stringify(data)}

<FriendSearch />
