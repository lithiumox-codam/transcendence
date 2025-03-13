<script lang="ts">
	import * as BABYLON from "babylonjs";
	import { onMount } from "svelte";
	import type { GameState } from "@repo/game";
	import { client } from "$lib/trpc";

	let canvas = $state<HTMLCanvasElement>();
	let engine = $state<BABYLON.Engine>();
	let scene = $state<BABYLON.Scene>();

	let gameState = $state<GameState | null>(null);
	let playerId = $state<number | null>(null);
	let gameId = $state<number | null>(null);

	let ground = $state<BABYLON.Mesh>();
	let leftPaddle = $state<BABYLON.Mesh>();
	let rightPaddle = $state<BABYLON.Mesh>();
	let ball = $state<BABYLON.Mesh>();
	let ballLight = $state<BABYLON.PointLight>();

	onMount(async () => {
		const id = await client.game.create.mutate(2);
		gameId = id;
	});
</script>
