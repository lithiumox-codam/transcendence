<script>
	let { message } = $props();

	function formatDate(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now - date) / (1000 * 60));

		if (diffInMinutes < 60) {
			return `${diffInMinutes} min ago`;
		}

		return date.toLocaleString('en-US', {
			hour: 'numeric',
			minute: 'numeric'
		});
	}
</script>

<div class="bg-light rounded p-3 mb-3">
	{#if message}
		<div class="d-flex justify-content-between align-items-center mb-2">
			<strong>{message.user}</strong>
			<span class="small text-muted">{formatDate(message.timestamp)}</span>
		</div>
		<div class="mb-0">{message.content}</div>
	{:else}
		<div class="text-danger">Message data is not available.</div>
	{/if}
</div>
