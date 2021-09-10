<script lang="ts">
	import PixiView from '$lib/PixiView.svelte';
	import { squareGrid } from '$lib/pixiUtil/pixiBackgrounds';
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';
	import { initializeBox2D } from './physics/box2d';

	let mainScene = new PIXI.Container();
	let renderer: PIXI.Renderer;

	let applicationOptions: PIXI.IRendererOptions = {
		antialias: true,
		backgroundColor: 0x222222
	};

	const grid = squareGrid(48, { color: 0x444444, width: 1 });

	function start() {
		mainScene.addChild(grid.graphics);
		initializeBox2D('/libraries/');
		const pixelsPerMeter = 1;
	}

	const fps = 60;
	let lastFrame = 0;
	const step = (time: number = 0) => {
		const delta = time - lastFrame;
		lastFrame = time;

		grid.draw();
		// world.step(delta);

		renderer.render(mainScene);
		requestAnimationFrame(step);
	};

	onMount(async () => {
		await start();
		step();
	});
</script>

<PixiView bind:applicationOptions bind:renderer />
