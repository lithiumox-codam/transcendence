<script>
	import client from '$lib/utils/axios';

	/**
	 * @param {string | Blob} file
	 */
	export async function uploadAvatar(file) {
		const formData = new FormData();
		formData.append('avatar', file);

		// Override default content-type to let browser set it with boundary
		const config = {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		};

		try {
			const response = await client.post('/user/avatar/', formData, config);
			return response.data;
		} catch (error) {
			console.error('Error uploading avatar:', error);
			throw error;
		}
	}

	let file = $state(null);
	let previewUrl = $state(null);
	let loading = $state(false);
	let error = $state(null);

	/**
	 * @param {{ target: { files: any[]; }; }} event
	 */
	function handleFileSelect(event) {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			file = selectedFile;
			// Create preview URL
			previewUrl = URL.createObjectURL(selectedFile);
		}
	}

	async function handleUpload() {
		if (!file) {
			error = 'Please select a file first';
			return;
		}

		loading = true;
		error = null;

		try {
			await uploadAvatar(file);
			// Optional: Trigger a refresh of user data or show success message
		} catch (e) {
			error = 'Failed to upload avatar';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	// Cleanup preview URL when component is destroyed
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
	});
</script>

<div class="avatar-upload">
	{#if previewUrl}
		<img src={previewUrl} alt="Avatar preview" class="preview" />
	{/if}

	<div class="upload-controls">
		<input type="file" accept="image/*" onchange={handleFileSelect} id="avatar-input" />
		<button onclick={handleUpload} disabled={loading || !file}>
			{loading ? 'Uploading...' : 'Upload Avatar'}
		</button>
	</div>

	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.avatar-upload {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.preview {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #ccc;
	}

	.upload-controls {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.error {
		color: red;
		font-size: 0.875rem;
	}

	button {
		padding: 0.5rem 1rem;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	button:hover:not(:disabled) {
		background-color: #45a049;
	}
</style>
