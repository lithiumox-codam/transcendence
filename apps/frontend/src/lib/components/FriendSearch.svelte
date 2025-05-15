<script lang="ts">
	import { client } from "$lib/trpc";
	import { getContext } from "svelte";
	import type { UserClass } from "$lib/classes/User.svelte";
	import Avatar from "$lib/components/Avatar.svelte";
	import { X, Plus } from "@lucide/svelte"; // Import Plus icon

	const user = getContext<UserClass>("user");

	let searchTerm = $state("");
	let results = $state<
		{ id: number; name: string; email: string; avatar?: string }[]
	>([]);
	let selectedIndex = $state(0);
	let inputElement: HTMLInputElement;
	let isSearching = $state(false); // State to control background blur

	$effect(() => {
		(async () => {
			const trimmedSearch = searchTerm.trim();
			isSearching = trimmedSearch.length > 0; // Update searching state based on input content

			if (trimmedSearch) {
				try {
					const res = await client.user.search.query(trimmedSearch);
					results = res.filter((result) => {
						return (
							!user.isFriend(result.id) &&
							!user.hasSentRequestTo(result.id) &&
							!user.hasIncomingRequestFrom(result.id) &&
							result.isDeleted !== 1 &&
							result.id !== user.data?.id
						);
					});
					selectedIndex = 0;
				} catch (error) {
					console.error("Error searching for friends:", error);
					results = [];
				}
			} else {
				results = [];
			}
		})();
	});

	async function addFriend(friendId: number) {
		try {
			await user.sendFriendRequest(friendId);
			searchTerm = "";
			results = [];
			isSearching = false; // Stop searching after adding friend
			inputElement?.blur(); // Optionally remove focus
		} catch (error) {
			console.error("Error adding friend:", error);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!results.length && event.key !== "Escape") return;

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				selectedIndex = (selectedIndex + 1) % results.length;
				break;
			case "ArrowUp":
				event.preventDefault();
				selectedIndex =
					(selectedIndex - 1 + results.length) % results.length;
				break;
			case "Enter":
				event.preventDefault();
				if (results[selectedIndex]) {
					addFriend(results[selectedIndex].id);
				}
				break;
			case "Escape":
				event.preventDefault();
				searchTerm = "";
				results = [];
				isSearching = false; // Stop searching on Escape
				inputElement?.blur(); // Remove focus
				break;
		}
	}

	function handleFocus() {
		isSearching = true;
	}

	function handleBlur() {
		// Delay blur handling slightly to allow clicks on results
		setTimeout(() => {
			if (!searchTerm.trim()) {
				isSearching = false;
			}
		}, 150);
	}
</script>

{#if isSearching}
	<div
		class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
		aria-hidden="true"
	></div>
{/if}

<div class="relative w-full mb-3 z-50">
	{" "}
	<div class="relative">
		<input
			type="text"
			placeholder="Search for friends..."
			bind:value={searchTerm}
			bind:this={inputElement}
			onkeydown={handleKeydown}
			onfocus={handleFocus}
			onblur={handleBlur}
			autocomplete="off"
			class="w-full px-4 py-2 bg-black/10 border border-white/10 rounded-md text-gray-200 placeholder-gray-400/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
		/>
		{#if searchTerm}
			<button
				class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-600/50 transition-colors"
				onclick={() => {
					searchTerm = "";
					inputElement.focus(); // Keep focus on input after clearing
				}}
				aria-label="Clear search"
			>
				<X class="w-4 h-4" />
			</button>
		{/if}
	</div>
	{#if results.length > 0}
		<div
			class="absolute z-50 w-full mt-1 bg-black/80 border border-white/10 rounded-md shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-md max-h-80 overflow-y-auto"
		>
			{#each results as resultUser, i}
				<div
					class="flex items-center w-full px-4 py-3 text-left transition-colors border-b border-white/10 last:border-b-0 {i ===
					selectedIndex
						? 'bg-white/20'
						: 'hover:bg-white/20'}"
				>
					<div class="flex-shrink-0 w-10 h-10 mr-3">
						<Avatar
							name={resultUser.name}
							avatar={resultUser.avatar ?? null}
							class="w-full h-full text-sm"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-medium text-white truncate">
							{resultUser.name}
						</div>
						<div class="text-xs text-gray-300 truncate">
							{resultUser.email}
						</div>
					</div>

					<button
						class="cursor-pointer ml-3 w-6 h-6 rounded-full bg-white/10 border border-white/10 hover:bg-blue-600/30 flex items-center justify-center text-white transition-colors {i ===
						selectedIndex
							? 'bg-white/20'
							: ''}"
						onmouseenter={() => (selectedIndex = i)}
						onclick={() => addFriend(resultUser.id)}
					>
						<Plus class="w-4 h-4" />
					</button>
				</div>
			{/each}
		</div>
	{:else if searchTerm.trim()}
		<div
			class="absolute z-50 w-full mt-1 bg-black/80 border border-white/10 rounded-md shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-md py-4 text-center text-gray-300 text-sm"
		>
			No users found
		</div>
	{/if}
</div>
