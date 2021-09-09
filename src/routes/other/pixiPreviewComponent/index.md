---
title: Pixi.js preview component
category: Other
---

<script lang="ts">
    import Example from './_PixiViewExample.svelte'

</script>

<Example/>
<h2 class="text-light font-medium mt-8">{category}</h2>
<h1>{title}</h1>

Simple Svelte component consisting of Pixi.JS powered canvas.

```ts
<script lang="ts">
	import PixiView from '$lib/PixiView.svelte';
	import { squareGrid } from '$lib/pixiUtil/pixiBackgrounds';
	import { onMount } from 'svelte';
	import * as PIXI from 'pixi.js';

	let mainScene = new PIXI.Container();
	let renderer: PIXI.Renderer;

	let applicationOptions: PIXI.IRendererOptions = {
		antialias: true,
		backgroundColor: 0x222222
	};

	const texture = PIXI.Texture.from('/assets/meeple.png');

	const meeple = new PIXI.Sprite(texture);
	meeple.anchor.set(0.5);
	const grid = squareGrid(48, { color: 0x444444, width: 1 });

	function start() {
		mainScene.addChild(grid.graphics);
		mainScene.addChild(meeple);
	}

	const fps = 60;
	let lastFrame = 0;
	const step = (time: number = 0) => {
		const delta = time - lastFrame;
		lastFrame = time;
		meeple.x = renderer.options.width / 2;
		meeple.y = renderer.options.height / 2;
		meeple.rotation += 0.001 * delta;
		grid.draw();

		renderer.render(mainScene);
		requestAnimationFrame(step);
	};

	onMount(async () => {
		await start();
		step();
	});
</script>

<PixiView bind:applicationOptions bind:renderer />

```
