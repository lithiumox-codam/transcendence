<script>
    import client from '$lib/utils/axios';
	import { onMount } from 'svelte';
    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();

    onMount(async () => {
        try {
            const res = await client.get('/user/profile/');
            if (res.status === 200) {
                console.log(res.data);
            } else {
                throw new Error('Failed to get profile');
            }
        } catch (e) {
            console.error(e);
        }
    });
</script>

<a href="/login">login</a>
<a href="/signup">signup</a>