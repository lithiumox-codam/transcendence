<script lang="ts">
    import * as BABYLON from "babylonjs";
    import { onMount, getContext } from "svelte";
    import { goto } from "$app/navigation";
    import type { GameState, Player, GameStatus } from "@repo/game";
    import { client } from "$lib/trpc";
    import ScoreCard from "./ScoreCard.svelte";
    import WinnerCard from "./WinnerCard.svelte";
    import type { UserClass } from "$lib/classes/User.svelte";

    import type { Popout } from "$lib/classes/Popout.svelte";

    let { gameId }: { gameId: number } = $props();

    const user = getContext<UserClass>("user");

    const ARENA_WIDTH = 40;
    const PADDLE_LENGTH = 6;
    const PADDLE_WIDTH = 1;
    const axisX = 0;
    const axisY = 1;
    const COLOR_ARRAY = [
        new BABYLON.Color3(1, 0, 0),
        new BABYLON.Color3(0, 1, 0),
        new BABYLON.Color3(0, 0, 1),
        new BABYLON.Color3(1, 1, 0),
    ];

    const COLOR_WHITE = new BABYLON.Color3(1, 1, 1);

    const TOURNAMENTSTAGE_MAP = ["Round 1", "Round 2", "Finals"];

    let arenaHeight: 30 | 40 = 30;
    let paddleCount: 2 | 4 = 2;

    let canvas = $state<HTMLCanvasElement>();
    let engine = $state<BABYLON.Engine>();
    let scene = $state<BABYLON.Scene>();

    let gameState = $state<GameState | null>(null);
    let tournamentStage = $state<number | null>(null);

    let ground = $state<BABYLON.Mesh>();
    let paddles = $state<BABYLON.Mesh[]>();
    let ball = $state<BABYLON.Mesh>();
    let ballLight = $state<BABYLON.PointLight>();

    let topBorder = $state<BABYLON.Mesh>();
    let bottomBorder = $state<BABYLON.Mesh>();

    const popout = getContext<Popout>("popout");
    let hasAutoClosedPopout = false;
    onMount(() => {
        (async () => {
            client.game.listen.subscribe(gameId, {
                onData: (data) => {
                    const isGameJustStarting = !gameState && data;

                    if (!gameState) {
                        gameState = data;
                        run();
                    }

                    if (
                        isGameJustStarting &&
                        popout?.shown &&
                        !hasAutoClosedPopout
                    ) {
                        popout.hide();
                        hasAutoClosedPopout = true;
                    }

                    gameState = data;
                },
                onError: (error) => {
                    console.error(error);
                },
            });

            const tournamentPlayer =
                await client.game.tournamentPlayer.query(gameId);
            if (tournamentPlayer) {
                tournamentStage = tournamentPlayer.score;
            }

            if (!gameState) {
                return;
            }
        })();
    });

    function run() {
        if (!canvas) return;

        if (gameState?.players.length === 4) {
            paddleCount = 4;
            arenaHeight = 40;
        } else {
            paddleCount = 2;
            arenaHeight = 30;
        }

        initBabylon();
        if (!engine || !scene) return;

        engine.runRenderLoop(() => {
            updateScene();
            scene?.render();
        });

        return () => {
            engine?.dispose();
        };
    }

    function initBabylon() {
        if (!canvas) return;
        engine = new BABYLON.Engine(canvas, true);
        scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        // const axes = new BABYLON.Debug.AxesViewer(scene, 2);

        const mirrorMaterial = new BABYLON.StandardMaterial(
            "mirrorMaterial",
            scene,
        );
        mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture(
            "mirror",
            512,
            scene,
            true,
        );
        mirrorMaterial.reflectionTexture.level = 1;
        ground = BABYLON.MeshBuilder.CreatePlane(
            "MirrorMesh",
            { width: 200, height: 200 },
            scene,
        );
        ground.position.z = 0.5;
        ground.material = mirrorMaterial;
        const camera = new BABYLON.ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI * 0.75,
            50,
            BABYLON.Vector3.Zero(),
            scene,
        );
        camera.attachControl(canvas, true);

        const neonMaterial = new BABYLON.StandardMaterial(
            "neonMaterial",
            scene,
        );
        neonMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        if (paddleCount === 2) {
            initBorders();
            console.log("paddleCount", paddleCount);
        }
        if (paddleCount === 4) {
            initFourPlayerArena();
            console.log("paddleCount", paddleCount);
        }

        const createDashedLine = () => {
            const dashCount = 15;
            const dashHeight = 1;
            const gap = 1;

            for (let i = 0; i < dashCount; i++) {
                const dash = BABYLON.MeshBuilder.CreateBox(
                    "dash",
                    {
                        height: dashHeight,
                        width: 0.5,
                        depth: 0.1,
                    },
                    scene,
                );
                dash.position.y =
                    (i - dashCount / 2) * (dashHeight + gap) + 0.5;
                dash.material = neonMaterial.clone("dashMaterial");
            }
        };

        if (paddleCount === 2) createDashedLine();

        neonMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

        const createPaddles = () => {
            if (!scene) return;
            const paddles = [];
            for (let i = 0; i < paddleCount; i++) {
                const paddle = BABYLON.MeshBuilder.CreateBox(
                    `paddle${i}`,
                    {
                        width: PADDLE_WIDTH,
                        height: PADDLE_LENGTH,
                        depth: PADDLE_WIDTH,
                    },
                    scene,
                );
                paddle.material = neonMaterial;
                paddles.push(paddle);
            }
            return paddles;
        };
        paddles = createPaddles();

        if (!paddles) return;
        paddles[0].position.x = -ARENA_WIDTH / 2 - 0.5;
        paddles[1].position.x = ARENA_WIDTH / 2 + 0.5;

        if (paddleCount === 4) {
            paddles[2].position.y = arenaHeight / 2 + 0.5;
            paddles[2].rotate(BABYLON.Axis.Z, Math.PI / 2);
            paddles[3].position.y = -arenaHeight / 2 - 0.5;
            paddles[3].rotate(BABYLON.Axis.Z, Math.PI / 2);
        }
        const ballMaterial = new BABYLON.StandardMaterial(
            "ballMaterial",
            scene,
        );
        ballMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
        ballMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);

        ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
        ball.position = BABYLON.Vector3.Zero();
        ball.material = ballMaterial;

        ballLight = new BABYLON.PointLight("ballLight", ball.position, scene);
        ballLight.diffuse = new BABYLON.Color3(1, 0, 0);
        ballLight.intensity = 0.5;
    }

    function initFourPlayerArena() {
        if (!scene) return;
        const borderMaterial = new BABYLON.StandardMaterial("borderMat", scene);
        borderMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        borderMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);

        const borderThickness = 2;
        const borderDepth = 1;

        const playerBorders = [
            createBorder(
                new BABYLON.Vector3(
                    -ARENA_WIDTH / 2 - borderThickness / 2 - 1,
                    0,
                    0,
                ),
                new BABYLON.Vector3(
                    borderThickness,
                    arenaHeight + 2,
                    borderDepth,
                ),
                COLOR_ARRAY[0],
            ),
            createBorder(
                new BABYLON.Vector3(
                    ARENA_WIDTH / 2 + borderThickness / 2 + 1,
                    0,
                    0,
                ),
                new BABYLON.Vector3(
                    borderThickness,
                    arenaHeight + 2,
                    borderDepth,
                ),
                COLOR_ARRAY[1],
            ),
            createBorder(
                new BABYLON.Vector3(
                    0,
                    arenaHeight / 2 + borderThickness / 2 + 1,
                    0,
                ),
                new BABYLON.Vector3(
                    ARENA_WIDTH + 2,
                    borderThickness,
                    borderDepth,
                ),
                COLOR_ARRAY[2],
            ),
            createBorder(
                new BABYLON.Vector3(
                    0,
                    -arenaHeight / 2 - borderThickness / 2 - 1,
                    0,
                ),
                new BABYLON.Vector3(
                    ARENA_WIDTH + 2,
                    borderThickness,
                    borderDepth,
                ),
                COLOR_ARRAY[3],
            ),
        ];

        const createCorner = (
            position: BABYLON.Vector3,
            size: BABYLON.Vector3,
        ) => {
            const corner = BABYLON.MeshBuilder.CreateBox(
                "corner",
                { width: size.x, height: size.y, depth: size.z },
                scene,
            );
            corner.position = position;
            corner.material = borderMaterial;
            return corner;
        };

        const cornerSize = new BABYLON.Vector3(2, 2, 1);
        for (let i = 0; i < 4; i++) {
            createCorner(
                new BABYLON.Vector3(
                    i % 2 === 0 ? ARENA_WIDTH / 2 + 2 : -ARENA_WIDTH / 2 - 2,
                    i < 2 ? arenaHeight / 2 + 2 : -arenaHeight / 2 - 2,
                    0,
                ),
                cornerSize,
            );
        }
    }

    function createBorder(
        position: BABYLON.Vector3,
        size: BABYLON.Vector3,
        color: BABYLON.Color3,
    ): BABYLON.Mesh {
        const borderMat = new BABYLON.StandardMaterial("BorderMat", scene);
        borderMat.emissiveColor = color;
        borderMat.diffuseColor = color;

        const border = BABYLON.MeshBuilder.CreateBox(
            "Border",
            { width: size.x, height: size.y, depth: size.z },
            scene,
        );
        border.position = position;
        border.material = borderMat;
        return border;
    }

    function initBorders() {
        if (!scene) return;
        const borderMaterial = new BABYLON.StandardMaterial("borderMat", scene);
        borderMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // White glow
        borderMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black base

        topBorder = createBorder(
            new BABYLON.Vector3(0, arenaHeight / 2 + 0.5, 0),
            new BABYLON.Vector3(43, 1, 1),
            COLOR_WHITE,
        );

        bottomBorder = createBorder(
            new BABYLON.Vector3(0, -arenaHeight / 2 - 0.5, 0),
            new BABYLON.Vector3(43, 1, 1),
            COLOR_WHITE,
        );
    }

    function updateScene() {
        if (!gameState || !paddles || !ball || !ballLight) return;

        for (let i = 0; i < paddles.length; i++) {
            const paddle = paddles[i];
            const player = gameState.players[i];
            if (!player) continue;
            const axis = player.movementAxis === "x" ? axisX : axisY;
            if (axis === axisX) {
                paddle.position.x = player.position[axis];
            } else {
                paddle.position.y = player.position[axis];
            }
        }
        ball.position.x = gameState.ball.pos[axisX];
        ball.position.y = gameState.ball.pos[axisY];
        ballLight.position = ball.position;
        if (!gameState.ball.lastHit) return;
        const colorIndex = gameState.players.findIndex(
            (player: Player) =>
                gameState && player.id === gameState.ball.lastHit,
        );
        const newcolor = COLOR_ARRAY[colorIndex];
        if (newcolor === ballLight.diffuse) return;
        console.log("player", gameState.ball.lastHit);
        console.log("colorIndex", colorIndex);
        const newMaterial = new BABYLON.StandardMaterial("ballMaterial", scene);
        newMaterial.emissiveColor = newcolor;
        newMaterial.diffuseColor = newcolor;
        ball.material = newMaterial;
        ballLight.diffuse = newcolor;
    }
</script>

<svelte:window onresize={() => engine?.resize()} />

<div
    class="absolute top-0 left-0 right-0 flex flex-row justify-center items-center p-4 gap-4 text-white text-xl font-mono z-10"
>
    {#each (gameState?.players ?? []).slice(0, (gameState?.players?.length ?? 0) / 2) as player, i}
        <!-- <div class="mt-8">
			<ScoreCard userId={player.id} score={player.score} />
		</div> -->
        <ScoreCard
            userId={player.id}
            score={player.score}
            color={{
                r: COLOR_ARRAY[i].r,
                g: COLOR_ARRAY[i].g,
                b: COLOR_ARRAY[i].b,
            }}
        />
    {/each}

    <div class="mx-8 mt-5 mb-20">
        {#if tournamentStage !== null}
            <div
                class="absolute top-0 left-0 right-0 flex flex-row justify-center items-center p-4 gap-4 text-white text-xl font-mono z-10"
            >
                <div class="mt-8">
                    <h2 class="text-2xl font-bold">
                        {TOURNAMENTSTAGE_MAP[tournamentStage]}
                    </h2>
                </div>
            </div>
        {:else}
            {@render header((gameState?.players?.length ?? 0) === 4 ? 4 : 2)}

            {#snippet header(paddleCount: number)}
                <h2
                    class="hidden sm:block text-4xl md:text-5xl font-extrabold uppercase tracking-wider text-white text-center retro-glow-static select-none"
                >
                    {#each Array(paddleCount) as _, i}
                        <span>1</span>{#if i < paddleCount - 1}<span
                                class="text-2xl font-normal text-gray-400"
                            >
                                {" "}vs{" "}
                            </span>{/if}
                    {/each}
                </h2>
            {/snippet}
        {/if}
    </div>

    {#each (gameState?.players ?? []).slice((gameState?.players?.length ?? 0) / 2) as player, j}
        <ScoreCard
            userId={player.id}
            score={player.score}
            color={{
                r: COLOR_ARRAY[j + (gameState?.players?.length ?? 0) / 2].r,
                g: COLOR_ARRAY[j + (gameState?.players?.length ?? 0) / 2].g,
                b: COLOR_ARRAY[j + (gameState?.players?.length ?? 0) / 2].b,
            }}
        />
    {/each}
</div>

{#if gameState?.status === "finished" && gameState.winner}
    <div class="absolute inset-0 grid place-items-center bg-black/80 z-20">
        <div class="text-center">
            <h2 class="text-6xl text-white mb-8 animate-pulse">
                <WinnerCard userId={gameState.winner} />
            </h2>
            {#if tournamentStage !== null && tournamentStage !== 2 && gameState.winner === user.data?.id}
                <h2 class="text-4xl text-white mb-8 animate-pulse">
                    Waiting for next round...
                </h2>
            {:else}
                <button
                    onclick={() => goto("/stats")}
                    class="px-8 py-4 text-2xl bg-transparent border-2 border-white/50 rounded-lg
            text-white hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                    Back to Stats
                </button>
            {/if}
        </div>
    </div>
{/if}

<canvas bind:this={canvas} class="z-0 absolute top-0 left-0 w-full h-full"
></canvas>

<style :global()>
    .retro-glow-static {
        text-shadow:
            0 0 8px #0ff,
            0 0 16px #0ff,
            0 0 24px #f0f,
            0 0 32px #f0f;
    }
</style>
