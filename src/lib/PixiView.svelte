<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';

	let canvas: HTMLCanvasElement;
	export let applicationOptions: PIXI.IRendererOptions;
	export let renderer: PIXI.Renderer;

	onMount(() => {
		const options = Object.assign(
			{
				backgroundColor: null,
				resolution: window.devicePixelRatio || 1,
				view: canvas
			},
			applicationOptions
		);

		renderer = new PIXI.Renderer(options);

		resizeCanvas();
		canvas.addEventListener('resize', () => {
			resizeCanvas();
		});
	});

	const resizeCanvas = () => {
		const box = canvas.getBoundingClientRect();
		renderer.resize(box.width, box.height);
	};

	const goFullscreen = (background = false) => {
		canvas.style.position = 'fixed';
		canvas.style.top = '0px';
		canvas.style.left = '0px;';
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.style.zIndex = `${background ? -100 : 100}`;
	};

	const goDefaultView = () => {
		canvas.style.position = 'unset';
		canvas.style.top = 'unset';
		canvas.style.left = 'unset';
		canvas.style.width = `100%`;
		canvas.style.height = `100%`;
		canvas.style.zIndex = `1`;
		const box = canvas.getBoundingClientRect();
		canvas.width = box.width;
		canvas.height = box.height;
	};
</script>

<pixiWrapper>
	<canvasBox>
		<canvas bind:this={canvas} />
	</canvasBox>
	<resizeButtons>
		<b>Resize: </b>
		<button on:click={() => goDefaultView()}>Small (default)</button>
		<button on:click={() => goFullscreen()}>Fullscreen</button>
		<button on:click={() => goFullscreen(true)}>Fullscreen Background</button>
	</resizeButtons>
</pixiWrapper>

<style lang="postcss">
	canvasBox {
		max-width: 800px;
		height: 500px;
		display: block;
	}
	canvas {
		width: 100%;
		height: 100%;
	}
	pixiWrapper {
		@apply flex flex-col;
	}
	button {
		@apply ml-4 p-2 rounded-lg text-xs font-bold;
	}
	resizeButtons {
		z-index: 99999;
		@apply absolute flex items-center mt-4 ml-4;
	}
</style>
