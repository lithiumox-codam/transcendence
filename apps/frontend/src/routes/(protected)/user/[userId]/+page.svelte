<script lang="ts">
    import type { PageData } from "./$types";
    let { data }: { data: PageData } = $props();
</script>

<header
    class="flex items-center p-8 bg-gray-800 shadow-2xl border-b border-gray-600"
>
    <img
        class="w-24 h-24 rounded-full mr-8 border-4 border-double border-gray-400 filter drop-shadow"
        src="/favicon.png"
        alt="User Avatar"
    />
    <div>
        <h1 class="text-3xl font-extrabold text-white drop-shadow">
            {data.user.name}
        </h1>
        <p class="text-lg text-gray-300 italic">
            {data.user.email}
        </p>
    </div>
</header>
