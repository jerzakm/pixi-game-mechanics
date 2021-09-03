<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';

	let canvas: HTMLCanvasElement;
	export let mainScene = new PIXI.Container();
	export let step: Function;
	export let app: PIXI.Application;
	export let applicationOptions;

	onMount(() => {
		const options = Object.assign(
			{
				width: 800,
				height: 600,
				backgroundColor: null,
				transparent: true,
				resolution: window.devicePixelRatio || 1,
				view: canvas
			},
			applicationOptions
		);

		app = new PIXI.Application(options);

		app.stage.addChild(mainScene);

		// Listen for animate update
		app.ticker.add((delta) => {
			if (step) step(delta);
		});
	});
</script>

<canvas bind:this={canvas} />
