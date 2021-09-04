<script lang="ts">
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';

	let canvas: HTMLCanvasElement;
	export let applicationOptions: PIXI.IRendererOptions;
	export let renderer: PIXI.Renderer;

	enum PixiViewMode {
		NORMAL = 'NORMAL',
		FULL = 'FULL',
		FULL_BG = 'FULL_BG'
	}

	let viewMode: PixiViewMode = PixiViewMode.NORMAL;

	const setView = (view: PixiViewMode) => {
		localStorage.setItem('experiments_pixiViewMode', view);
		viewMode = view;
		renderer && handleResize();
	};

	const getView = () => {
		return localStorage.getItem('experiments_pixiViewMode');
	};

	onMount(() => {
		switch (viewMode) {
			case PixiViewMode.FULL:
				goFullscreen();
				break;
			case PixiViewMode.FULL_BG:
				goFullscreenBackground();
				break;
			case PixiViewMode.NORMAL:
				goDefaultView();
				break;
			default:
				console.log('unsupported viewmode?', viewMode);
				break;
		}

		const options = Object.assign(
			{
				backgroundColor: null,
				resolution: window.devicePixelRatio || 1,
				view: canvas
			},
			applicationOptions
		);

		renderer = new PIXI.Renderer(options);

		canvas.addEventListener('resize', () => {
			handleResize();
		});
		window.addEventListener('resize', () => {
			handleResize();
		});

		viewMode = getView() ? PixiViewMode[getView()] : PixiViewMode.NORMAL;
		handleResize();
	});

	const handleResize = () => {
		const box = canvas.getBoundingClientRect();
		renderer.resize(box.width, box.height);
	};

	const goFullscreen = () => {
		canvas.style.position = 'absolute';
		canvas.style.top = '0px';
		canvas.style.left = '0px';
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.style.zIndex = `100`;
		setView(PixiViewMode.FULL);
	};

	const goFullscreenBackground = () => {
		canvas.style.position = 'absolute';
		canvas.style.top = '0px';
		canvas.style.left = '0px';
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.style.zIndex = `-100`;
		setView(PixiViewMode.FULL_BG);
	};

	const goDefaultView = () => {
		canvas.style.position = 'unset';
		canvas.style.top = 'unset';
		canvas.style.left = 'unset';
		const box = canvas.getBoundingClientRect();
		canvas.style.width = `100%`;
		canvas.style.height = `unset`;
		canvas.style.zIndex = `1`;
		canvas.width = box.width;
		canvas.height = box.height;
		setView(PixiViewMode.NORMAL);
	};
</script>

<pixiWrapper>
	<canvasBox>
		<canvas bind:this={canvas} />
	</canvasBox>
	<resizeButtons>
		<b>Resize: </b>
		<button
			class={`${viewMode == PixiViewMode.NORMAL ? 'bg-primary' : ''}`}
			on:click={() => goDefaultView()}>Small (default)</button
		>
		<button
			class={`${viewMode == PixiViewMode.FULL ? 'bg-primary' : ''}`}
			on:click={() => goFullscreen()}>Fullscreen</button
		>
		<button
			class={`${viewMode == PixiViewMode.FULL_BG ? 'bg-primary' : ''}`}
			on:click={() => goFullscreenBackground()}>Fullscreen Background</button
		>
	</resizeButtons>
</pixiWrapper>

<style lang="postcss">
	canvasBox {
		width: 100%;
		max-height: 50vh;
		@apply flex items-stretch;
	}
	canvas {
		@apply max-h-full max-w-full;
	}
	pixiWrapper {
		align-items: end;
		justify-items: stretch;
		@apply flex flex-col;
	}
	button {
		@apply ml-2;
	}
	resizeButtons {
		z-index: 99999;

		@apply fixed flex mt-4 mr-8;
	}
</style>
